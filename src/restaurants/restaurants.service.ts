import { Injectable, Logger } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { createResponse } from 'src/utils/createResponse';
import { MenuItemsService } from 'src/menu_items/menu_items.service';
import { CreateMenuItemDto } from 'src/menu_items/dto/create-menu_item.dto';
import { UpdateMenuItemDto } from 'src/menu_items/dto/update-menu_item.dto';
import { CreateMenuItemVariantDto } from 'src/menu_item_variants/dto/create-menu_item_variant.dto';
import { MenuItemVariantsService } from 'src/menu_item_variants/menu_item_variants.service';
import { UpdateMenuItemVariantDto } from 'src/menu_item_variants/dto/update-menu_item_variant.dto';
import { UserRepository } from 'src/users/users.repository';
import { ApiResponse } from 'src/utils/createResponse';
import { PromotionsRepository } from 'src/promotions/promotions.repository';
import { AddressBookRepository } from 'src/address_book/address_book.repository';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsRepository } from './restaurants.repository';
import { OrdersRepository } from 'src/orders/orders.repository';
import { RestaurantsGateway } from 'src/restaurants/restaurants.gateway';
import {
  OrderStatus,
  OrderTrackingInfo
} from 'src/orders/entities/order.entity';
import { FoodCategoriesRepository } from 'src/food_categories/food_categories.repository';
import { FoodCategory } from 'src/food_categories/entities/food_category.entity';
import { CreateTransactionDto } from 'src/transactions/dto/create-transaction.dto';
import { FWalletsRepository } from 'src/fwallets/fwallets.repository';
import { TransactionService } from 'src/transactions/transactions.service';
import { FLASHFOOD_FINANCE } from 'src/utils/constants';
import { MenuItemsRepository } from 'src/menu_items/menu_items.repository';
import { MenuItem } from 'src/menu_items/entities/menu_item.entity';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { MenuItemVariant } from 'src/menu_item_variants/entities/menu_item_variant.entity';
import { createClient } from 'redis';
import { DataSource } from 'typeorm';
import { ToggleRestaurantAvailabilityDto } from './dto/restaurant-availability.dto';
import * as dotenv from 'dotenv';
import { Order } from 'src/orders/entities/order.entity';
import { RatingsReviewsRepository } from 'src/ratings_reviews/ratings_reviews.repository';
import { RedisService } from 'src/redis/redis.service';
import { RatingsReview } from 'src/ratings_reviews/entities/ratings_review.entity';
import { calculateDistance } from 'src/utils/commonFunctions';
// import { Equal } from 'typeorm';

dotenv.config();

const logger = new Logger('RestaurantsService');

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redis.connect().catch(err => logger.error('Redis connection error:', err));

interface MenuItemVariantResponse {
  id: string;
  menu_id: string;
  variant: string;
  description: string | null;
  avatar: { key: string; url: string } | null;
  availability: boolean;
  default_restaurant_notes: string[];
  price: number;
  discount_rate: number | null;
  created_at: number;
  updated_at: number;
  price_after_applied_promotion?: number | null;
}

// Interface cho response của MenuItem
interface MenuItemResponse {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string[];
  avatar: { key: string; url: string } | null;
  availability: boolean;
  suggest_notes: string[];
  discount: {
    discount_type: 'FIXED' | 'PERCENTAGE';
    discount_value: number;
    start_date: number;
    end_date: number;
  } | null;
  purchase_count: number;
  created_at: number;
  updated_at: number;
  price_after_applied_promotion?: number | null;
  variants: MenuItemVariantResponse[];
}

// interface RestaurantWithBanStatus extends Omit<Restaurant, 'generateId'> {
//   is_banned: boolean;
// }

@Injectable()
export class RestaurantsService {
  private readonly restaurantsValidPromotionsCacheKey =
    'promotions:valid_with_restaurants';
  constructor(
    private readonly restaurantsRepository: RestaurantsRepository,
    private readonly userRepository: UserRepository,
    private readonly promotionRepository: PromotionsRepository,
    private readonly addressRepository: AddressBookRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly menuItemRepository: MenuItemsRepository,
    private readonly menuItemsService: MenuItemsService,
    private readonly menuItemVariantsService: MenuItemVariantsService,
    private readonly transactionsService: TransactionService,
    private readonly restaurantsGateway: RestaurantsGateway,
    private readonly foodCategoryRepository: FoodCategoriesRepository,
    private readonly fWalletsRepository: FWalletsRepository,
    private readonly dataSource: DataSource,
    private readonly ratingsReviewsRepository: RatingsReviewsRepository,
    private readonly redisService: RedisService
  ) {}

  async onModuleInit() {
    // Preload restaurants vào Redis
    try {
      const start = Date.now();
      const restaurants = await this.restaurantsRepository.repository.find({
        select: ['id', 'status'],
        take: 10 // Top 10000 restaurants
      });
      for (const restaurant of restaurants) {
        const cacheKey = `restaurant:${restaurant.id}`;
        await redis.setEx(cacheKey, 86400, JSON.stringify(restaurant));
      }
      logger.log(
        `Preloaded ${restaurants.length} restaurants into Redis in ${Date.now() - start}ms`
      );
    } catch (error: any) {
      logger.error('Error preloading restaurants into Redis:', error);
    }
  }

  async preloadRestaurants() {
    try {
      const start = Date.now();
      const restaurants = await this.restaurantsRepository.repository.find({
        select: ['id', 'status'],
        take: 10000
      });
      const batchSize = 1000;
      for (let i = 0; i < restaurants.length; i += batchSize) {
        const batch = restaurants.slice(i, i + batchSize);
        await Promise.all(
          batch.map(restaurant => {
            const cacheKey = `restaurant:${restaurant.id}`;
            return redis.setEx(cacheKey, 86400, JSON.stringify(restaurant));
          })
        );
      }
      logger.log(
        `Preloaded ${restaurants.length} restaurants into Redis in ${Date.now() - start}ms`
      );
    } catch (error: any) {
      logger.error('Error preloading restaurants into Redis:', error);
    }
  }

  async clearRedis(): Promise<ApiResponse<null>> {
    const start = Date.now();
    try {
      const keys = await redis.keys('*');
      if (keys.length > 0) {
        await redis.del(keys);
      }
      logger.log(
        `Cleared ${keys.length} keys from Redis in ${Date.now() - start}ms`
      );
      // Preload lại sau khi clear
      await this.preloadRestaurants();
      return createResponse(
        'OK',
        null,
        'Redis cleared and restaurants preloaded successfully'
      );
    } catch (error: any) {
      logger.error('Error clearing Redis:', error);
      return createResponse('ServerError', null, 'Error clearing Redis');
    }
  }

