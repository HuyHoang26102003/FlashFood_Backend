import { Injectable, Logger } from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { UpdateCartItemDto } from './dto/update-cart_item.dto';
import { CartItem } from './entities/cart_item.entity';
import { createResponse } from 'src/utils/createResponse';
import { CartItemsRepository } from './cart_items.repository';
import { RestaurantsRepository } from 'src/restaurants/restaurants.repository';
import { CustomersRepository } from 'src/customers/customers.repository';
import { MenuItemsRepository } from 'src/menu_items/menu_items.repository';
import { MenuItemVariantsRepository } from 'src/menu_item_variants/menu_item_variants.repository';
import { Equal } from 'typeorm';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { RedisService } from 'src/redis/redis.service';

const logger = new Logger('CartItemsService');

@Injectable()
export class CartItemsService {
  // Cache configuration
  private readonly CACHE_TTL = 300; // 5 minutes in seconds
  private readonly CACHE_KEYS = {
    CUSTOMER_CART: (customerId: string) => `cart:customer:${customerId}`,
    CART_ITEM: (itemId: string) => `cart:item:${itemId}`,
    CUSTOMER_CART_PATTERN: (customerId: string) =>
      `cart:customer:${customerId}*`,
    ALL_CARTS_PATTERN: 'cart:*'
  };

  constructor(
    private readonly cartItemsRepository: CartItemsRepository,
    private readonly restaurantRepository: RestaurantsRepository,
    private readonly customersRepository: CustomersRepository,
    private readonly menuItemsRepository: MenuItemsRepository,
    private readonly menuItemVariantsRepository: MenuItemVariantsRepository,
    private readonly redisService: RedisService
  ) {}

  /**
   * Cache helper methods
   */
  private async invalidateCustomerCartCache(customerId: string): Promise<void> {
    try {
      const pattern = this.CACHE_KEYS.CUSTOMER_CART_PATTERN(customerId);
      await this.redisService.deleteByPattern(pattern);
      logger.log(`Invalidated cart cache for customer: ${customerId}`);
    } catch (error) {
      logger.warn(
        `Failed to invalidate cart cache for customer ${customerId}:`,
        error
      );
    }
  }

  private async invalidateCartItemCache(cartItemId: string): Promise<void> {
    try {
      const key = this.CACHE_KEYS.CART_ITEM(cartItemId);
      await this.redisService.del(key);
      logger.log(`Invalidated cache for cart item: ${cartItemId}`);
    } catch (error) {
      logger.warn(
        `Failed to invalidate cache for cart item ${cartItemId}:`,
        error
      );
    }
  }

  private async setCachedData(
    key: string,
    data: any,
    ttl: number = this.CACHE_TTL
  ): Promise<void> {
    try {
      await this.redisService.set(key, JSON.stringify(data), ttl * 1000);
      logger.log(`Cached data with key: ${key}`);
    } catch (error) {
      logger.warn(`Failed to cache data with key ${key}:`, error);
    }
  }

