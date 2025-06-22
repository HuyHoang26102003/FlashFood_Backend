import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, FindOptionsWhere, In } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AddressBook } from 'src/address_book/entities/address_book.entity';
import { FoodCategory } from 'src/food_categories/entities/food_category.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { createClient } from 'redis';

const logger = new Logger('CustomersRepository');

// FIXED: Improved Redis connection handling with timeout and error handling
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 5000, // 5 second timeout
    reconnectStrategy: retries => {
      if (retries > 3) {
        logger.warn(
          'Redis connection failed after multiple attempts, giving up'
        );
        return new Error('Redis connection failed');
      }
      return Math.min(retries * 100, 3000); // Increasing backoff
    }
  }
});

// Track Redis connection state
let redisConnected = false;

// Connect to Redis with proper error handling
redis
  .connect()
  .then(() => {
    redisConnected = true;
    logger.log('Redis connected successfully');
  })
  .catch(err => {
    redisConnected = false;
    logger.error('Redis connection error:', err);
  });

// Handle disconnection events
redis.on('error', err => {
  redisConnected = false;
  logger.error('Redis error:', err);
});

redis.on('connect', () => {
  redisConnected = true;
  logger.log('Redis connected');
});

// Safe Redis operations that won't hang
async function safeRedisGet(key: string): Promise<string | null> {
  if (!redisConnected) return null;
  try {
    return await Promise.race([
      redis.get(key),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Redis operation timed out')), 1000)
      )
    ]);
  } catch (error) {
    logger.warn(`Redis get operation failed for key ${key}:`, error);
    return null;
  }
}

async function safeRedisSet(
  key: string,
  value: string,
  ttl: number
): Promise<void> {
  if (!redisConnected) return;
  try {
    await Promise.race([
      redis.setEx(key, ttl, value),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis operation timed out')), 1000)
      )
    ]);
  } catch (error) {
    logger.warn(`Redis set operation failed for key ${key}:`, error);
  }
}

async function safeRedisDelete(key: string): Promise<void> {
  if (!redisConnected) return;
  try {
    await Promise.race([
      redis.del(key),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis operation timed out')), 1000)
      )
    ]);
  } catch (error) {
    logger.warn(`Redis del operation failed for key ${key}:`, error);
  }
}