  async update(
    id: string,
    updateRestaurantDto: UpdateRestaurantDto
  ): Promise<ApiResponse<Restaurant>> {
    const start = Date.now();
    try {
      const { owner_id, promotions, address_id, specialize_in } =
        updateRestaurantDto;

      // Lấy restaurant từ cache hoặc DB
      const cacheKey = `restaurant:${id}`;
      let restaurant: Restaurant | null = null;

      const fetchStart = Date.now();
      const cached = await redis.get(cacheKey);
      if (cached) {
        restaurant = JSON.parse(cached);
        logger.log(
          `Fetch restaurant (cache) took ${Date.now() - fetchStart}ms`
        );
      } else {
        restaurant = await this.restaurantsRepository.findById(id);
        if (restaurant) {
          await redis.setEx(cacheKey, 7200, JSON.stringify(restaurant));
          logger.log(`Stored restaurant in Redis: ${cacheKey}`);
        }
        logger.log(`Fetch restaurant took ${Date.now() - fetchStart}ms`);
      }

      if (!restaurant) {
        return createResponse('NotFound', null, 'Restaurant not found');
      }

      // Validate owner
      if (owner_id) {
        const ownerCacheKey = `user:${owner_id}`;
        let owner = null;
        const ownerFetchStart = Date.now();
        const cachedOwner = await redis.get(ownerCacheKey);
        if (cachedOwner) {
          owner = JSON.parse(cachedOwner);
          logger.log(
            `Fetch owner (cache) took ${Date.now() - ownerFetchStart}ms`
          );
        } else {
          owner = await this.userRepository.findById(owner_id);
          if (owner) {
            await redis.setEx(ownerCacheKey, 7200, JSON.stringify(owner));
            logger.log(`Stored owner in Redis: ${ownerCacheKey}`);
          }
          logger.log(`Fetch owner took ${Date.now() - ownerFetchStart}ms`);
        }
        if (!owner) {
          return createResponse('NotFound', null, 'Owner not found');
        }
      }

      // Validate address
      if (address_id) {
        const addressCacheKey = `address:${address_id}`;
        let address = null;
        const addressFetchStart = Date.now();
        const cachedAddress = await redis.get(addressCacheKey);
        if (cachedAddress) {
          address = JSON.parse(cachedAddress);
          logger.log(
            `Fetch address (cache) took ${Date.now() - addressFetchStart}ms`
          );
        } else {
          address = await this.addressRepository.findById(address_id);
          if (address) {
            await redis.setEx(addressCacheKey, 7200, JSON.stringify(address));
            logger.log(`Stored address in Redis: ${addressCacheKey}`);
          }
          logger.log(`Fetch address took ${Date.now() - addressFetchStart}ms`);
        }
        if (!address) {
          return createResponse(
            'NotFound',
            null,
            'Address not found in address book'
          );
        }
      }

      // Validate promotions
      let foundPromotions = [];
      if (promotions && promotions.length > 0) {
        const promotionFetchStart = Date.now();
        foundPromotions = await this.promotionRepository.findByIds(promotions);
        if (foundPromotions.length !== promotions.length) {
          return createResponse(
            'NotFound',
            null,
            'One or more promotions not found'
          );
        }
        logger.log(
          `Fetch promotions took ${Date.now() - promotionFetchStart}ms`
        );
      }

      // Validate food categories
      let foodCategories: FoodCategory[] = [];
      if (specialize_in && specialize_in.length > 0) {
        const categoryFetchStart = Date.now();
        foodCategories =
          await this.foodCategoryRepository.findByIds(specialize_in);
        if (foodCategories.length !== specialize_in.length) {
          return createResponse(
            'NotFound',
            null,
            'One or more food categories not found'
          );
        }
        logger.log(
          `Fetch food categories took ${Date.now() - categoryFetchStart}ms`
        );
      }

      // Update restaurant
      const updateStart = Date.now();

      // Prepare update data with correct types
      const updateData = {
        ...updateRestaurantDto,
        specialize_in: foodCategories
      };
      delete updateData.food_category_ids; // Remove the DTO property if it exists

      const updatedRestaurant = await this.restaurantsRepository.update(
        id,
        updateData as any // Type assertion needed due to mismatch between DTO and entity
      );
      await redis.setEx(cacheKey, 7200, JSON.stringify(updatedRestaurant));
      logger.log(`Update restaurant took ${Date.now() - updateStart}ms`);

      logger.log(`Update restaurant took ${Date.now() - start}ms`);
      return createResponse(
        'OK',
        updatedRestaurant,
        'Restaurant updated successfully'
      );
    } catch (error: any) {
      logger.error('Error updating restaurant:', error);
      return createResponse('ServerError', null, 'Error updating restaurant');
    }
  }

