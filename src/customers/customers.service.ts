import { Injectable, Logger } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import {
  ToggleCustomerFavoriteRestaurantDto,
  UpdateCustomerDto
} from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';
import { createResponse, ApiResponse } from 'src/utils/createResponse';
import { UserRepository } from '../users/users.repository';
// import { AddressBookRepository } from 'src/address_book/address_book.repository';
// import { FoodCategoriesRepository } from 'src/food_categories/food_categories.repository';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantsRepository } from 'src/restaurants/restaurants.repository';
import { CustomersRepository } from './customers.repository';
import { FoodCategory } from 'src/food_categories/entities/food_category.entity';
// import { OrdersRepository } from 'src/orders/orders.repository';
import { MenuItem } from 'src/menu_items/entities/menu_item.entity';
import { DataSource, ILike, In, Raw } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { NotificationsRepository } from 'src/notifications/notifications.repository';
import { RatingsReview } from 'src/ratings_reviews/entities/ratings_review.entity';
export interface AddressPopulate {
  id?: string;
  street?: string;
  city?: string;
  postal_code?: number;
  location?: {
    lat?: number;
    lng?: number;
  };
}
import { createClient } from 'redis';
import * as dotenv from 'dotenv';
import { RedisService } from 'src/redis/redis.service';

dotenv.config();

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redis.connect().catch(err => logger.error('Redis connection error:', err));

const logger = new Logger('CustomersService');
@Injectable()
export class CustomersService {
  constructor(
    private readonly restaurantRepository: RestaurantsRepository,
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
    private readonly customerRepository: CustomersRepository,
    private readonly notificationsRepository: NotificationsRepository,
    private readonly redisService: RedisService // Thêm RedisService
  ) {}

  async onModuleInit() {
    // Preload restaurants phổ biến vào Redis
    try {
      const start = Date.now();
      const restaurants = await this.restaurantRepository.repository.find({
        select: ['id'],
        take: 10 // Top 1000 restaurants
      });
      for (const restaurant of restaurants) {
        const cacheKey = `restaurant:${restaurant.id}`;
        await redis.setEx(
          cacheKey,
          86400,
          JSON.stringify({ id: restaurant.id })
        );
      }
      logger.log(
        `Preloaded ${restaurants.length} restaurants into Redis in ${Date.now() - start}ms`
      );
    } catch (error: any) {
      logger.error('Error preloading restaurants into Redis:', error);
    }
  }