@Injectable()
export class CustomersRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(AddressBook)
    private readonly addressRepository: Repository<AddressBook>,
    @InjectRepository(FoodCategory)
    private readonly foodCategoryRepository: Repository<FoodCategory>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly dataSource: DataSource
  ) {}

  async save(customer: Customer): Promise<Customer> {
    const savedCustomer = await this.customerRepository.save(customer);

    // Clear cache in background without blocking the response
    Promise.all([
      this.clearCacheKey(`customer:${customer.id}`),
      this.clearCacheKey(`customer:user:${customer.user_id}`)
    ]).catch(cacheError => {
      logger.warn('Cache clear error (non-blocking):', cacheError);
    });

    return savedCustomer;
  }

  private async clearCacheKey(key: string): Promise<void> {
    try {
      if (redis.isReady) {
        await redis.del(key);
      }
    } catch (error) {
      logger.warn(`Failed to clear cache key ${key}:`, error);
    }
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const {
      address_ids = [],
      preferred_category_ids = [],
      favorite_restaurant_ids = [],
      ...customerData
    } = createCustomerDto;

    const customer = new Customer();
    Object.assign(customer, {
      ...customerData,
      address: [],
      preferred_category: [],
      favorite_restaurants: [],
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000)
    });

    if (address_ids.length > 0) {
      const addresses = await this.addressRepository.findBy({
        id: In(address_ids)
      });
      customer.address = addresses;
    }

    if (preferred_category_ids.length > 0) {
      const categories = await this.foodCategoryRepository.findBy({
        id: In(preferred_category_ids)
      });
      customer.preferred_category = categories;
    }

    if (favorite_restaurant_ids.length > 0) {
      const restaurants = await this.restaurantRepository.findBy({
        id: In(favorite_restaurant_ids)
      });
      customer.favorite_restaurants = restaurants;
    }

    return await this.customerRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return await this.customerRepository.find({
      select: {
        id: true,
        user_id: true,
        first_name: true,
        last_name: true,
        avatar: true,
        last_login: true,
        user: {
          email: true
        }
      },
      relations: ['user'],
      loadEagerRelations: true
    });
  }

  async findById(customerId: string): Promise<Customer | null> {
    return this.dataSource
      .createQueryBuilder(Customer, 'customer')
      .leftJoinAndSelect('customer.address', 'address')
      .leftJoinAndSelect('customer.preferred_category', 'preferred_category') // Added to load preferred_category
      .where('customer.id = :customerId', { customerId })
      .getOne();
  }
  async findByIdWithFavoriterRestaurants(
    customerId: string
  ): Promise<Customer | null> {
    return this.dataSource
      .createQueryBuilder(Customer, 'customer')
      .leftJoinAndSelect('customer.favorite_restaurants', 'favoriteRestaurants')
      .where('customer.id = :customerId', { customerId })
      .getOne();
  }

  async findByUserId(userId: string): Promise<Customer> {
    const cacheKey = `customer:user:${userId}`;

    try {
      // Use safe Redis get that won't hang
      const cached = await safeRedisGet(cacheKey);
      if (cached) {
        logger.log('Returning customer from cache');
        return JSON.parse(cached);
      }
    } catch (cacheError) {
      logger.warn('Redis cache read error:', cacheError);
      // Continue to database query if cache fails
    }

    logger.log('Fetching customer from database for userId:', userId);
    const startTime = Date.now();

    try {
      const customer = await this.customerRepository.findOne({
        where: { user_id: userId },
        // Removed relations to speed up the query for login
        relations: ['address']
      });

      const queryTime = Date.now() - startTime;
      logger.log(
        `Database query completed in ${queryTime}ms for userId: ${userId}`
      );

      return await this.handleCustomerResult(customer, cacheKey, queryTime);
    } catch (dbError) {
      const queryTime = Date.now() - startTime;
      logger.error(
        `Database query failed after ${queryTime}ms for userId: ${userId}`,
        dbError
      );
      throw dbError;
    }
  }

  private async handleCustomerResult(
    customer: Customer,
    cacheKey: string,
    queryTime: number
  ): Promise<Customer> {
    if (customer) {
      try {
        // Use safe Redis set that won't hang
        await safeRedisSet(cacheKey, JSON.stringify(customer), 3600);
        logger.log(`Customer cached successfully (query took ${queryTime}ms)`);
      } catch (cacheError) {
        logger.warn('Redis cache write error:', cacheError);
        // Don't fail if caching fails
      }
    }

    logger.log(
      `Returning customer from database (${queryTime}ms):`,
      customer ? 'Found' : 'Not found'
    );
    return customer;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto
  ): Promise<Customer> {
    const customer = await this.findById(id);
    if (!customer) {
      return null;
    }

    const {
      address_ids,
      preferred_category_ids,
      favorite_restaurant_ids,
      ...updateData
    } = updateCustomerDto;

    if (address_ids?.length) {
      const addresses = await this.addressRepository.findBy({
        id: In(address_ids)
      });
      customer.address = addresses;
    }

    if (preferred_category_ids?.length) {
      const categories = await this.foodCategoryRepository.findBy({
        id: In(preferred_category_ids)
      });
      customer.preferred_category = categories;
    }

    if (favorite_restaurant_ids?.length) {
      const restaurants = await this.restaurantRepository.findBy({
        id: In(favorite_restaurant_ids)
      });
      customer.favorite_restaurants = restaurants;
    }

    Object.assign(customer, updateData);
    customer.updated_at = Math.floor(Date.now() / 1000);

    const updatedCustomer = await this.customerRepository.save(customer);
    await safeRedisDelete(`customer:${id}`);
    await safeRedisDelete(`customer:user:${customer.user_id}`);
    return updatedCustomer;
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findById(id);
    await this.customerRepository.delete(id);
    if (customer) {
      await safeRedisDelete(`customer:${id}`);
      await safeRedisDelete(`customer:user:${customer.user_id}`);
    }
  }

  async findOneBy(conditions: Partial<Customer>): Promise<Customer | null> {
    return await this.customerRepository.findOne({
      where: conditions as unknown as FindOptionsWhere<Customer>,
      select: ['id', 'user_id']
    });
  }

  async findAllPaginated(
    skip: number,
    limit: number
  ): Promise<[Customer[], number]> {
    return await this.customerRepository.findAndCount({
      skip,
      take: limit,
      relations: ['user']
    });
  }
}