  async toggleAvailability(
    id: string,
    toggleDto: ToggleRestaurantAvailabilityDto
  ): Promise<ApiResponse<Restaurant>> {
    const start = Date.now();
    try {
      // Lấy restaurant từ cache hoặc DB
      const cacheKey = `restaurant:${id}`;
      let restaurant: Restaurant | null = null;

      const fetchStart = Date.now();
      const cached = await redis.get(cacheKey);
      if (cached) {
        restaurant = JSON.parse(cached);
        logger.log(
          `Fetch restaurant (cache) took ${Date.now() - fetchStart}ms`
        );
      } else {
        restaurant = await this.restaurantsRepository.findById(id);
        if (restaurant) {
          await redis.setEx(cacheKey, 86400, JSON.stringify(restaurant));
          logger.log(`Stored restaurant in Redis: ${cacheKey}`);
        }
        logger.log(`Fetch restaurant took ${Date.now() - fetchStart}ms`);
      }

      if (!restaurant) {
        return createResponse('NotFound', null, 'Restaurant not found');
      }

      // Toggle is_open
      const newIsOpen = toggleDto.is_open ?? !restaurant.status.is_open;
      const updateStart = Date.now();
      const updateResult = await this.dataSource
        .createQueryBuilder()
        .update(Restaurant)
        .set({
          status: () => `jsonb_set(status, '{is_open}', :isOpen::jsonb)`
        })
        .where('id = :id', { id, isOpen: newIsOpen })
        .execute();

      if (updateResult.affected === 0) {
        logger.warn(`Failed to update restaurant ${id}`);
        return createResponse('NotFound', null, 'Restaurant not found');
      }
      logger.log(
        `Update restaurant availability took ${Date.now() - updateStart}ms`
      );

      // Cập nhật cache và response
      restaurant.status.is_open = newIsOpen;
      await redis.setEx(cacheKey, 86400, JSON.stringify(restaurant));

      logger.log(`Toggle restaurant availability took ${Date.now() - start}ms`);
      return createResponse(
        'OK',
        restaurant,
        'Restaurant availability toggled successfully'
      );
    } catch (error: any) {
      logger.error('Error toggling restaurant availability:', error);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while toggling restaurant availability'
      );
    }
  }

  async create(
    createRestaurantDto: CreateRestaurantDto
  ): Promise<ApiResponse<Restaurant>> {
    try {
      const {
        owner_id,
        promotions,
        address_id,
        contact_email,
        contact_phone,
        opening_hours,
        owner_name,
        restaurant_name,
        status,
        images_gallery,
        food_category_ids
      } = createRestaurantDto;

      if (
        !owner_id ||
        !address_id ||
        !contact_email ||
        !contact_phone ||
        !opening_hours ||
        !owner_name ||
        !restaurant_name ||
        !status
      ) {
        return createResponse(
          'MissingInput',
          null,
          'Missing required fields: owner_id, address_id, contact_email, contact_phone, opening_hours, owner_name, restaurant_name, status'
        );
      }

      const owner = await this.userRepository.findById(owner_id);
      if (!owner) return createResponse('NotFound', null, 'Owner not found');

      const addressBookEntry =
        await this.addressRepository.findById(address_id);
      if (!addressBookEntry)
        return createResponse(
          'NotFound',
          null,
          'Address not found in address book'
        );

      if (promotions && promotions.length > 0) {
        const foundPromotions =
          await this.promotionRepository.findByIds(promotions);
        if (foundPromotions.length !== promotions.length)
          return createResponse(
            'NotFound',
            null,
            'One or more promotions not found'
          );
      }

      let specializeIn: FoodCategory[] = [];
      if (food_category_ids && food_category_ids.length > 0) {
        const foundCategories =
          await this.foodCategoryRepository.findByIds(food_category_ids);
        if (foundCategories.length !== food_category_ids.length)
          return createResponse(
            'NotFound',
            null,
            'One or more food categories not found'
          );
        specializeIn = foundCategories;
      }

      const restaurantDto: Partial<CreateRestaurantDto> & {
        specialize_in?: FoodCategory[];
      } = {
        owner_id,
        promotions: promotions || [],
        address_id,
        contact_email,
        contact_phone,
        opening_hours,
        owner_name,
        restaurant_name,
        status,
        images_gallery: images_gallery || [],
        specialize_in: specializeIn
      };

      const savedRestaurant = await this.restaurantsRepository.create(
        restaurantDto as CreateRestaurantDto
      );
      return createResponse(
        'OK',
        savedRestaurant,
        'Restaurant created successfully'
      );
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
      return createResponse('ServerError', null, 'Error creating restaurant');
    }
  }

  // Các phương thức khác giữ nguyên
  async updateEntityAvatar(
    uploadResult: { url: string; public_id: string },
    entityId: string
  ) {
    const restaurant = await this.restaurantsRepository.update(entityId, {
      avatar: { url: uploadResult.url, key: uploadResult.public_id }
    });

    if (!restaurant) {
      return createResponse('NotFound', null, 'Restaurant not found');
    }

    return createResponse(
      'OK',
      restaurant,
      'Restaurant avatar updated successfully'
    );
  }

  async createMenuItemForRestaurant(
    restaurantId: string,
    createMenuItemDto: CreateMenuItemDto
  ): Promise<any> {
    try {
      // Create the menu item
      const result = await this.menuItemsService.create({
        ...createMenuItemDto,
        restaurant_id: restaurantId
      });

      // Invalidate the cache for this restaurant's menu items
      const cacheKey = `menu_items:${restaurantId}`;
      await redis.del(cacheKey);
      logger.log(`Invalidated cache for restaurant menu items: ${cacheKey}`);

      return result;
    } catch (error) {
      logger.error('Error in createMenuItemForRestaurant:', error);
      throw error;
    }
  }

  async updateMenuItemForRestaurant(
    restaurantId: string,
    menuItemId: string,
    updateMenuItemDto: UpdateMenuItemDto
  ): Promise<any> {
    try {
      const menuItem = await this.menuItemsService.findOne(menuItemId);

      if (menuItem.data.menuItem.restaurant_id !== restaurantId) {
        return createResponse(
          'Forbidden',
          null,
          'Menu Item does not belong to this restaurant'
        );
      }

      // Update the menu item
      const result = await this.menuItemsService.update(menuItemId, {
        ...updateMenuItemDto,
        restaurant_id: restaurantId
      });

      // Invalidate the cache for this restaurant's menu items
      const cacheKey = `menu_items:${restaurantId}`;
      await redis.del(cacheKey);
      logger.log(`Invalidated cache for restaurant menu items: ${cacheKey}`);

      return result;
    } catch (error) {
      logger.error('Error in updateMenuItemForRestaurant:', error);
      throw error;
    }
  }

  async deleteMenuItemForRestaurant(
    restaurantId: string,
    menuItemId: string
  ): Promise<any> {
    try {
      const menuItem = await this.menuItemsService.findOne(menuItemId);

      if (menuItem.data.restaurant_id !== restaurantId) {
        return createResponse(
          'Forbidden',
          null,
          'Menu Item does not belong to this restaurant'
        );
      }

      // Delete the menu item
      const result = await this.menuItemsService.remove(menuItemId);

      // Invalidate the cache for this restaurant's menu items
      const cacheKey = `menu_items:${restaurantId}`;
      await redis.del(cacheKey);
      logger.log(`Invalidated cache for restaurant menu items: ${cacheKey}`);

      return result;
    } catch (error) {
      logger.error('Error in deleteMenuItemForRestaurant:', error);
      throw error;
    }
  }
  private calculateDiscountedPrice(
    originalPrice: number,
    promotion: Promotion
  ): number {
    let discountedPrice: number;
    if (promotion.discount_type === 'PERCENTAGE') {
      discountedPrice = originalPrice * (1 - promotion.discount_value / 100);
    } else if (promotion.discount_type === 'FIXED') {
      discountedPrice = originalPrice - promotion.discount_value;
    } else {
      return originalPrice;
    }
    return Math.max(0, Number(discountedPrice.toFixed(2)));
  }

  async getMenuItemsForRestaurant(restaurantId: string): Promise<any> {
    const start = Date.now();
    const cacheKey = `menu_items:${restaurantId}`;

    try {
      // First, clear any existing cache for this restaurant's menu items
      await redis.del(cacheKey);
      logger.log(`Cleared cache for menu items of restaurant ${restaurantId}`);

      // Fetch restaurant with promotions
      const restaurant = await this.restaurantsRepository.findOne({
        where: { id: restaurantId },
        relations: ['promotions', 'promotions.food_categories']
      });

      if (!restaurant) {
        return createResponse('NotFound', null, 'Restaurant not found');
      }
      logger.log('Restaurant found:', restaurant.id);
      logger.log('Restaurant promotions:', restaurant.promotions?.length || 0);

      // Fetch all menu items, including variants
      const menuItemsResult =
        await this.menuItemsService.findByRestaurantId(restaurantId);

      if (!menuItemsResult || !menuItemsResult.data) {
        return createResponse(
          'OK',
          [],
          'No menu items found for the restaurant'
        );
      }

      // Filter menu items to only include those with availability: true
      const menuItems = (menuItemsResult.data || []).filter(
        (item: MenuItem) => item.availability
      );
      logger.log('Filtered menu items count:', menuItems.length);

      // If restaurant has no promotions, cache and return filtered menu items
      if (!restaurant.promotions || restaurant.promotions.length === 0) {
        logger.log('No promotions found for restaurant');
        // Cache the result
        await redis.setEx(cacheKey, 3600, JSON.stringify(menuItems)); // Cache for 1 hour
        return createResponse(
          'OK',
          menuItems,
          'Fetched menu items for the restaurant'
        );
      }

      const now = Math.floor(Date.now() / 1000);
      logger.log(`Current timestamp: ${now}`);

      // Process promotions for each menu item and variant
      const processedMenuItems: MenuItemResponse[] = menuItems.map(
        (item: MenuItem) => {
          logger.log(`Processing menu item: ${item.id} - ${item.name}`);

          // Initialize with original price
          let itemPriceAfterPromotion: number | null = null;
          const processedVariants: MenuItemVariantResponse[] = [];
          const itemCategories = item.category || [];
          logger.log(`Item categories: ${JSON.stringify(itemCategories)}`);

          // Find applicable promotions for this menu item
          const applicablePromotions = restaurant.promotions.filter(
            promotion => {
              const isActive =
                promotion.status === 'ACTIVE' &&
                now >= Number(promotion.start_date) &&
                now <= Number(promotion.end_date);

              const promotionCategories = promotion.food_category_ids || [];
              const hasMatchingCategory = promotionCategories.some(fcId =>
                itemCategories.includes(fcId)
              );

              logger.log(
                `Checking promotion ${promotion.id}: active=${isActive}, hasMatchingCategory=${hasMatchingCategory}, categories=${JSON.stringify(promotionCategories)}`
              );

              return isActive && hasMatchingCategory;
            }
          );

          logger.log(
            `Found ${applicablePromotions.length} applicable promotions`
          );

          // Apply promotions to the menu item
          if (applicablePromotions.length > 0) {
            applicablePromotions.forEach(promotion => {
              const discountedPrice = this.calculateDiscountedPrice(
                Number(item.price),
                promotion
              );

              logger.log(
                `Applied promotion ${promotion.id} to item ${item.id}: original=${item.price}, discounted=${discountedPrice}`
              );

              if (
                itemPriceAfterPromotion === null ||
                discountedPrice < itemPriceAfterPromotion
              ) {
                itemPriceAfterPromotion = discountedPrice;
              }
            });
          }

          // Process variants with the same promotion logic
          if (item.variants && item.variants.length > 0) {
            item.variants
              .filter((variant: MenuItemVariant) => variant.availability)
              .forEach((variant: MenuItemVariant) => {
                let variantPriceAfterPromotion: number | null = null;

                if (applicablePromotions.length > 0) {
                  applicablePromotions.forEach(promotion => {
                    const discountedPrice = this.calculateDiscountedPrice(
                      Number(variant.price),
                      promotion
                    );

                    logger.log(
                      `Applied promotion ${promotion.id} to variant ${variant.id}: original=${variant.price}, discounted=${discountedPrice}`
                    );

                    if (
                      variantPriceAfterPromotion === null ||
                      discountedPrice < variantPriceAfterPromotion
                    ) {
                      variantPriceAfterPromotion = discountedPrice;
                    }
                  });
                }

                processedVariants.push({
                  id: variant.id,
                  menu_id: variant.menu_id,
                  variant: variant.variant,
                  description: variant.description,
                  avatar: variant.avatar,
                  availability: variant.availability,
                  default_restaurant_notes: variant.default_restaurant_notes,
                  price: variant.price,
                  discount_rate: variant.discount_rate,
                  created_at: variant.created_at,
                  updated_at: variant.updated_at,
                  price_after_applied_promotion: variantPriceAfterPromotion
                });
              });
          }

          // Create the menu item response with price_after_applied_promotion
          const itemResponse: MenuItemResponse = {
            id: item.id,
            restaurant_id: item.restaurant_id,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            avatar: item.avatar,
            availability: item.availability,
            suggest_notes: item.suggest_notes,
            discount: item.discount,
            purchase_count: item.purchase_count,
            created_at: item.created_at,
            updated_at: item.updated_at,
            variants: processedVariants,
            price_after_applied_promotion: itemPriceAfterPromotion
          };

          logger.log(
            `Final item price after promotions: ${itemPriceAfterPromotion}`
          );
          return itemResponse;
        }
      );

      // Cache the processed results
      await redis.setEx(cacheKey, 3600, JSON.stringify(processedMenuItems)); // Cache for 1 hour

      logger.log(`Processed menu items in ${Date.now() - start}ms`);
      return createResponse(
        'OK',
        processedMenuItems,
        'Fetched menu items for the restaurant'
      );
    } catch (error: any) {
      logger.error('Error in getMenuItemsForRestaurant:', error);
      return createResponse('ServerError', null, 'Error fetching menu items');
    }
  }

  async createMenuItemVariantForRestaurant(
    menuId: string,
    createMenuItemVariantDto: CreateMenuItemVariantDto
  ): Promise<any> {
    return this.menuItemVariantsService.create({
      ...createMenuItemVariantDto,
      menu_id: menuId
    });
  }

  async updateMenuItemVariantForRestaurant(
    variantId: string,
    updateMenuItemVariantDto: UpdateMenuItemVariantDto
  ): Promise<any> {
    return this.menuItemVariantsService.update(
      variantId,
      updateMenuItemVariantDto
    );
  }

  async deleteMenuItemVariantForRestaurant(
    menuItemVariantId: string
  ): Promise<any> {
    return this.menuItemVariantsService.remove(menuItemVariantId);
  }

  async getOrderById(orderId: string) {
    return this.ordersRepository.findById(orderId);
  }

  // Helper method to invalidate restaurant order cache
  private async invalidateRestaurantOrderCache(
    restaurantId: string
  ): Promise<void> {
    try {
      const cachePattern = `orders:restaurant:${restaurantId}:*`;
      const keys = await redis.keys(cachePattern);
      if (keys.length > 0) {
        await redis.del(keys);
        logger.log(
          `Invalidated ${keys.length} cache entries for restaurant ${restaurantId}`
        );
      }
    } catch (cacheError) {
      logger.warn('Failed to invalidate order cache:', cacheError);
      // Continue execution even if cache invalidation fails
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    try {
      let tracking_info: OrderTrackingInfo;
      switch (status) {
        case OrderStatus.RESTAURANT_ACCEPTED:
          tracking_info = OrderTrackingInfo.PREPARING;
          break;
        case OrderStatus.RESTAURANT_PICKUP:
          tracking_info = OrderTrackingInfo.RESTAURANT_PICKUP;
          break;
        case OrderStatus.IN_PROGRESS:
          tracking_info = OrderTrackingInfo.OUT_FOR_DELIVERY;
          break;
        case OrderStatus.PENDING:
          tracking_info = OrderTrackingInfo.ORDER_PLACED;
          break;
        default:
          tracking_info = OrderTrackingInfo.DELIVERED;
      }

      const updatedOrder = await this.ordersRepository.updateStatus(orderId, {
        status: status as OrderStatus,
        tracking_info
      });

      if (!updatedOrder) {
        return createResponse('NotFound', null, 'Order not found');
      }

      // Invalidate cache for this restaurant's orders
      await this.invalidateRestaurantOrderCache(updatedOrder.restaurant_id);

      // Notify parties about the update
      if (this.restaurantsGateway) {
        await this.restaurantsGateway.notifyPartiesOnce(updatedOrder);
      }

      return createResponse(
        'OK',
        updatedOrder,
        'Order status updated successfully'
      );
    } catch (error: any) {
      logger.error('Error updating order status:', error);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while updating the order status'
      );
    }
  }

  async findAll(): Promise<ApiResponse<any>> {
    try {
      const restaurants = await this.restaurantsRepository.findAll();
      return createResponse(
        'OK',
        restaurants,
        'Restaurants retrieved successfully'
      );
    } catch (error: any) {
      console.error('Error finding restaurants:', error);
      return createResponse(
        'ServerError',
        null,
        'Error retrieving restaurants'
      );
    }
  }

  async findOne(id: string): Promise<ApiResponse<any>> {
    const start = Date.now();
    const cacheKey = `restaurant:details:${id}`;
    const cacheTtl = 1800; // 30 minutes

    try {
      // Try to get from cache first
      const cacheStart = Date.now();
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        logger.log(
          `Cache hit for restaurant details ${id} in ${Date.now() - cacheStart}ms`
        );
        logger.log(`Total time (cache): ${Date.now() - start}ms`);
        return createResponse(
          'OK',
          JSON.parse(cachedData),
          'Restaurant retrieved from cache'
        );
      }

      logger.log(`Cache miss for restaurant details: ${id}`);

      // Fetch the restaurant with its address
      const dbStart = Date.now();
      const restaurant = await this.dataSource
        .getRepository(Restaurant)
        .createQueryBuilder('restaurant')
        .leftJoinAndSelect('restaurant.owner', 'owner')
        .leftJoinAndSelect('restaurant.address', 'address')
        .leftJoinAndSelect('restaurant.promotions', 'promotions')
        .leftJoinAndSelect('restaurant.specialize_in', 'specialize_in')
        .where('restaurant.id = :id', { id })
        .getOne();
      logger.log(`Restaurant DB fetch took ${Date.now() - dbStart}ms`);
      if (!restaurant) {
        return createResponse('NotFound', null, 'Restaurant not found');
      }

      // Use direct query to get ratings and reviews for this specific restaurant
      const ratingsReviews = await this.dataSource
        .getRepository(RatingsReview)
        .createQueryBuilder('review')
        .leftJoinAndSelect('review.reviewer_customer', 'reviewer_customer')
        .leftJoinAndSelect('review.reviewer_driver', 'reviewer_driver')
        .leftJoinAndSelect('review.reviewer_restaurant', 'reviewer_restaurant')
        .leftJoinAndSelect(
          'review.reviewer_customercare',
          'reviewer_customercare'
        )
        .leftJoinAndSelect('review.order', 'order')
        .where('review.rr_recipient_restaurant_id = :restaurantId', {
          restaurantId: id
        })
        .andWhere('review.recipient_type = :recipientType', {
          recipientType: 'restaurant'
        })
        .getMany();

      logger.log(
        `Found ${ratingsReviews.length} reviews where restaurant ${id} is the recipient`
      );

      // For debugging, log the IDs of the reviews
      if (ratingsReviews.length > 0) {
        logger.log('Review IDs:', ratingsReviews.map(r => r.id).join(', '));
      } else {
        logger.log('No reviews found for this restaurant');
      }

      // Calculate rating statistics
      const totalReviews = ratingsReviews.length;
      let avgFoodRating = 0;
      let avgDeliveryRating = 0;
      let avgOverallRating = 0;

      if (totalReviews > 0) {
        const validFoodRatings = ratingsReviews.filter(
          review =>
            review.food_rating !== null && review.food_rating !== undefined
        );
        const validDeliveryRatings = ratingsReviews.filter(
          review =>
            review.delivery_rating !== null &&
            review.delivery_rating !== undefined
        );

        const totalFoodRating = validFoodRatings.reduce(
          (sum, review) => sum + review.food_rating,
          0
        );
        const totalDeliveryRating = validDeliveryRatings.reduce(
          (sum, review) => sum + review.delivery_rating,
          0
        );

        avgFoodRating =
          validFoodRatings.length > 0
            ? totalFoodRating / validFoodRatings.length
            : 0;
        avgDeliveryRating =
          validDeliveryRatings.length > 0
            ? totalDeliveryRating / validDeliveryRatings.length
            : 0;

        // Calculate overall rating as average of food and delivery
        const validRatingsCount =
          (validFoodRatings.length > 0 ? 1 : 0) +
          (validDeliveryRatings.length > 0 ? 1 : 0);
        if (validRatingsCount > 0) {
          avgOverallRating =
            (avgFoodRating + avgDeliveryRating) / validRatingsCount;
        }
      }

      // Get reviewer details based on reviewer_type
      const getReviewerDetails = review => {
        try {
          switch (review.reviewer_type) {
            case 'customer':
              return review.reviewer_customer;
            case 'driver':
              return review.reviewer_driver;
            case 'restaurant':
              return review.reviewer_restaurant;
            case 'customerCare':
              return review.reviewer_customercare;
            default:
              return null;
          }
        } catch (error) {
          console.error('Error getting reviewer details:', error);
          return null;
        }
      };

      // Get reviewer name safely
      const getReviewerName = reviewer => {
        if (!reviewer) return 'Anonymous';

        // Try different properties based on entity type
        return (
          reviewer.name ||
          reviewer.owner_name ||
          reviewer.customer_name ||
          reviewer.restaurant_name ||
          'Anonymous'
        );
      };

      // Calculate distance and estimated time
      let distance = 0;
      let estimated_time = 0;

      // Use a default user location in central Ho Chi Minh City
      const userLocation = { lat: 10.8231, lng: 106.6297 };

      // Get restaurant location from address
      if (restaurant.address && restaurant.address.location) {
        const restaurantLocation = restaurant.address.location;

        // Calculate distance if location data is available
        if (
          restaurantLocation &&
          restaurantLocation.lat &&
          restaurantLocation.lng
        ) {
          distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            restaurantLocation.lat,
            restaurantLocation.lng
          );

          // Calculate estimated time (in minutes) - assuming average speed of 30 km/h
          estimated_time = Math.round((distance / 30) * 60);

          // Round distance to 2 decimal places
          distance = parseFloat(distance.toFixed(2));
        }
      }

      // Add rating statistics to restaurant data
      const restaurantWithRatings = {
        ...restaurant,
        // Add the three fields directly to the restaurant object
        distance,
        estimated_time,
        avg_rating: parseFloat(avgOverallRating.toFixed(1)),
        rating_stats: {
          avg_rating: parseFloat(avgOverallRating.toFixed(1)),
          avg_food_rating: parseFloat(avgFoodRating.toFixed(1)),
          avg_delivery_rating: parseFloat(avgDeliveryRating.toFixed(1)),
          total_reviews: totalReviews,
          reviews: ratingsReviews.map(review => {
            const reviewer = getReviewerDetails(review);
            return {
              id: review.id,
              reviewer_type: review.reviewer_type,
              reviewer: reviewer
                ? {
                    id: reviewer?.id || null,
                    name: getReviewerName(reviewer),
                    avatar: reviewer?.avatar || null
                  }
                : {
                    id: null,
                    name: 'Anonymous',
                    avatar: null
                  },
              food_rating: review.food_rating || 0,
              delivery_rating: review.delivery_rating || 0,
              food_review: review.food_review || '',
              delivery_review: review.delivery_review || '',
              images: review.images || [],
              created_at: review.created_at,
              order_id: review.order_id
            };
          })
        }
      };

      // Cache the result
      const cacheSaveStart = Date.now();
      try {
        await redis.setEx(
          cacheKey,
          cacheTtl,
          JSON.stringify(restaurantWithRatings)
        );
        logger.log(
          `Restaurant details cached successfully (${Date.now() - cacheSaveStart}ms)`
        );
      } catch (cacheError) {
        logger.warn('Failed to cache restaurant details:', cacheError);
      }

      logger.log(`Total processing time: ${Date.now() - start}ms`);
      return createResponse(
        'OK',
        restaurantWithRatings,
        'Restaurant retrieved successfully'
      );
    } catch (error: any) {
      logger.error('Error finding restaurant:', error);
      return createResponse('ServerError', null, 'Error retrieving restaurant');
    }
  }

  async remove(id: string): Promise<ApiResponse<boolean>> {
    try {
      const restaurant = await this.restaurantsRepository.findById(id);
      if (!restaurant) {
        return createResponse('NotFound', null, 'Restaurant not found');
      }

      const deleted = await this.restaurantsRepository.delete(id);
      if (!deleted) {
        return createResponse(
          'ServerError',
          null,
          'Failed to delete restaurant'
        );
      }

      return createResponse('OK', true, 'Restaurant deleted successfully');
    } catch (error: any) {
      console.error('Error deleting restaurant:', error);
      return createResponse('ServerError', null, 'Error deleting restaurant');
    }
  }

  async updateImageGalleries(
    uploadResults: Array<{ key: string; url: string }>,
    entityId: string
  ) {
    try {
      const restaurant = await this.restaurantsRepository.findById(entityId);
      if (!restaurant) {
        return createResponse('NotFound', null, 'Restaurant not found');
      }

      // Gọi phương thức updateImgGallery
      const updatedRestaurant =
        await this.restaurantsRepository.updateImgGallery(
          entityId,
          uploadResults
        );

      return createResponse(
        'OK',
        updatedRestaurant,
        'Restaurant galleries updated successfully'
      );
    } catch (error: any) {
      console.error('Error updating restaurant galleries:', error);
      return createResponse('ServerError', null, 'Failed to update galleries');
    }
  }

  // Trong RestaurantsService
  async applyPromotion(
    restaurantId: string,
    promotionId: string
  ): Promise<ApiResponse<any>> {
    try {
      const promotion = await this.promotionRepository.findById(promotionId);
      if (!promotion)
        return createResponse('NotFound', null, 'Promotion not found');

      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (promotion.end_date < currentTimestamp)
        return createResponse('EXPIRED', null, 'Promotion has expired');
      if (promotion.start_date > currentTimestamp)
        return createResponse(
          'NOT_AVAILABLE',
          null,
          'Promotion is not yet available'
        );

      const restaurantDetails =
        await this.restaurantsRepository.findById(restaurantId);
      if (!restaurantDetails)
        return createResponse('NotFound', null, 'Restaurant not found');

      // Kiểm tra xem promotionId đã tồn tại trong restaurant.promotions chưa
      const isPromotionExist = restaurantDetails.promotions.some(
        p => p.id === promotionId
      );
      if (isPromotionExist) {
        return createResponse(
          'DuplicatedRecord',
          null,
          `Promotion ${promotionId} is already applied to this restaurant`
        );
      }

      const restaurantWallet = await this.fWalletsRepository.findByUserId(
        restaurantDetails.owner_id
      );
      if (!restaurantWallet)
        return createResponse(
          'NotFound',
          null,
          'Wallet not found for restaurant owner'
        );

      const transactionDto: CreateTransactionDto = {
        user_id: restaurantDetails.owner_id,
        fwallet_id: restaurantWallet.id,
        transaction_type: 'PURCHASE',
        version: restaurantWallet?.version,
        amount: promotion.promotion_cost_price,
        balance_after:
          parseFloat(restaurantWallet.balance.toString()) -
          +promotion.promotion_cost_price,
        status: 'PENDING',
        source: 'FWALLET',
        destination: FLASHFOOD_FINANCE.id,
        destination_type: 'FWALLET'
      };

      const transactionResponse =
        await this.transactionsService.create(transactionDto);
      if (transactionResponse.EC !== 0) {
        return createResponse(
          transactionResponse.EC === -8 ? 'InsufficientBalance' : 'ServerError',
          null,
          transactionResponse.EM || 'Failed to process transaction'
        );
      }

      // Map updatedPromotions từ string[] sang Promotion[]
      const updatedPromotionIds = Array.from(
        new Set([
          ...(restaurantDetails.promotions.map(p => p.id) || []),
          promotionId
        ])
      );
      const promotionEntities =
        await this.promotionRepository.findByIds(updatedPromotionIds);
      if (promotionEntities.length !== updatedPromotionIds.length) {
        return createResponse(
          'NotFound',
          null,
          'One or more promotions not found'
        );
      }

      // Gán promotions vào restaurantDetails và save
      restaurantDetails.promotions = promotionEntities;
      await this.restaurantsRepository.repository.save(restaurantDetails);
      await this.redisService.del(this.restaurantsValidPromotionsCacheKey);

      return createResponse(
        'OK',
        {
          transaction: transactionResponse.data,
          restaurant: restaurantDetails,
          promotion: promotionId
        },
        'Promotion applied successfully'
      );
    } catch (error: any) {
      console.error('Error applying promotion:', error);
      return createResponse('ServerError', null, 'Error applying promotion');
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
      items: Restaurant[];
    }>
  > {
    try {
      const skip = (page - 1) * limit;
      const [restaurants, total] =
        await this.restaurantsRepository.findAllPaginated(skip, limit);
      const totalPages = Math.ceil(total / limit);

      return createResponse(
        'OK',
        {
          totalPages,
          currentPage: page,
          totalItems: total,
          items: restaurants
        },
        'Fetched paginated restaurants'
      );
    } catch (error: any) {
      console.error('Error fetching paginated restaurants:', error);
      return createResponse(
        'ServerError',
        null,
        'Error fetching paginated restaurants'
      );
    }
  }

  async getRestaurantOrders(
    restaurantId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<any>> {
    const start = Date.now();
    try {
      // 1. Check cache
      const cacheKey = `orders:restaurant:${restaurantId}:page:${page}:limit:${limit}`;

      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          logger.log(
            `Cache hit for restaurant orders ${restaurantId}, page ${page}`
          );
          return createResponse(
            'OK',
            JSON.parse(cachedData),
            'Fetched restaurant orders from cache'
          );
        }
      } catch (cacheError) {
        logger.warn('Redis cache error:', cacheError);
        // Continue execution even if cache fails
      }

      logger.log(
        `Cache miss for restaurant orders ${restaurantId}, page ${page}`
      );

      // 2. Check if restaurant exists
      const restaurant =
        await this.restaurantsRepository.findById(restaurantId);
      if (!restaurant) {
        return createResponse('NotFound', null, 'Restaurant not found');
      }

      // 3. Calculate pagination
      const skip = (page - 1) * limit;

      // 4. Execute two separate queries - one for cancelled orders, one for others
      const queryStart = Date.now();
      const [cancelledOrders, otherOrders] = await Promise.all([
        // Get cancelled orders first
        this.dataSource
          .createQueryBuilder(Order, 'order')
          .leftJoinAndSelect('order.customer', 'customer')
          .leftJoinAndSelect('order.driver', 'driver')
          .leftJoinAndSelect('order.customerAddress', 'customerAddress')
          .leftJoinAndSelect('order.restaurantAddress', 'restaurantAddress')
          .leftJoinAndSelect('order.promotions_applied', 'promotions')
          .where('order.restaurant_id = :restaurantId', { restaurantId })
          .andWhere('order.status = :status', { status: OrderStatus.CANCELLED })
          .orderBy('order.created_at', 'DESC')
          .getMany(),

        // Get other orders
        this.dataSource
          .createQueryBuilder(Order, 'order')
          .leftJoinAndSelect('order.customer', 'customer')
          .leftJoinAndSelect('order.driver', 'driver')
          .leftJoinAndSelect('order.customerAddress', 'customerAddress')
          .leftJoinAndSelect('order.restaurantAddress', 'restaurantAddress')
          .leftJoinAndSelect('order.promotions_applied', 'promotions')
          .where('order.restaurant_id = :restaurantId', { restaurantId })
          .andWhere('order.status != :status', {
            status: OrderStatus.CANCELLED
          })
          .orderBy('order.created_at', 'DESC')
          .getMany()
      ]);
      logger.log(`Queries executed in ${Date.now() - queryStart}ms`);

      // 5. Combine the results
      const allOrders = [...cancelledOrders, ...otherOrders];
      const total = allOrders.length;

      // 6. Apply pagination to combined results
      const paginatedOrders = allOrders.slice(skip, skip + limit);

      // 7. Get menu items and variants for the orders
      const menuItemStart = Date.now();
      const allItemIds = paginatedOrders.flatMap(order =>
        order.order_items.map(item => item.item_id)
      );
      const allVariantIds = paginatedOrders
        .flatMap(order => order.order_items.map(item => item.variant_id))
        .filter(id => id); // Filter out null/undefined variant_ids

      // Fetch menu items and variants concurrently
      const [menuItems, menuItemVariants] = await Promise.all([
        allItemIds.length > 0
          ? this.menuItemRepository.findByIds(allItemIds)
          : Promise.resolve([]),
        allVariantIds.length > 0
          ? (async () => {
              try {
                return await this.dataSource
                  .createQueryBuilder(MenuItemVariant, 'variant')
                  .where('variant.id IN (:...ids)', { ids: allVariantIds })
                  .getMany();
              } catch (variantError) {
                logger.warn(
                  'Failed to fetch menu item variants:',
                  variantError
                );
                return [];
              }
            })()
          : Promise.resolve([])
      ]);

      const menuItemMap = new Map(menuItems.map(item => [item.id, item]));
      const variantMap = new Map(
        menuItemVariants.map(variant => [variant.id, variant])
      );
      logger.log(
        `Menu items and variants fetched in ${Date.now() - menuItemStart}ms`
      );

      // 8. Process and populate orders
      const populatedOrders = paginatedOrders.map(order => {
        const populatedOrderItems = order.order_items.map(item => {
          const variant = item.variant_id
            ? variantMap.get(item.variant_id)
            : null;
          if (item.variant_id && !variant) {
            logger.warn(
              `Variant ID ${item.variant_id} not found for order ${order.id}`
            );
          }
          return {
            ...item,
            menu_item: menuItemMap.get(item.item_id) || null,
            menu_item_variant: variant
          };
        });

        return {
          ...order,
          order_items: populatedOrderItems
        };
      });

      const result = {
        orders: populatedOrders,
        pagination: {
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          perPage: limit
        }
      };

      // 9. Cache the result
      try {
        const ttl = 300; // Cache for 5 minutes
        await redis.setEx(cacheKey, ttl, JSON.stringify(result));
        logger.log(`Cached restaurant orders for ${cacheKey}`);
      } catch (cacheError) {
        logger.warn('Failed to cache restaurant orders:', cacheError);
        // Continue execution even if caching fails
      }

      logger.log(`getRestaurantOrders completed in ${Date.now() - start}ms`);
      return createResponse(
        'OK',
        result,
        `Fetched ${populatedOrders.length} orders for restaurant successfully`
      );
    } catch (error: any) {
      logger.error(
        `Error fetching restaurant orders: ${error.message}`,
        error.stack
      );
      return createResponse(
        'ServerError',
        null,
        'An error occurred while fetching restaurant orders'
      );
    }
  }

  async getRestaurantRatingsReviews(
    restaurantId: string
  ): Promise<ApiResponse<any>> {
    const start = Date.now();
    const cacheKey = `restaurant:ratings:${restaurantId}`;
    const cacheTtl = 900; // 15 minutes

    try {
      // Try to get from cache first
      const cacheStart = Date.now();
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        logger.log(
          `Cache hit for restaurant ratings ${restaurantId} in ${Date.now() - cacheStart}ms`
        );
        logger.log(`Total time (cache): ${Date.now() - start}ms`);
        return createResponse(
          'OK',
          JSON.parse(cachedData),
          'Restaurant ratings and reviews retrieved from cache'
        );
      }

      logger.log(`Cache miss for restaurant ratings: ${restaurantId}`);

      // Check if restaurant exists with caching
      const restaurantCacheKey = `restaurant:${restaurantId}`;
      let restaurant = null;
      const restaurantCached = await redis.get(restaurantCacheKey);
      if (restaurantCached) {
        restaurant = JSON.parse(restaurantCached);
        logger.log('Restaurant found in cache');
      } else {
        const dbStart = Date.now();
        restaurant = await this.restaurantsRepository.findById(restaurantId);
        if (restaurant) {
          await redis.setEx(
            restaurantCacheKey,
            3600,
            JSON.stringify(restaurant)
          );
          logger.log(`Restaurant cached: ${restaurantCacheKey}`);
        }
        logger.log(`Restaurant DB fetch took ${Date.now() - dbStart}ms`);
      }

      if (!restaurant) {
        return createResponse('NotFound', null, 'Restaurant not found');
      }

      // Fetch ratings and reviews from database
      const ratingsStart = Date.now();
      const ratingsReviews = await this.ratingsReviewsRepository.findAll({
        where: {
          rr_recipient_restaurant_id: restaurantId,
          recipient_type: 'restaurant'
        },
        relations: ['reviewer_customer', 'reviewer_driver', 'order']
      });
      logger.log(`Ratings fetch took ${Date.now() - ratingsStart}ms`);

      // Calculate average ratings
      const calculationStart = Date.now();
      const totalReviews = ratingsReviews?.filter(
        item => !item?.delivery_review || !item?.delivery_rating
      )?.length;
      const totalFoodRating = ratingsReviews.reduce(
        (sum, review) => sum + review.food_rating,
        0
      );
      const totalDeliveryRating = ratingsReviews.reduce(
        (sum, review) => sum + review.delivery_rating,
        0
      );
      const averageFoodRating =
        totalReviews > 0 ? totalFoodRating / totalReviews : 0;
      const averageDeliveryRating =
        totalReviews > 0 ? totalDeliveryRating / totalReviews : 0;

      const response = {
        restaurant_id: restaurantId,
        total_reviews: totalReviews,
        average_food_rating: parseFloat(averageFoodRating.toFixed(2)),
        average_delivery_rating: parseFloat(averageDeliveryRating.toFixed(2)),
        reviews: ratingsReviews
          .map(review => ({
            id: review.id,
            reviewer_type: review.reviewer_type,
            reviewer:
              review.reviewer_type === 'customer'
                ? review.reviewer_customer
                : review.reviewer_driver,
            food_rating: review.food_rating,
            delivery_rating: review.delivery_rating,
            food_review: review.food_review,
            delivery_review: review.delivery_review,
            images: review.images,
            created_at: review.created_at,
            order_id: review.order_id
          }))
          ?.filter(item => !item?.delivery_review || !item?.delivery_rating)
      };
      logger.log(`Calculation took ${Date.now() - calculationStart}ms`);

      // Cache the result
      const cacheSaveStart = Date.now();
      try {
        await redis.setEx(cacheKey, cacheTtl, JSON.stringify(response));
        logger.log(
          `Ratings cached successfully (${Date.now() - cacheSaveStart}ms)`
        );
      } catch (cacheError) {
        logger.warn('Failed to cache ratings:', cacheError);
      }

      logger.log(`Total processing time: ${Date.now() - start}ms`);
      return createResponse(
        'OK',
        response,
        'Restaurant ratings and reviews retrieved successfully'
      );
    } catch (error: any) {
      logger.error('Error getting restaurant ratings and reviews:', error);
      return createResponse(
        'ServerError',
        null,
        'Error retrieving restaurant ratings and reviews'
      );
    }
  }
}