  async create(
    createCustomerDto: CreateCustomerDto
  ): Promise<ApiResponse<Customer>> {
    try {
      const existingUser = await this.userRepository.findById(
        createCustomerDto.user_id
      );
      if (!existingUser) {
        return createResponse('NotFound', null, 'User not found');
      }

      const existingCustomer = await this.customerRepository.findByUserId(
        createCustomerDto.user_id
      );
      if (existingCustomer) {
        return createResponse(
          'DuplicatedRecord',
          null,
          'Customer with this user ID already exists'
        );
      }

      const newCustomer =
        await this.customerRepository.create(createCustomerDto);
      return createResponse('OK', newCustomer, 'Customer created successfully');
    } catch (error: any) {
      console.error('Error creating customer:', error);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while creating the customer'
      );
    }
  }

  async searchRestaurantsByKeyword(
    keyword: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<Restaurant[]>> {
    try {
      // Chuẩn hóa keyword: loại bỏ khoảng trắng thừa và chuyển thành lowercase
      const searchKeyword = keyword.trim().toLowerCase();

      // 1. Tìm restaurant theo restaurant_name
      const restaurantsByName = await this.restaurantRepository.repository.find(
        {
          where: {
            restaurant_name: ILike(`%${searchKeyword}%`) // Sử dụng ILike thay cho $ilike
          },
          relations: ['specialize_in', 'address'] // Populate specialize_in và address
        }
      );

      // 2. Tìm FoodCategory theo name
      const foodCategories = await this.dataSource
        .getRepository(FoodCategory)
        .find({
          where: {
            name: ILike(`%${searchKeyword}%`) // Sử dụng ILike
          }
        });

      // Lấy danh sách category IDs
      const categoryIds = foodCategories.map(category => category.id);

      // 3. Tìm restaurant theo specialize_in (FoodCategory)
      const restaurantsByCategory =
        categoryIds.length > 0
          ? await this.restaurantRepository.repository.find({
              where: {
                specialize_in: { id: In(categoryIds) } // Sử dụng In
              },
              relations: ['specialize_in', 'address']
            })
          : [];

      // 4. Kết hợp và loại bỏ trùng lặp, áp dụng phân trang
      const combinedRestaurants = [
        ...restaurantsByName,
        ...restaurantsByCategory
      ];
      const uniqueRestaurantsMap = new Map(
        combinedRestaurants.map(r => [r.id, r])
      );
      const uniqueRestaurants = Array.from(uniqueRestaurantsMap.values());
      const skip = (page - 1) * limit;
      const paginatedRestaurants = uniqueRestaurants.slice(skip, skip + limit);

      // 5. Trả về kết quả
      return createResponse(
        'OK',
        paginatedRestaurants,
        `Found ${paginatedRestaurants.length} restaurants matching keyword "${keyword}" (total: ${uniqueRestaurants.length})`
      );
    } catch (error: any) {
      console.error('Error searching restaurants:', error);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while searching restaurants'
      );
    }
  }

  async findAll(): Promise<ApiResponse<Customer[]>> {
    const cacheKey = 'customers:all';
    const ttl = 300; // Cache 5 minutes (300 seconds)
    const start = Date.now();

    try {
      // Check cache first
      const cacheStart = Date.now();
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        logger.log(
          `Fetched customers from cache in ${Date.now() - cacheStart}ms`
        );
        logger.log(`Total time (cache): ${Date.now() - start}ms`);
        return createResponse(
          'OK',
          JSON.parse(cachedData),
          'Fetched customers from cache successfully'
        );
      }
      logger.log(`Cache miss for ${cacheKey}`);

      // Fetch from database
      const customers = await this.customerRepository.findAll();

      // Store in cache
      const cacheSaveStart = Date.now();
      const cacheSaved = await this.redisService.setNx(
        cacheKey,
        JSON.stringify(customers),
        ttl * 1000
      );
      if (cacheSaved) {
        logger.log(
          `Stored customers in cache: ${cacheKey} (took ${Date.now() - cacheSaveStart}ms)`
        );
      } else {
        logger.warn(`Failed to store customers in cache: ${cacheKey}`);
      }

      logger.log(`Total DB fetch and processing took ${Date.now() - start}ms`);
      return createResponse('OK', customers, 'Fetched all customers');
    } catch (error: any) {
      logger.error('Error fetching customers:', error);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while fetching customers'
      );
    }
  }

  async findCustomerById(id: string): Promise<ApiResponse<any>> {
    const cacheKey = `customer:${id}`;
    const ttl = 300; // Cache 5 minutes (300 seconds)
    const start = Date.now();

    try {
      // Check cache first
      const cacheStart = Date.now();
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        logger.log(
          `Fetched customer from cache in ${Date.now() - cacheStart}ms`
        );
        logger.log(`Total time (cache): ${Date.now() - start}ms`);
        return createResponse(
          'OK',
          JSON.parse(cachedData),
          'Fetched customer from cache successfully'
        );
      }
      logger.log(`Cache miss for ${cacheKey}`);

      // Fetch from database
      const customer = await this.customerRepository.findById(id);
      if (!customer) {
        return createResponse('NotFound', null, 'Customer not found');
      }

      const user = await this.userRepository.findById(customer.user_id);
      if (!user) {
        return createResponse('NotFound', null, 'User not found');
      }

      const customerWithUserData = {
        ...customer,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          is_verified: user.is_verified
        }
      };

      // Store in cache
      const cacheSaveStart = Date.now();
      const cacheSaved = await this.redisService.setNx(
        cacheKey,
        JSON.stringify(customerWithUserData),
        ttl * 1000
      );
      if (cacheSaved) {
        logger.log(
          `Stored customer in cache: ${cacheKey} (took ${Date.now() - cacheSaveStart}ms)`
        );
      } else {
        logger.warn(`Failed to store customer in cache: ${cacheKey}`);
      }

      logger.log(`Total DB fetch and processing took ${Date.now() - start}ms`);
      return createResponse(
        'OK',
        customerWithUserData,
        'Fetched customer and user data successfully'
      );
    } catch (error: any) {
      logger.error('Error fetching customer and user:', error);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while fetching the customer and user data'
      );
    }
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto
  ): Promise<ApiResponse<Customer>> {
    const start = Date.now();
    const timeout = 30000; // 30 second timeout

    try {
      // Wrap the entire operation in a timeout
      const updateOperation = this.performUpdate(id, updateCustomerDto, start);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error('Update operation timed out')),
          timeout
        );
      });

      return (await Promise.race([
        updateOperation,
        timeoutPromise
      ])) as ApiResponse<Customer>;
    } catch (error: any) {
      logger.error('Error updating customer:', error);
      return createResponse(
        'ServerError',
        null,
        `An error occurred while updating the customer: ${error.message}`
      );
    }
  }

  private async performUpdate(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
    start: number
  ): Promise<ApiResponse<Customer>> {
    const cacheKey = `customer:${id}`;
    const restaurantsCacheKey = `restaurants:customer:${id}`;
    let customer: Customer | null = null;

    // Try to get customer from cache first
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        customer = JSON.parse(cached);
        logger.log(`Fetch customer (cache) took ${Date.now() - start}ms`);
      }
    } catch (cacheError) {
      logger.warn('Redis cache read error, continuing with DB:', cacheError);
    }

    // If not in cache, get from database with timeout
    if (!customer) {
      const dbStart = Date.now();
      customer = (await Promise.race([
        this.customerRepository.findById(id),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database query timed out')), 10000)
        )
      ])) as Customer | null;
      logger.log(`Fetch customer from DB took ${Date.now() - dbStart}ms`);
    }

    if (!customer) {
      return createResponse('NotFound', null, 'Customer not found');
    }

    // Update customer data
    Object.assign(customer, updateCustomerDto);

    // Save to database with timeout
    const saveStart = Date.now();
    const updatedCustomer = (await Promise.race([
      this.customerRepository.save(customer),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database save timed out')), 15000)
      )
    ])) as Customer;
    logger.log(`Save customer took ${Date.now() - saveStart}ms`);

    // Update cache in background (don't wait for it)
    Promise.all([
      this.redisService.set(
        cacheKey,
        JSON.stringify(updatedCustomer),
        7200 * 1000
      ),
      this.redisService.del(restaurantsCacheKey)
    ]).catch(cacheError => {
      logger.warn('Cache update error (non-blocking):', cacheError);
    });

    logger.log(`Update customer took ${Date.now() - start}ms`);
    return createResponse(
      'OK',
      updatedCustomer,
      'Customer updated successfully'
    );
  }

  async toggleFavoriteRestaurant(
    id: string,
    toggleDto: ToggleCustomerFavoriteRestaurantDto
  ): Promise<ApiResponse<any>> {
    const start = Date.now();
    try {
      const restaurantId = toggleDto.favorite_restaurant;

      // Lấy customer từ cache hoặc DB
      const cacheKey = `customer:${id}`;
      let customer: Customer | null = null;
      let favoriteRestaurantIds: string[] = [];

      const fetchCustomerStart = Date.now();
      const cached = await redis.get(cacheKey);
      if (cached) {
        customer = JSON.parse(cached);
        favoriteRestaurantIds = (customer.favorite_restaurants || []).map(
          r => r.id
        );
        logger.log(
          `Fetch customer (cache) took ${Date.now() - fetchCustomerStart}ms`
        );
      } else {
        customer = await this.customerRepository.findById(id);
        if (customer) {
          favoriteRestaurantIds = (customer.favorite_restaurants || []).map(
            r => r.id
          );
          await redis.setEx(cacheKey, 7200, JSON.stringify(customer));
          logger.log(`Stored customer in Redis: ${cacheKey}`);
        }
        logger.log(`Fetch customer took ${Date.now() - fetchCustomerStart}ms`);
      }

      if (!customer) {
        return createResponse('NotFound', null, 'Customer not found');
      }

      // Kiểm tra restaurant từ cache hoặc DB
      const restaurantCacheKey = `restaurant:${restaurantId}`;
      let restaurantExists = false;

      const restaurantFetchStart = Date.now();
      const restaurantCached = await redis.get(restaurantCacheKey);
      if (restaurantCached) {
        restaurantExists = true;
        logger.log(
          `Fetch restaurant (cache) took ${Date.now() - restaurantFetchStart}ms`
        );
      } else {
        const restaurant = await this.dataSource
          .createQueryBuilder()
          .from('restaurants', 'restaurant')
          .where('restaurant.id = :id', { id: restaurantId })
          .select('1')
          .getRawOne();
        if (restaurant) {
          restaurantExists = true;
          await redis.setEx(
            restaurantCacheKey,
            86400,
            JSON.stringify({ id: restaurantId })
          );
          logger.log(`Stored restaurant in Redis: ${restaurantCacheKey}`);
        }
        logger.log(
          `Fetch restaurant took ${Date.now() - restaurantFetchStart}ms`
        );
      }

      if (!restaurantExists) {
        return createResponse('NotFound', null, 'Restaurant not found');
      }

      // Toggle favorite_restaurants
      let updatedFavoriteIds: string[];
      let isAdding = false;
      if (favoriteRestaurantIds.includes(restaurantId)) {
        updatedFavoriteIds = favoriteRestaurantIds.filter(
          id => id !== restaurantId
        );
        logger.log(`Removed restaurant ${restaurantId} from favorites`);
      } else {
        updatedFavoriteIds = [...favoriteRestaurantIds, restaurantId];
        isAdding = true;
        logger.log(`Added restaurant ${restaurantId} to favorites`);
      }

      // Cập nhật bảng customer_favorite_restaurants
      const updateStart = Date.now();
      if (isAdding) {
        await this.dataSource
          .createQueryBuilder()
          .insert()
          .into('customer_favorite_restaurants')
          .values({ customer_id: id, restaurant_id: restaurantId })
          .orIgnore()
          .execute();
      } else {
        await this.dataSource
          .createQueryBuilder()
          .delete()
          .from('customer_favorite_restaurants')
          .where(
            'customer_id = :customerId AND restaurant_id = :restaurantId',
            {
              customerId: id,
              restaurantId
            }
          )
          .execute();
      }
      logger.log(
        `Update favorite restaurants took ${Date.now() - updateStart}ms`
      );

      // Cập nhật cache và response
      const updatedCustomer = {
        ...customer,
        favorite_restaurants: updatedFavoriteIds.map(id => ({ id }))
      };
      await redis.setEx(cacheKey, 7200, JSON.stringify(updatedCustomer));

      logger.log(`Toggle favorite restaurant took ${Date.now() - start}ms`);
      return createResponse(
        'OK',
        updatedCustomer,
        'Favorite restaurant toggled successfully'
      );
    } catch (error: any) {
      logger.error('Error toggling favorite restaurant:', error);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while toggling favorite restaurant'
      );
    }
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    try {
      await this.customerRepository.remove(id);
      return createResponse('OK', null, 'Customer deleted successfully');
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while deleting the customer'
      );
    }
  }

  async updateEntityAvatar(
    uploadResult: { url: string; public_id: string },
    entityId: string
  ) {
    try {
      const customer = await this.customerRepository.findById(entityId);
      if (!customer) {
        return createResponse('NotFound', null, 'Customer not found');
      }

      const updateDto = new UpdateCustomerDto();
      updateDto.avatar = {
        url: uploadResult.url,
        key: uploadResult.public_id
      };

      const updatedCustomer = await this.customerRepository.update(
        entityId,
        updateDto
      );

      return createResponse(
        'OK',
        updatedCustomer,
        'Customer avatar updated successfully'
      );
    } catch (error: any) {
      console.error('Error updating customer avatar:', error);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while updating the customer avatar'
      );
    }
  }

  // Helper function to check if a restaurant is open based on the current time
  private isRestaurantOpen(restaurant: Restaurant): boolean {
    const currentDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = new Date().getHours() * 60 + new Date().getMinutes(); // Convert current time to minutes

    const openingHours = restaurant.opening_hours;
    const dayOfWeek = Object.keys(openingHours)[currentDay]; // Get the opening hours for today

    if (openingHours[dayOfWeek]) {
      const { from, to } = openingHours[dayOfWeek];
      return currentTime >= from && currentTime <= to;
    }
    return false;
  }

  // Trong file customers.service.ts
  async getFavoriteRestaurants(
    customerId: string
  ): Promise<ApiResponse<Restaurant[]>> {
    try {
      // Lấy thông tin customer dựa trên customerId
      const customer =
        await this.customerRepository.findByIdWithFavoriterRestaurants(
          customerId
        );
      if (!customer) {
        return createResponse('NotFound', null, 'Customer not found');
      }
      console.log('cehck what happen', customer.favorite_restaurants, customer);

      // Lấy danh sách favorite_restaurants từ customer
      const favoriteRestaurantIds = customer.favorite_restaurants.map(
        r => r.id
      );

      if (!favoriteRestaurantIds || favoriteRestaurantIds.length === 0) {
        return createResponse(
          'OK',
          [],
          'No favorite restaurants found for this customer'
        );
      }

      // Lấy chi tiết các nhà hàng từ repository với relations để populate đầy đủ
      const favoriteRestaurants =
        await this.restaurantRepository.repository.find({
          where: { id: In(favoriteRestaurantIds) },
          relations: ['specialize_in', 'address'], // Populate specialize_in (FoodCategory) và address
          select: {
            id: true,
            restaurant_name: true,
            avatar: { url: true, key: true },
            address: {
              id: true,
              street: true,
              city: true,
              nationality: true,
              postal_code: true,
              location: { lat: true, lng: true }
            }
          }
        });

      // Trả về danh sách nhà hàng yêu thích đã được populate
      return createResponse(
        'OK',
        favoriteRestaurants,
        `Fetched ${favoriteRestaurants.length} favorite restaurants successfully`
      );
    } catch (error: any) {
      console.error('Error fetching favorite restaurants:', error);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while fetching favorite restaurants'
      );
    }
  }

  // Haversine formula to calculate the distance between two lat/lon points (in km)
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  async getAllRestaurants(customerId: string): Promise<any> {
    const cacheKey = `restaurants:customer:${customerId}`;
    const ttl = 3600; // Cache 1 giờ (3600 giây)
    const start = Date.now();

    try {
      // 1. Kiểm tra cache
      const cacheStart = Date.now();
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        logger.log(
          `Fetched restaurants from cache in ${Date.now() - cacheStart}ms`
        );
        logger.log(`Total time (cache): ${Date.now() - start}ms`);
        return createResponse(
          'OK',
          JSON.parse(cachedData),
          'Fetched and prioritized restaurants from cache successfully'
        );
      }
      logger.log(
        `Cache miss, fetching from DB (took ${Date.now() - cacheStart}ms)`
      );

      // 2. Truy vấn customer
      const customerStart = Date.now();
      const customer = await this.customerRepository.findById(customerId);
      if (!customer) {
        logger.log(`Customer fetch took ${Date.now() - customerStart}ms`);
        return createResponse('NotFound', null, 'Customer not found');
      }
      logger.log(`Customer fetch took ${Date.now() - customerStart}ms`);

      const {
        preferred_category,
        restaurant_history,
        address: customerAddress
      } = customer;

      const customerAddressArray = customerAddress as AddressPopulate[];

      // 3. Lấy tất cả nhà hàng
      const restaurantsStart = Date.now();
      const restaurants = await this.restaurantRepository.findAll();
      logger.log(`Restaurants fetch took ${Date.now() - restaurantsStart}ms`);

      // 4. Fetch ratings for all restaurants
      const ratingsStart = Date.now();
      const ratingsRepository = this.dataSource.getRepository(RatingsReview);
      const restaurantRatings = await ratingsRepository
        .createQueryBuilder('rating')
        .select('rating.rr_recipient_restaurant_id', 'restaurant_id')
        .addSelect('AVG(rating.food_rating)', 'avg_rating')
        .where('rating.recipient_type = :type', { type: 'restaurant' })
        .groupBy('rating.rr_recipient_restaurant_id')
        .getRawMany();

      const ratingsMap = new Map();
      restaurantRatings.forEach(rating => {
        ratingsMap.set(rating.restaurant_id, parseFloat(rating.avg_rating));
      });
      logger.log(`Ratings fetch took ${Date.now() - ratingsStart}ms`);

      // 5. Tính toán và ưu tiên nhà hàng
      const prioritizationStart = Date.now();
      const prioritizedRestaurants = restaurants
        .map(restaurant => {
          const customerLocation = customerAddressArray?.[0]?.location as
            | AddressPopulate['location']
            | undefined;

          const restaurantAddress = restaurant.address as
            | AddressPopulate
            | undefined;

          if (!customerLocation || !restaurantAddress?.location) {
            return {
              ...restaurant,
              priorityScore: 0,
              distance: 0,
              estimated_time: 0,
              avg_rating: ratingsMap.get(restaurant.id) || 0
            };
          }

          const restaurantLocation = restaurantAddress.location;

          const isPreferred = restaurant.specialize_in.some(category =>
            preferred_category.includes(category as unknown as FoodCategory)
          );

          const visitHistory = restaurant_history
            ? restaurant_history.find(
                history => history.restaurant_id === restaurant.id
              )
            : null;
          const visitCount = visitHistory ? visitHistory.count : 0;

          const distance = this.calculateDistance(
            customerLocation.lat,
            customerLocation.lng,
            restaurantLocation.lat,
            restaurantLocation.lng
          );

          // Calculate estimated time (in minutes) - assuming average speed of 30 km/h
          const estimated_time = Math.round((distance / 30) * 60);

          const distanceWeight = 1 / (distance + 1);

          const priorityScore =
            (isPreferred ? 1 : 0) * 3 + visitCount * 2 + distanceWeight * 5;

          return {
            ...restaurant,
            priorityScore,
            distance: parseFloat(distance.toFixed(2)), // Round to 2 decimal places
            estimated_time,
            avg_rating: ratingsMap.get(restaurant.id) || 0
          };
        })
        .sort((a, b) => b.priorityScore - a.priorityScore);
      logger.log(`Prioritization took ${Date.now() - prioritizationStart}ms`);

      // 6. Lưu kết quả vào cache
      const cacheSaveStart = Date.now();
      const cacheSaved = await this.redisService.setNx(
        cacheKey,
        JSON.stringify(prioritizedRestaurants),
        ttl * 1000 // TTL tính bằng milliseconds
      );
      if (cacheSaved) {
        logger.log(
          `Stored restaurants in cache: ${cacheKey} (took ${Date.now() - cacheSaveStart}ms)`
        );
      } else {
        logger.warn(`Failed to store restaurants in cache: ${cacheKey}`);
      }

      logger.log(`Total DB fetch and processing took ${Date.now() - start}ms`);
      return createResponse(
        'OK',
        prioritizedRestaurants,
        'Fetched and prioritized restaurants successfully'
      );
    } catch (error: any) {
      logger.error(`Error fetching restaurants: ${error.message}`, error.stack);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while fetching and prioritizing restaurants'
      );
    }
  }

  async getAllOrders(customerId: string): Promise<ApiResponse<any>> {
    const cacheKey = `orders:customer:${customerId}`;
    const ttl = 300; // Cache 5 phút (300 giây)
    const start = Date.now();

    try {
      // 1. Kiểm tra cache
      const cacheStart = Date.now();
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        logger.log(`Fetched orders from cache in ${Date.now() - cacheStart}ms`);
        logger.log(`Total time (cache): ${Date.now() - start}ms`);
        return createResponse(
          'OK',
          JSON.parse(cachedData),
          'Fetched orders from cache successfully'
        );
      }
      logger.log(`Cache miss for ${cacheKey}`);

      // 2. Kiểm tra customer
      const customerStart = Date.now();
      const customer = await this.customerRepository.findById(customerId);
      if (!customer) {
        logger.log(`Customer fetch took ${Date.now() - customerStart}ms`);
        return createResponse('NotFound', null, 'Customer not found');
      }
      logger.log(`Customer fetch took ${Date.now() - customerStart}ms`);

      // 3. Lấy orders với các trường tối ưu
      const ordersStart = Date.now();
      const orders = await this.dataSource.getRepository(Order).find({
        where: { customer_id: customerId },
        relations: ['restaurant', 'customerAddress', 'restaurantAddress'],
        select: {
          id: true,
          customer_id: true,
          restaurant_id: true,
          driver_id: true,
          status: true,
          total_amount: true,
          payment_status: true,
          payment_method: true,
          customer_location: true,
          restaurant_location: true,
          order_items: true,
          customer_note: true,
          restaurant_note: true,
          distance: true,
          delivery_fee: true,
          updated_at: true,
          order_time: true,
          delivery_time: true,
          tracking_info: true,
          cancelled_by: true,
          cancelled_by_id: true,
          cancellation_reason: true,
          cancellation_title: true,
          cancellation_description: true,
          cancelled_at: true,
          restaurant: {
            id: true,
            restaurant_name: true,
            address_id: true,
            avatar: { url: true, key: true }
          }
        }
      });
      logger.log(`Orders fetch took ${Date.now() - ordersStart}ms`);

      if (!orders || orders.length === 0) {
        const response = createResponse(
          'OK',
          [],
          'No orders found for this customer'
        );
        await this.redisService.setNx(cacheKey, JSON.stringify([]), ttl * 1000);
        logger.log(`Stored empty orders in cache: ${cacheKey}`);
        return response;
      }

      // 4. Lấy specializations
      const specializationsStart = Date.now();
      const restaurantIds = orders.map(order => order.restaurant_id);
      const specializations = await this.dataSource
        .createQueryBuilder()
        .select('rs.restaurant_id', 'restaurant_id')
        .addSelect('array_agg(fc.name)', 'specializations')
        .from('restaurant_specializations', 'rs')
        .leftJoin('food_categories', 'fc', 'fc.id = rs.food_category_id')
        .where('rs.restaurant_id IN (:...restaurantIds)', { restaurantIds })
        .groupBy('rs.restaurant_id')
        .getRawMany();
      const specializationMap = new Map(
        specializations.map(spec => [spec.restaurant_id, spec.specializations])
      );
      logger.log(
        `Specializations fetch took ${Date.now() - specializationsStart}ms`
      );

      // 5. Batch query MenuItem
      const menuItemsStart = Date.now();
      const allItemIds = orders.flatMap(order =>
        order.order_items.map(item => item.item_id)
      );
      const menuItems = await this.dataSource.getRepository(MenuItem).find({
        where: { id: In(allItemIds) },
        select: {
          id: true,
          name: true,
          price: true,
          avatar: { url: true, key: true },
          restaurant: {
            id: true,
            restaurant_name: true,
            address_id: true,
            avatar: { url: true, key: true }
          }
        },
        relations: ['restaurant']
      });
      const menuItemMap = new Map(menuItems.map(item => [item.id, item]));
      logger.log(`MenuItems fetch took ${Date.now() - menuItemsStart}ms`);

      // 6. Populate orders
      const processingStart = Date.now();
      const populatedOrders = orders.map(order => {
        const populatedOrderItems = order.order_items.map(item => ({
          ...item,
          menu_item: menuItemMap.get(item.item_id) || null
        }));

        const restaurantSpecializations =
          specializationMap.get(order.restaurant_id) || [];

        const baseOrder = {
          ...order,
          order_items: populatedOrderItems,
          customer_address: order.customerAddress,
          restaurant_address: order.restaurantAddress,
          restaurant: {
            ...order.restaurant,
            specialize_in: restaurantSpecializations
          }
        };

        if (
          order.status === 'CANCELLED' ||
          order.tracking_info === 'CANCELLED'
        ) {
          return {
            ...baseOrder,
            cancelled_by: order.cancelled_by,
            cancelled_by_id: order.cancelled_by_id,
            cancellation_reason: order.cancellation_reason,
            cancellation_title: order.cancellation_title,
            cancellation_description: order.cancellation_description,
            cancelled_at: order.cancelled_at
          };
        }

        return baseOrder;
      });
      logger.log(`Orders processing took ${Date.now() - processingStart}ms`);

      // 7. Lưu vào cache
      const cacheSaveStart = Date.now();
      const cacheSaved = await this.redisService.setNx(
        cacheKey,
        JSON.stringify(populatedOrders),
        ttl * 1000
      );
      if (cacheSaved) {
        logger.log(
          `Stored orders in cache: ${cacheKey} (took ${Date.now() - cacheSaveStart}ms)`
        );
      } else {
        logger.warn(`Failed to store orders in cache: ${cacheKey}`);
      }

      logger.log(`Total DB fetch and processing took ${Date.now() - start}ms`);
      return createResponse(
        'OK',
        populatedOrders,
        'Fetched orders successfully'
      );
    } catch (error: any) {
      logger.error(`Error fetching orders: ${error.message}`, error.stack);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while fetching orders'
      );
    }
  }

  async findOne(conditions: Partial<Customer>): Promise<ApiResponse<Customer>> {
    try {
      const customer = await this.customerRepository.findOneBy(conditions);
      if (!customer) {
        return createResponse('NotFound', null, 'Customer not found');
      }
      return createResponse('OK', customer, 'Customer found successfully');
    } catch (error: any) {
      console.error('Error finding customer:', error);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while finding the customer'
      );
    }
  }

  async getNotifications(customerId: string): Promise<ApiResponse<any>> {
    try {
      // Kiểm tra customer có tồn tại không
      const customer = await this.customerRepository.findById(customerId);
      if (!customer) {
        return createResponse('NotFound', null, 'Customer not found');
      }

      // Lấy thông báo chỉ định riêng cho customer (target_user_id = customerId)
      const specificNotifications = await this.notificationsRepository.findAll({
        where: { target_user_id: customerId },
        relations: ['created_by']
      });

      // Lấy thông báo broadcast cho vai trò CUSTOMER
      const broadcastNotifications = await this.notificationsRepository.findAll(
        {
          where: {
            target_user: Raw(
              alias => `'CUSTOMER' = ANY(${alias})` // Thủ công viết điều kiện cho cột mảng
            )
          },
          relations: ['created_by']
        }
      );

      // Gộp hai danh sách thông báo và loại bỏ trùng lặp
      const allNotifications = [
        ...specificNotifications,
        ...broadcastNotifications
      ];
      const uniqueNotificationsMap = new Map(
        allNotifications.map(n => [n.id, n])
      );
      const uniqueNotifications = Array.from(uniqueNotificationsMap.values());

      // Sắp xếp theo thời gian tạo (mới nhất trước)
      const sortedNotifications = uniqueNotifications.sort(
        (a, b) => b.created_at - a.created_at
      );

      return createResponse(
        'OK',
        sortedNotifications,
        `Fetched ${sortedNotifications.length} notifications for customer ${customerId}`
      );
    } catch (error: any) {
      console.error('Error fetching notifications for customer:', error);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while fetching notifications'
      );
    }
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10
  ): Promise<
    ApiResponse<{
      totalPages: number;
      currentPage: number;
      totalItems: number;
      items: Customer[];
    }>
  > {
    try {
      const skip = (page - 1) * limit;
      const [customers, total] = await this.customerRepository.findAllPaginated(
        skip,
        limit
      );
      const totalPages = Math.ceil(total / limit);

      return createResponse(
        'OK',
        {
          totalPages,
          currentPage: page,
          totalItems: total,
          items: customers
        },
        'Fetched paginated customers'
      );
    } catch (error: any) {
      console.error('Error fetching paginated customers:', error);
      return createResponse(
        'ServerError',
        null,
        'Error fetching paginated customers'
      );
    }
  }

  // Simple update method without cache operations for debugging
  async updateSimple(
    id: string,
    updateCustomerDto: UpdateCustomerDto
  ): Promise<ApiResponse<Customer>> {
    const start = Date.now();
    try {
      logger.log(`Starting simple update for customer ${id}`);

      // Get customer from database
      const customer = await this.customerRepository.findById(id);
      if (!customer) {
        logger.log(`Customer ${id} not found`);
        return createResponse('NotFound', null, 'Customer not found');
      }

      logger.log(`Found customer ${id}, updating...`);

      // Update customer data
      Object.assign(customer, updateCustomerDto);
      customer.updated_at = Math.floor(Date.now() / 1000);

      // Save directly to database without cache operations
      const updatedCustomer = await this.dataSource
        .getRepository(Customer)
        .save(customer);

      logger.log(
        `Update completed for customer ${id} in ${Date.now() - start}ms`
      );
      return createResponse(
        'OK',
        updatedCustomer,
        'Customer updated successfully'
      );
    } catch (error: any) {
      logger.error(`Error updating customer ${id}:`, error);
      return createResponse(
        'ServerError',
        null,
        `An error occurred while updating the customer: ${error.message}`
      );
    }
  }
}