  private async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redisService.get(key);
      if (cached) {
        logger.log(`Cache hit for key: ${key}`);
        return JSON.parse(cached);
      }
      logger.log(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      logger.warn(`Failed to get cached data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Clear all cart-related caches
   */
  async clearAllCartCaches(): Promise<void> {
    try {
      await this.redisService.deleteByPattern(
        this.CACHE_KEYS.ALL_CARTS_PATTERN
      );
      logger.log('Cleared all cart caches');
    } catch (error) {
      logger.warn('Failed to clear all cart caches:', error);
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

  async create(createCartItemDto: CreateCartItemDto): Promise<any> {
    try {
      const { variants, item_id, customer_id } = createCartItemDto;

      if (!item_id || !customer_id) {
        return createResponse(
          'MissingInput',
          null,
          'Item ID and Customer ID are required'
        );
      }

      console.log('Starting cart item creation:', { item_id, customer_id });

      const [menuItem, customer] = await Promise.all([
        this.menuItemsRepository.findById(item_id),
        this.customersRepository.findById(customer_id)
      ]);

      if (!menuItem || !customer) {
        console.log('MenuItem or Customer not found:', { menuItem, customer });
        return createResponse(
          'NotFound',
          null,
          'MenuItem or Customer not found'
        );
      }

      console.log('Fetched menuItem and customer successfully');

      const restaurant = await this.restaurantRepository.findById(
        menuItem.restaurant_id
      );
      if (!restaurant) {
        console.log('Restaurant not found:', menuItem.restaurant_id);
        return createResponse('NotFound', null, 'Restaurant not found');
      }

      console.log('Fetched restaurant successfully');

      const existingCartItem = await this.cartItemsRepository.findOne({
        where: { customer_id: Equal(customer_id), item_id: Equal(item_id) }
      });

      console.log('Checked existing cart item:', { existingCartItem });

      if (existingCartItem) {
        console.log('Updating existing cart item:', existingCartItem.id);
        const updatedVariants = await Promise.race([
          this.updateExistingCartItemVariants(
            existingCartItem,
            variants || [],
            restaurant.promotions || [],
            menuItem
          ),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('updateExistingCartItemVariants timeout')),
              5000
            )
          )
        ]);

        console.log('Updated variants:', updatedVariants);

        const updated = await this.cartItemsRepository.update(
          existingCartItem.id,
          {
            variants: updatedVariants as any,
            updated_at: Math.floor(Date.now() / 1000),
            item_id: existingCartItem.item_id,
            customer_id: existingCartItem.customer_id,
            restaurant_id: existingCartItem.restaurant_id
          }
        );

        console.log('Cart item updated:', updated);

        // Invalidate cache for this customer
        await this.invalidateCustomerCartCache(customer_id);

        return createResponse(
          'OK',
          updated,
          'Cart item added quantity successfully'
        );
      }

      console.log('Creating new cart item');
      const populatedVariants = await Promise.race([
        this.populateVariants(
          variants || [],
          restaurant.promotions || [],
          menuItem
        ),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('populateVariants timeout')), 5000)
        )
      ]);

      console.log('Populated variants:', populatedVariants);

      const newCartItem = await this.cartItemsRepository.create({
        ...createCartItemDto,
        variants: populatedVariants as any,
        restaurant_id: menuItem.restaurant_id
      });

      console.log('Created new cart item:', newCartItem);

      // Invalidate cache for this customer
      await this.invalidateCustomerCartCache(customer_id);

      return createResponse(
        'OK',
        newCartItem,
        'Cart item created successfully'
      );
    } catch (error: any) {
      console.error('Error creating cart item:', error);
      return createResponse(
        'ServerError',
        null,
        `Failed to create cart item: ${error.message}`
      );
    }
  }

  async update(id: string, updateCartItemDto: UpdateCartItemDto): Promise<any> {
    const { variants, item_id, customer_id, ...updateData } = updateCartItemDto;

    try {
      let menuItem = null;
      if (item_id) {
        menuItem = await this.menuItemsRepository.findById(item_id);
        if (!menuItem) {
          return createResponse(
            'NotFound',
            null,
            `MenuItem with ID ${item_id} not found`
          );
        }
      }

      if (customer_id) {
        const customer = await this.customersRepository.findById(customer_id);
        if (!customer) {
          return createResponse(
            'NotFound',
            null,
            `Customer with ID ${customer_id} not found`
          );
        }
      }

      const existingCartItem = await this.cartItemsRepository.findById(id);
      if (!existingCartItem) {
        return createResponse(
          'NotFound',
          null,
          `Cart item with ID ${id} not found`
        );
      }

      menuItem =
        menuItem ||
        (await this.menuItemsRepository.findById(existingCartItem.item_id));
      const restaurant = await this.restaurantRepository.findById(
        existingCartItem.restaurant_id
      );
      if (!restaurant) {
        return createResponse('NotFound', null, 'Restaurant not found');
      }

      const updatedVariants = variants
        ? await this.populateVariants(
            variants,
            restaurant.promotions || [],
            menuItem
          )
        : existingCartItem.variants;

      const updatedCartItem = await this.cartItemsRepository.update(id, {
        ...updateData,
        updated_at: Math.floor(Date.now() / 1000),
        item_id: existingCartItem.item_id,
        customer_id: existingCartItem.customer_id,
        variants: updatedVariants
      });

      // Invalidate cache for this customer and specific cart item
      await Promise.all([
        this.invalidateCustomerCartCache(existingCartItem.customer_id),
        this.invalidateCartItemCache(id)
      ]);

      return createResponse(
        'OK',
        updatedCartItem,
        'Cart item updated successfully'
      );
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      return createResponse(
        'ServerError',
        null,
        `Failed to update cart item: ${error.message}`
      );
    }
  }

  async findAll(query: Record<string, any> = {}): Promise<any> {
    const start = Date.now();

    try {
      // Create cache key based on query parameters
      const queryString = JSON.stringify(query);
      const cacheKey = query.customer_id
        ? this.CACHE_KEYS.CUSTOMER_CART(query.customer_id)
        : `cart:query:${Buffer.from(queryString).toString('base64')}`;

      // Try to get from cache first
      const cacheStart = Date.now();
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        logger.log(`Cache hit for cart items in ${Date.now() - cacheStart}ms`);
        logger.log(`Total time (cache): ${Date.now() - start}ms`);
        return createResponse(
          'OK',
          cachedData,
          'Cart items fetched from cache successfully'
        );
      }

      logger.log(`Cache miss for cart items query: ${queryString}`);

      // Fetch from database
      const dbStart = Date.now();
      const cartItems = await this.cartItemsRepository.findAll(query);
      logger.log(`Database fetch took ${Date.now() - dbStart}ms`);

      if (!cartItems || cartItems.length === 0) {
        // Cache empty result to prevent unnecessary DB queries
        await this.setCachedData(cacheKey, [], 60); // Shorter TTL for empty results
        return createResponse('OK', [], 'No cart items found');
      }

      // Process cart items in parallel for better performance
      const populationStart = Date.now();
      const populatedCartItems = await Promise.all(
        cartItems.map(cartItem => this.populateCartItemDetails(cartItem))
      );

      // Filter out any null results (items not found)
      const validCartItems = populatedCartItems.filter(item => item !== null);
      logger.log(`Population took ${Date.now() - populationStart}ms`);

      // Cache the results
      const cacheSaveStart = Date.now();
      await this.setCachedData(cacheKey, validCartItems, this.CACHE_TTL);
      logger.log(`Cache save took ${Date.now() - cacheSaveStart}ms`);

      logger.log(`Total processing time: ${Date.now() - start}ms`);
      return createResponse(
        'OK',
        validCartItems,
        'Cart items fetched successfully'
      );
    } catch (error: any) {
      logger.error('Error fetching cart items:', error);
      return createResponse(
        'ServerError',
        null,
        `Failed to fetch cart items: ${error.message}`
      );
    }
  }

  /**
   * Helper method to populate cart item details with caching for individual components
   */
  private async populateCartItemDetails(cartItem: any): Promise<any | null> {
    try {
      // Use Promise.all for parallel fetching of menu item and restaurant
      const [menuItem, restaurant] = await Promise.all([
        this.getMenuItemCached(cartItem.item_id),
        this.getRestaurantCached(cartItem.restaurant_id)
      ]);

      if (!menuItem) {
        logger.warn(`MenuItem with ID ${cartItem.item_id} not found`);
        return null;
      }

      if (!restaurant) {
        logger.warn(`Restaurant with ID ${cartItem.restaurant_id} not found`);
        return null;
      }

      const now = Math.floor(Date.now() / 1000);
      const itemCategories = menuItem.category || [];
      const applicablePromotions = this.getApplicablePromotions(
        restaurant.promotions,
        itemCategories,
        now
      );

      const populatedVariants = await Promise.all(
        cartItem.variants.map(variant =>
          this.populateVariantDetails(variant, applicablePromotions)
        )
      );

      return {
        ...cartItem,
        item: menuItem,
        variants: populatedVariants,
        restaurantDetails: restaurant
      };
    } catch (error) {
      logger.error(`Error populating cart item ${cartItem.id}:`, error);
      return null;
    }
  }

  /**
   * Get menu item with caching
   */
  private async getMenuItemCached(itemId: string): Promise<any | null> {
    const cacheKey = `menu_item:${itemId}`;

    let menuItem = await this.getCachedData(cacheKey);
    if (!menuItem) {
      menuItem = await this.menuItemsRepository.findById(itemId);
      if (menuItem) {
        await this.setCachedData(cacheKey, menuItem, 3600); // Cache for 1 hour
      }
    }

    return menuItem;
  }

  /**
   * Get restaurant with caching
   */
  private async getRestaurantCached(restaurantId: string): Promise<any | null> {
    const cacheKey = `restaurant:${restaurantId}`;

    let restaurant = await this.getCachedData(cacheKey);
    if (!restaurant) {
      restaurant = await this.restaurantRepository.findById(restaurantId);
      if (restaurant) {
        await this.setCachedData(cacheKey, restaurant, 3600); // Cache for 1 hour
      }
    }

    return restaurant;
  }

  /**
   * Get applicable promotions (optimized filter)
   */
  private getApplicablePromotions(
    promotions: Promotion[] | undefined,
    itemCategories: string[],
    now: number
  ): Promotion[] {
    if (!promotions || promotions.length === 0) {
      return [];
    }

    return promotions.filter(promotion => {
      const isActive =
        promotion.status === 'ACTIVE' &&
        now >= Number(promotion.start_date) &&
        now <= Number(promotion.end_date);

      const hasMatchingCategory =
        promotion.food_category_ids?.some(categoryId =>
          itemCategories.includes(categoryId)
        ) || false;

      return isActive && hasMatchingCategory;
    });
  }

  /**
   * Populate variant details with caching
   */
  private async populateVariantDetails(
    variant: any,
    applicablePromotions: Promotion[]
  ): Promise<any> {
    const cacheKey = `variant:${variant.variant_id}`;

    let variantDetails: any = await this.getCachedData(cacheKey);
    if (!variantDetails) {
      variantDetails = await this.menuItemVariantsRepository.findById(
        variant.variant_id
      );
      if (variantDetails) {
        await this.setCachedData(cacheKey, variantDetails, 3600); // Cache for 1 hour
      }
    }

    if (!variantDetails || !variantDetails.price || !variantDetails.variant) {
      return {
        variant_id: variant.variant_id,
        variant_name: 'Unknown',
        variant_price_at_time_of_addition: 0,
        quantity: variant.quantity,
        price_after_applied_promotion: null
      };
    }

    let priceAfterPromotion: number | null = null;
    if (applicablePromotions.length > 0) {
      applicablePromotions.forEach(promotion => {
        const discountedPrice = this.calculateDiscountedPrice(
          Number(variantDetails.price),
          promotion
        );
        if (
          priceAfterPromotion === null ||
          discountedPrice < priceAfterPromotion
        ) {
          priceAfterPromotion = discountedPrice;
        }
      });
    }

    return {
      variant_id: variant.variant_id,
      variant_name: variantDetails.variant,
      variant_price_at_time_of_addition: Number(variantDetails.price),
      quantity: variant.quantity,
      price_after_applied_promotion: priceAfterPromotion
    };
  }

  async findById(id: string): Promise<any> {
    const start = Date.now();

    try {
      const cacheKey = this.CACHE_KEYS.CART_ITEM(id);

      // Try to get from cache first
      const cacheStart = Date.now();
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        logger.log(
          `Cache hit for cart item ${id} in ${Date.now() - cacheStart}ms`
        );
        logger.log(`Total time (cache): ${Date.now() - start}ms`);
        return createResponse(
          'OK',
          cachedData,
          'Cart item fetched from cache successfully'
        );
      }

      logger.log(`Cache miss for cart item: ${id}`);

      // Fetch from database
      const dbStart = Date.now();
      const cartItem = await this.cartItemsRepository.findById(id);
      if (!cartItem) {
        return createResponse('NotFound', null, 'Cart item not found');
      }
      logger.log(`Database fetch took ${Date.now() - dbStart}ms`);

      // Populate cart item details using the cached helper method
      const populationStart = Date.now();
      const populatedCartItem = await this.populateCartItemDetails(cartItem);
      if (!populatedCartItem) {
        return createResponse('NotFound', null, 'Cart item details not found');
      }
      logger.log(`Population took ${Date.now() - populationStart}ms`);

      // Cache the result
      const cacheSaveStart = Date.now();
      await this.setCachedData(cacheKey, populatedCartItem, this.CACHE_TTL);
      logger.log(`Cache save took ${Date.now() - cacheSaveStart}ms`);

      logger.log(`Total processing time: ${Date.now() - start}ms`);
      return createResponse(
        'OK',
        populatedCartItem,
        'Cart item fetched successfully'
      );
    } catch (error: any) {
      logger.error('Error fetching cart item:', error);
      return createResponse(
        'ServerError',
        null,
        `Failed to fetch cart item: ${error.message}`
      );
    }
  }

  async findOne(query: Record<string, any>): Promise<any> {
    const start = Date.now();

    try {
      // Create cache key based on query parameters
      const queryString = JSON.stringify(query);
      const cacheKey = `cart:findone:${Buffer.from(queryString).toString('base64')}`;

      // Try to get from cache first
      const cacheStart = Date.now();
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        logger.log(
          `Cache hit for findOne query in ${Date.now() - cacheStart}ms`
        );
        logger.log(`Total time (cache): ${Date.now() - start}ms`);
        return createResponse(
          'OK',
          cachedData,
          'Cart item fetched from cache successfully'
        );
      }

      logger.log(`Cache miss for findOne query: ${queryString}`);

      // Fetch from database
      const dbStart = Date.now();
      const cartItem = await this.cartItemsRepository.findOne(query);
      if (!cartItem) {
        return createResponse('NotFound', null, 'Cart item not found');
      }
      logger.log(`Database fetch took ${Date.now() - dbStart}ms`);

      // Populate cart item details using the cached helper method
      const populationStart = Date.now();
      const populatedCartItem = await this.populateCartItemDetails(cartItem);
      if (!populatedCartItem) {
        return createResponse('NotFound', null, 'Cart item details not found');
      }
      logger.log(`Population took ${Date.now() - populationStart}ms`);

      // Cache the result
      const cacheSaveStart = Date.now();
      await this.setCachedData(cacheKey, populatedCartItem, this.CACHE_TTL);
      logger.log(`Cache save took ${Date.now() - cacheSaveStart}ms`);

      logger.log(`Total processing time: ${Date.now() - start}ms`);
      return createResponse(
        'OK',
        populatedCartItem,
        'Cart item fetched successfully'
      );
    } catch (error: any) {
      logger.error('Error fetching cart item:', error);
      return createResponse(
        'ServerError',
        null,
        `Failed to fetch cart item: ${error.message}`
      );
    }
  }

  async remove(id: string): Promise<any> {
    try {
      // Get cart item first to get customer_id for cache invalidation
      const cartItem = await this.cartItemsRepository.findById(id);
      if (!cartItem) {
        return createResponse('NotFound', null, 'Cart item not found');
      }

      const deleted = await this.cartItemsRepository.remove(id);
      if (!deleted) {
        return createResponse('NotFound', null, 'Cart item not found');
      }

      // Invalidate cache for this customer and specific cart item
      await Promise.all([
        this.invalidateCustomerCartCache(cartItem.customer_id),
        this.invalidateCartItemCache(id)
      ]);

      return createResponse('OK', null, 'Cart item deleted successfully');
    } catch (error: any) {
      logger.error('Error deleting cart item:', error);
      return createResponse(
        'ServerError',
        null,
        `Failed to delete cart item: ${error.message}`
      );
    }
  }

  private async populateVariants(
    variants: { variant_id: string; quantity: number }[],
    promotions: Promotion[],
    menuItem: any
  ) {
    const now = Math.floor(Date.now() / 1000);
    const itemCategories = menuItem.category || [];

    return Promise.all(
      variants.map(async variant => {
        const variantDetails = await this.menuItemVariantsRepository.findById(
          variant.variant_id
        );
        if (!variantDetails) {
          console.warn(`Variant not found: ${variant.variant_id}`);
          throw new Error(`Variant with ID ${variant.variant_id} not found`);
        }

        let priceToUse = variantDetails.price;

        if (promotions?.length > 0) {
          const applicablePromotions = promotions.filter(promotion => {
            const isActive =
              promotion.status === 'ACTIVE' &&
              now >= Number(promotion.start_date) &&
              now <= Number(promotion.end_date);
            const hasMatchingCategory =
              promotion.food_category_ids?.some(categoryId =>
                itemCategories.includes(categoryId)
              ) || false;
            return isActive && hasMatchingCategory;
          });

          if (applicablePromotions.length > 0) {
            let priceAfterPromotion: number | null = null;
            applicablePromotions.forEach(promotion => {
              const discountedPrice = this.calculateDiscountedPrice(
                variantDetails.price,
                promotion
              );
              if (
                priceAfterPromotion === null ||
                discountedPrice < priceAfterPromotion
              ) {
                priceAfterPromotion = discountedPrice;
              }
            });
            if (priceAfterPromotion !== null) {
              priceToUse = priceAfterPromotion;
            }
          }
        }

        return {
          variant_id: variant.variant_id,
          variant_name: variantDetails.variant,
          variant_price_at_time_of_addition: priceToUse,
          quantity: variant.quantity
        };
      })
    );
  }

  private async updateExistingCartItemVariants(
    existingCartItem: CartItem,
    newVariants: { variant_id: string; quantity: number }[],
    promotions: Promotion[],
    menuItem: any
  ) {
    const updatedVariants = [...existingCartItem.variants];
    const now = Math.floor(Date.now() / 1000);
    const itemCategories = menuItem.category || [];

    for (const newVariant of newVariants) {
      const existingVariantIndex = updatedVariants.findIndex(
        v => v.variant_id === newVariant.variant_id
      );

      const variantDetails = await this.menuItemVariantsRepository.findById(
        newVariant.variant_id
      );
      if (!variantDetails) {
        console.warn(`Variant not found: ${newVariant.variant_id}`);
        throw new Error(`Variant with ID ${newVariant.variant_id} not found`);
      }

      let priceToUse = variantDetails.price;

      if (promotions?.length > 0) {
        const applicablePromotions = promotions.filter(promotion => {
          const isActive =
            promotion.status === 'ACTIVE' &&
            now >= Number(promotion.start_date) &&
            now <= Number(promotion.end_date);
          const hasMatchingCategory =
            promotion.food_category_ids?.some(categoryId =>
              itemCategories.includes(categoryId)
            ) || false;
          return isActive && hasMatchingCategory;
        });

        if (applicablePromotions.length > 0) {
          let priceAfterPromotion: number | null = null;
          applicablePromotions.forEach(promotion => {
            const discountedPrice = this.calculateDiscountedPrice(
              variantDetails.price,
              promotion
            );
            if (
              priceAfterPromotion === null ||
              discountedPrice < priceAfterPromotion
            ) {
              priceAfterPromotion = discountedPrice;
            }
          });
          if (priceAfterPromotion !== null) {
            priceToUse = priceAfterPromotion;
          }
        }
      }

      if (existingVariantIndex > -1) {
        updatedVariants[existingVariantIndex].quantity += newVariant.quantity;
        updatedVariants[
          existingVariantIndex
        ].variant_price_at_time_of_addition = priceToUse;
      } else {
        updatedVariants.push({
          variant_id: newVariant.variant_id,
          variant_name: variantDetails.variant,
          variant_price_at_time_of_addition: priceToUse,
          quantity: newVariant.quantity
        });
      }
    }

    return updatedVariants;
  }
}
