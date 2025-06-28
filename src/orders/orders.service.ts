import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  Order,
  OrderStatus,
  OrderTrackingInfo,
  OrderCancellationReason
  // OrderItem
} from './entities/order.entity';
import { createResponse, ApiResponse } from 'src/utils/createResponse';
import { AddressBookRepository } from 'src/address_book/address_book.repository';
import { RestaurantsRepository } from 'src/restaurants/restaurants.repository';
import { CustomersRepository } from 'src/customers/customers.repository';
import { MenuItemsRepository } from 'src/menu_items/menu_items.repository';
import { MenuItemVariantsRepository } from 'src/menu_item_variants/menu_item_variants.repository';
import { DataSource, EntityManager, DeepPartial, Repository } from 'typeorm';
import { CartItemsRepository } from 'src/cart_items/cart_items.repository';
import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { CustomersGateway } from 'src/customers/customers.gateway';
import { DriversGateway } from 'src/drivers/drivers.gateway';
import { TransactionService } from 'src/transactions/transactions.service';
import { CreateTransactionDto } from 'src/transactions/dto/create-transaction.dto';
import { FWalletsRepository } from 'src/fwallets/fwallets.repository';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { MenuItem } from 'src/menu_items/entities/menu_item.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { DriverStatsService } from 'src/driver_stats_records/driver_stats_records.service';
import { DriverProgressStage } from 'src/driver_progress_stages/entities/driver_progress_stage.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DriversService } from 'src/drivers/drivers.service';
import { createClient } from 'redis';
import * as dotenv from 'dotenv';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'src/redis/redis.service';
import { OrdersRepository } from './orders.repository';
import { calculateDistance } from 'src/utils/commonFunctions';
import { FLASHFOOD_FINANCE } from 'src/utils/constants';
import { FinanceRule } from 'src/finance_rules/entities/finance_rule.entity';
import { MenuItemVariant } from 'src/menu_item_variants/entities/menu_item_variant.entity';

dotenv.config();

const logger = new Logger('OrdersService');

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
// Add Redis connection event logs
redis.on('error', err => logger.error('Redis error:', err));
redis.on('end', () => logger.error('Redis connection closed'));
redis.on('reconnecting', () => logger.warn('Redis reconnecting...'));
redis.on('connect', () => logger.log('Redis connected'));
redis.connect().catch(err => logger.error('Redis connection error:', err));

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly menuItemsRepository: MenuItemsRepository,
    private readonly menuItemVariantsRepository: MenuItemVariantsRepository,
    private readonly addressBookRepository: AddressBookRepository,
    private readonly customersRepository: CustomersRepository,
    private readonly driverStatsService: DriverStatsService,
    private readonly restaurantsRepository: RestaurantsRepository,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly cartItemsRepository: CartItemsRepository,
    private readonly orderRepository: OrdersRepository,
    private readonly customersGateway: CustomersGateway,
    @Inject(forwardRef(() => DriversGateway))
    private readonly driversGateway: DriversGateway,
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
    private readonly fWalletsRepository: FWalletsRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly driverService: DriversService,
    private readonly redisService: RedisService
  ) {
    logger.log('OrdersService constructor called');
    logger.log('Checking injected dependencies:');
    logger.log('- ordersRepository:', !!this.ordersRepository);
    logger.log('- menuItemsRepository:', !!this.menuItemsRepository);
    logger.log(
      '- menuItemVariantsRepository:',
      !!this.menuItemVariantsRepository
    );
    logger.log('- addressBookRepository:', !!this.addressBookRepository);
    logger.log('- customersRepository:', !!this.customersRepository);
    logger.log('- driverStatsService:', !!this.driverStatsService);
    logger.log('- restaurantsRepository:', !!this.restaurantsRepository);
    logger.log('- dataSource:', !!this.dataSource);
    logger.log('- cartItemsRepository:', !!this.cartItemsRepository);
    logger.log('- orderRepository:', !!this.orderRepository);
    logger.log('- customersGateway:', !!this.customersGateway);
    logger.log('- driversGateway:', !!this.driversGateway);
    logger.log('- transactionService:', !!this.transactionService);
    logger.log('- fWalletsRepository:', !!this.fWalletsRepository);
    logger.log('- eventEmitter:', !!this.eventEmitter);
    logger.log('- driverService:', !!this.driverService);
    logger.log('- redisService:', !!this.redisService);
  }

  private async getLatestFinanceRule(
    transactionalEntityManager?: EntityManager
  ): Promise<FinanceRule | null> {
    const cacheKey = 'latest_finance_rule';
    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.log(`Fetch finance rule (cache)`);
      return JSON.parse(cached);
    }
    const manager = transactionalEntityManager || this.dataSource.manager;
    const rule = await manager
      .getRepository(FinanceRule)
      .createQueryBuilder('finance_rule')
      .orderBy(
        'COALESCE(finance_rule.updated_at, finance_rule.created_at)',
        'DESC'
      )
      .getOne();
    if (rule) {
      await redis.setEx(cacheKey, 7200, JSON.stringify(rule));
      logger.log(`Stored finance rule in Redis: ${cacheKey}`);
    }
    return rule;
  }

  async createOrder(
    createOrderDto: CreateOrderDto,
    isGenerated: boolean = false
  ): Promise<ApiResponse<any>> {
    const start = Date.now();
    logger.log(
      'createOrder called with:',
      JSON.stringify(createOrderDto),
      'isGenerated:',
      isGenerated
    );

    // Generate random timestamps if isGenerated is true
    let orderTimestamp: number;
    let createdAtTimestamp: number;
    let updatedAtTimestamp: number;

    if (isGenerated) {
      // Get timestamp from 1 month ago
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const oneMonthAgoTs = oneMonthAgo.getTime();
      const nowTs = Date.now();

      // First, pick a random date between 1 month ago and now
      const randomDateTs = Math.floor(
        Math.random() * (nowTs - oneMonthAgoTs) + oneMonthAgoTs
      );
      const randomDate = new Date(randomDateTs);
      randomDate.setUTCHours(0, 0, 0, 0);
      const startOfDay = randomDate.getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

      // Generate three different timestamps within the same day (in seconds)
      // Order: created_at < order_time < updated_at
      const dayDuration = endOfDay - startOfDay;

      createdAtTimestamp = Math.floor(
        (Math.random() * (dayDuration / 3) + startOfDay) / 1000
      );

      orderTimestamp = Math.floor(
        (Math.random() * (dayDuration / 3) + (startOfDay + dayDuration / 3)) /
          1000
      );

      updatedAtTimestamp = Math.floor(
        (Math.random() * (dayDuration / 3) +
          (startOfDay + (2 * dayDuration) / 3)) /
          1000
      );

      logger.log(`Generated timestamps for same day:`, {
        date: randomDate.toISOString().split('T')[0],
        created_at: new Date(createdAtTimestamp * 1000).toISOString(),
        order_time: new Date(orderTimestamp * 1000).toISOString(),
        updated_at: new Date(updatedAtTimestamp * 1000).toISOString()
      });
    } else {
      const currentTime = Math.floor(Date.now() / 1000);
      orderTimestamp = currentTime;
      createdAtTimestamp = currentTime;
      updatedAtTimestamp = currentTime;
    }

    try {
      logger.log('Step 1: Checking for duplicate order');
      const orderHash = `${createOrderDto.customer_id}:${orderTimestamp}:${createOrderDto.order_items
        .map(item => item.item_id)
        .sort()
        .join(',')}`;
      const cacheKey = `order_lock:${orderHash}`;
      let lockAcquired;
      try {
        lockAcquired = await redis.set(cacheKey, '1', { NX: true, EX: 60 });
        logger.log('Step 1 result (lockAcquired):', lockAcquired);
      } catch (err) {
        logger.error('Error acquiring Redis lock:', err);
        throw err;
      }
      if (!lockAcquired) {
        logger.warn(`Duplicate order detected: ${orderHash}`);
        return createResponse(
          'DuplicatedRecord',
          null,
          'Order already processed'
        );
      }

      logger.log('Step 2: Batch fetch related data');
      const fetchStart = Date.now();
      let customer,
        restaurant,
        customerAddress,
        restaurantAddress,
        menuItems,
        variants,
        promotion;
      try {
        [
          customer,
          restaurant,
          customerAddress,
          restaurantAddress,
          menuItems,
          variants,
          promotion
        ] = await Promise.all([
          (async () => {
            const start = Date.now();
            const cacheKey = `customer:${createOrderDto.customer_id}`;
            const cached = await redis.get(cacheKey);
            if (cached) {
              logger.log(`Fetch customer (cache) took ${Date.now() - start}ms`);
              return JSON.parse(cached);
            }
            const result = await this.customersRepository.findById(
              createOrderDto.customer_id
            );
            if (result) {
              await redis.setEx(cacheKey, 7200, JSON.stringify(result));
              logger.log(`Stored customer in Redis: ${cacheKey}`);
            } else {
              logger.warn(`Customer not found: ${createOrderDto.customer_id}`);
            }
            logger.log(`Fetch customer took ${Date.now() - start}ms`);
            return result;
          })(),
          (async () => {
            const start = Date.now();
            const cacheKey = `restaurant:${createOrderDto.restaurant_id}`;
            await redis.del(cacheKey);
            const result = await this.restaurantsRepository.findById(
              createOrderDto.restaurant_id
            );
            if (result) {
              logger.log('Restaurant from DB:', {
                id: result.id,
                owner_id: result.owner_id,
                owner: result.owner
              });
              await redis.setEx(cacheKey, 7200, JSON.stringify(result));
            }
            logger.log(`Fetch restaurant took ${Date.now() - start}ms`);
            return result;
          })(),
          (async () => {
            const start = Date.now();
            const cacheKey = `address:${createOrderDto.customer_location}`;
            const cached = await redis.get(cacheKey);
            if (cached) {
              logger.log(
                `Fetch customer address (cache) took ${Date.now() - start}ms`
              );
              return JSON.parse(cached);
            }
            const address = await this.addressBookRepository.findById(
              createOrderDto.customer_location
            );
            if (address)
              await redis.setEx(cacheKey, 7200, JSON.stringify(address));
            logger.log(`Fetch customer address took ${Date.now() - start}ms`);
            return address;
          })(),
          (async () => {
            const start = Date.now();
            const cacheKey = `address:${createOrderDto.restaurant_location}`;
            const cached = await redis.get(cacheKey);
            if (cached) {
              logger.log(
                `Fetch restaurant address (cache) took ${Date.now() - start}ms`
              );
              return JSON.parse(cached);
            }
            const address = await this.addressBookRepository.findById(
              createOrderDto.restaurant_location
            );
            if (address)
              await redis.setEx(cacheKey, 7200, JSON.stringify(address));
            logger.log(`Fetch restaurant address took ${Date.now() - start}ms`);
            return address;
          })(),
          (async () => {
            const start = Date.now();
            const itemIds = createOrderDto.order_items.map(
              item => item.item_id
            );
            const cacheKey = `menu_items:${itemIds.sort().join(',')}`;
            const cached = await redis.get(cacheKey);
            if (cached) {
              logger.log(
                `Fetch menu items (cache) took ${Date.now() - start}ms`
              );
              return JSON.parse(cached);
            }
            const items = await this.menuItemsRepository.findByIds(itemIds);
            if (items.length > 0) {
              await redis.setEx(cacheKey, 7200, JSON.stringify(items));
              logger.log(`Stored menu items in Redis: ${cacheKey}`);
            } else {
              logger.warn(`No menu items found for IDs: ${itemIds.join(',')}`);
            }
            logger.log(`Fetch menu items took ${Date.now() - start}ms`);
            return items;
          })(),
          (async () => {
            const start = Date.now();
            const variantIds = createOrderDto.order_items
              .filter(item => item.variant_id)
              .map(item => item.variant_id);
            if (!variantIds.length) return [];
            const cacheKey = `variants:${variantIds.join(',')}`;
            const cached = await redis.get(cacheKey);
            if (cached) {
              logger.log(`Fetch variants (cache) took ${Date.now() - start}ms`);
              return JSON.parse(cached);
            }
            const variants =
              await this.menuItemVariantsRepository.findByIds(variantIds);
            await redis.setEx(cacheKey, 7200, JSON.stringify(variants));
            logger.log(`Fetch variants took ${Date.now() - start}ms`);
            return variants;
          })(),
          createOrderDto.promotion_applied
            ? (async () => {
                const start = Date.now();
                const cacheKey = `promotion:${createOrderDto.promotion_applied}`;
                const cached = await redis.get(cacheKey);
                if (cached) {
                  logger.log(
                    `Fetch promotion (cache) took ${Date.now() - start}ms`
                  );
                  return JSON.parse(cached);
                }
                const promo = await this.dataSource
                  .getRepository(Promotion)
                  .findOne({ where: { id: createOrderDto.promotion_applied } });
                if (promo)
                  await redis.setEx(cacheKey, 7200, JSON.stringify(promo));
                logger.log(`Fetch promotion took ${Date.now() - start}ms`);
                return promo;
              })()
            : Promise.resolve(null)
        ]);
      } catch (err) {
        logger.error('Error during batch fetch:', err);
        throw err;
      }
      logger.log('Step 2 result: fetched data', {
        customer,
        restaurant,
        customerAddress,
        restaurantAddress,
        menuItems,
        variants,
        promotion
      });
      logger.log(`Data fetch took ${Date.now() - fetchStart}ms`);

      // Fetch wallets song song
      let customerWallet = null;
      let restaurantWallet = null;
      let adminWallet = null;
      if (
        createOrderDto.payment_method === 'FWallet' &&
        customer &&
        restaurant
      ) {
        const walletStart = Date.now();
        [customerWallet, restaurantWallet, adminWallet] = await Promise.all([
          (async () => {
            const cacheKey = `fwallet:${customer.user_id}`;
            const cached = await redis.get(cacheKey);
            if (cached) {
              logger.log(
                `Fetch customer wallet (cache) took ${Date.now() - walletStart}ms`
              );
              return JSON.parse(cached);
            }
            const wallet = await this.fWalletsRepository.findByUserId(
              customer.user_id
            );
            if (wallet)
              await redis.setEx(cacheKey, 7200, JSON.stringify(wallet));
            logger.log(
              `Fetch customer wallet took ${Date.now() - walletStart}ms`
            );
            return wallet;
          })(),
          (async () => {
            const cacheKey = `fwallet:${restaurant.owner_id}`;
            const cached = await redis.get(cacheKey);
            if (cached) {
              logger.log(
                `Fetch restaurant wallet (cache) took ${Date.now() - walletStart}ms`
              );
              return JSON.parse(cached);
            }
            const wallet = await this.fWalletsRepository.findByUserId(
              restaurant.owner_id
            );
            if (wallet)
              await redis.setEx(cacheKey, 7200, JSON.stringify(wallet));
            logger.log(
              `Fetch restaurant wallet took ${Date.now() - walletStart}ms`
            );
            return wallet;
          })(),
          (async () => {
            const cacheKey = `fwallet:admin`;
            const cached = await redis.get(cacheKey);
            if (cached) {
              logger.log(
                `Fetch admin wallet (cache) took ${Date.now() - walletStart}ms`
              );
              return JSON.parse(cached);
            }
            const wallet = await this.fWalletsRepository.findById(
              FLASHFOOD_FINANCE.id
            );
            if (wallet)
              await redis.setEx(cacheKey, 7200, JSON.stringify(wallet));
            logger.log(`Fetch admin wallet took ${Date.now() - walletStart}ms`);
            return wallet;
          })()
        ]);
      }

      // 2. Validate input
      const validationStart = Date.now();
      const validationResult = await this.validateOrderData(createOrderDto, {
        customer,
        restaurant,
        customerAddress,
        restaurantAddress,
        menuItems,
        variants
      });
      logger.log(`Validation took ${Date.now() - validationStart}ms`);
      if (validationResult !== true) {
        return validationResult;
      }

      // 3. Kiểm tra dữ liệu
      if (!customer) {
        return createResponse(
          'NotFound',
          null,
          `Customer ${createOrderDto.customer_id} not found`
        );
      }
      if (!restaurant) {
        return createResponse(
          'NotFound',
          null,
          `Restaurant ${createOrderDto.restaurant_id} not found`
        );
      }
      if (restaurant.status.is_open === false) {
        return createResponse(
          'NotAcceptingOrders',
          null,
          'Restaurant is not available at the moment'
        );
      }
      if (!customerAddress) {
        return createResponse(
          'NotFound',
          null,
          `Customer address ${createOrderDto.customer_location} not found`
        );
      }
      if (!restaurantAddress) {
        return createResponse(
          'NotFound',
          null,
          `Restaurant address ${createOrderDto.restaurant_location} not found`
        );
      }
      if (
        createOrderDto.payment_method === 'FWallet' &&
        (!customerWallet || !restaurantWallet || !adminWallet)
      ) {
        logger.log('Check wallets:', {
          customerWallet,
          restaurantWallet,
          adminWallet
        });
        return createResponse('NotFound', null, `Wallet not found`);
      }

      // 4. Tính giá và áp dụng promotion
      // const calcStart = Date.now();
      let customerSubTotal = 0;
      let restaurantSubTotal = 0;
      let appliedPromotion: Promotion | null = null;

      let distance = 0;
      if (customerAddress?.location && restaurantAddress?.location) {
        distance = calculateDistance(
          customerAddress.location.lat,
          customerAddress.location.lng,
          restaurantAddress.location.lat,
          restaurantAddress.location.lng
        );
      }

      const menuItemMap = new Map(menuItems.map(mi => [mi.id, mi]));
      const variantMap = new Map(variants.map(v => [v.id, v]));
      const updatedOrderItems = createOrderDto.order_items.map(item => {
        const menuItem = menuItemMap.get(item.item_id);
        if (!menuItem) {
          throw new Error(`Menu item ${item.item_id} not found`);
        }

        // Lấy giá từ variant mới nhất trong CSDL
        let originalPrice = item.price_at_time_of_order;
        if (item.variant_id) {
          const variant = variantMap.get(item.variant_id) as MenuItemVariant;
          if (!variant) {
            throw new Error(`Variant ${item.variant_id} not found`);
          }
          originalPrice = variant.price; // Giá mới nhất từ CSDL
          logger.log(`Using variant price for ${item.name}: ${originalPrice}`);
        } else {
          logger.warn(
            `No variant for item ${item.item_id}, using DTO price: ${originalPrice}`
          );
        }
        restaurantSubTotal += originalPrice * item.quantity;

        // Áp dụng khuyến mãi cho customerSubTotal
        let discountedPrice = originalPrice;
        if (
          promotion &&
          createOrderDto.promotion_applied &&
          (menuItem as MenuItem & { category: string[] }).category?.some(cat =>
            promotion.food_category_ids.includes(cat)
          )
        ) {
          const now = Math.floor(Date.now() / 1000);
          if (
            promotion.start_date <= now &&
            promotion.end_date >= now &&
            promotion.status === 'ACTIVE'
          ) {
            appliedPromotion = promotion;
            if (promotion.discount_type === 'PERCENTAGE') {
              discountedPrice =
                originalPrice * (1 - promotion.discount_value / 100);
            } else if (promotion.discount_type === 'FIXED') {
              discountedPrice = Math.max(
                0,
                originalPrice - promotion.discount_value
              );
            }
            discountedPrice = Number(discountedPrice.toFixed(2));
          }
        }

        customerSubTotal += discountedPrice * item.quantity;

        return {
          ...item,
          price_after_applied_promotion: discountedPrice,
          price_at_time_of_order: originalPrice // Lưu giá CSDL vào đơn hàng
        };
      });

      customerSubTotal +=
        createOrderDto.delivery_fee + createOrderDto.service_fee;
      customerSubTotal = Number(customerSubTotal.toFixed(2));
      restaurantSubTotal = Number(restaurantSubTotal.toFixed(2));

      // REMOVED: Total amount validation - createOrderDto.total_amount already includes promotion deductions
      // The frontend sends the final amount after applying promotions/discounts
      // So we should not validate against the calculated subtotal
      logger.log(
        `Order total amount: calculated=${customerSubTotal}, provided=${createOrderDto.total_amount} (using provided amount)`
      );

      // 5. Transaction
      const txStart = Date.now();
      const result = await this.dataSource.transaction(
        async transactionalEntityManager => {
          // Calculate commissions
          const latestFinanceRule = await this.getLatestFinanceRule(
            transactionalEntityManager
          );
          let commissionRate =
            latestFinanceRule &&
            typeof latestFinanceRule.restaurant_commission === 'number'
              ? latestFinanceRule.restaurant_commission
              : 0.1;
          if (commissionRate < 0 || commissionRate > 1) {
            logger.warn(
              `Invalid commission rate ${commissionRate}, using default 0.1`
            );
            commissionRate = 0.1;
          }
          const adminCommission = Number(
            (restaurantSubTotal * commissionRate).toFixed(2)
          );
          const restaurantRevenue = Number(
            (restaurantSubTotal * (1 - commissionRate)).toFixed(2)
          );

          logger.log(`Price calculation:`, {
            customerSubTotal,
            restaurantSubTotal,
            adminCommission,
            restaurantRevenue,
            deliveryFee: createOrderDto.delivery_fee,
            serviceFee: createOrderDto.service_fee
          });

          if (createOrderDto.payment_method === 'FWallet') {
            const walletBalance = Number(
              parseFloat(customerWallet!.balance.toString()).toFixed(2)
            );
            if (walletBalance < customerSubTotal) {
              return createResponse(
                'InsufficientBalance',
                null,
                'Insufficient balance'
              );
            }
            createOrderDto.payment_status = 'PAID';
          } else {
            createOrderDto.payment_status = 'PENDING';
          }

          const orderData: DeepPartial<Order> = {
            ...createOrderDto,
            total_amount: customerSubTotal,
            order_items: updatedOrderItems,
            promotions_applied: appliedPromotion ? [appliedPromotion] : [],
            status: (createOrderDto.status ||
              OrderStatus.PENDING) as OrderStatus,
            tracking_info: (createOrderDto.tracking_info ||
              OrderTrackingInfo.ORDER_PLACED) as OrderTrackingInfo,
            customerAddress: { id: customerAddress.id },
            restaurantAddress: { id: restaurantAddress.id },
            order_time: orderTimestamp,
            created_at: createdAtTimestamp,
            updated_at: updatedAtTimestamp,
            distance: Number(distance.toFixed(4))
          };

          // Lưu đơn hàng trước để có order_id
          logger.log('Saving order...');
          const newOrder = new Order();
          Object.assign(newOrder, orderData);

          // Override timestamps if generated to bypass BeforeInsert hook
          if (isGenerated) {
            newOrder.created_at = createdAtTimestamp;
            newOrder.updated_at = updatedAtTimestamp;
            newOrder.order_time = orderTimestamp;
            logger.log('Set generated timestamps on entity:', {
              created_at: newOrder.created_at,
              updated_at: newOrder.updated_at,
              order_time: newOrder.order_time
            });
          }

          const savedOrder = await transactionalEntityManager.save(
            Order,
            newOrder
          );
          logger.log(`Order saved with id: ${savedOrder.id}`);

          // Verify saved timestamps
          if (isGenerated) {
            logger.log('Verified saved timestamps:', {
              created_at: savedOrder.created_at,
              updated_at: savedOrder.updated_at,
              order_time: savedOrder.order_time
            });
          }

          orderData.id = savedOrder.id;

          if (createOrderDto.payment_method === 'FWallet') {
            if (!restaurant.owner_id) {
              logger.error('Restaurant owner_id not found');
              return createResponse(
                'ServerError',
                null,
                'Restaurant owner not found'
              );
            }

            logger.log('Debug user IDs:', {
              customer: {
                user_id: customer.user_id,
                wallet_id: customerWallet?.id
              },
              admin: {
                user_id: FLASHFOOD_FINANCE.user_id,
                wallet_id: adminWallet?.id
              },
              restaurant: {
                user_id: restaurant.owner_id,
                wallet_id: restaurantWallet?.id
              }
            });

            // Transaction 1: Khách trả admin (dto.total_amount)
            const customerTxDto = {
              user_id: customer.user_id,
              fwallet_id: customerWallet!.id,
              transaction_type: 'PURCHASE',
              amount: customerSubTotal,
              balance_after: Number(
                (customerWallet!.balance - customerSubTotal).toFixed(2)
              ),
              status: 'PENDING',
              source: 'FWALLET',
              destination: adminWallet!.id,
              destination_type: 'FWALLET',
              version: customerWallet!.version,
              order_id: orderData.id
            } as CreateTransactionDto;

            logger.log(
              `Creating customer transaction: ${JSON.stringify(customerTxDto)}`
            );
            const customerTxResponse = await this.transactionService.create(
              customerTxDto,
              transactionalEntityManager
            );
            if (customerTxResponse.EC !== 0) {
              logger.error(
                `Customer transaction failed: ${JSON.stringify(customerTxResponse)}`
              );
              return customerTxResponse;
            }

            // Cập nhật ví admin
            const updatedAdminWallet = await this.fWalletsRepository.findById(
              FLASHFOOD_FINANCE.id,
              transactionalEntityManager
            );
            if (!updatedAdminWallet) {
              logger.error('Failed to get updated admin wallet');
              return createResponse(
                'ServerError',
                null,
                'Failed to get updated admin wallet'
              );
            }

            // Transaction 2: Admin trả nhà hàng (restaurantSubTotal)
            const adminToRestaurantTxDto = {
              user_id: FLASHFOOD_FINANCE.user_id,
              fwallet_id: updatedAdminWallet.id,
              transaction_type: 'DEPOSIT',
              amount: restaurantSubTotal,
              balance_after: Number(
                (updatedAdminWallet.balance - restaurantSubTotal).toFixed(2)
              ),
              status: 'PENDING',
              source: 'FWALLET',
              destination: restaurantWallet!.id,
              destination_type: 'FWALLET',
              version: updatedAdminWallet.version,
              order_id: orderData.id
            } as CreateTransactionDto;

            logger.log(
              `Creating admin to restaurant transaction: ${JSON.stringify(adminToRestaurantTxDto)}`
            );
            const adminToRestaurantTxResponse =
              await this.transactionService.create(
                adminToRestaurantTxDto,
                transactionalEntityManager
              );
            if (adminToRestaurantTxResponse.EC !== 0) {
              logger.error(
                `Admin to restaurant transaction failed: ${JSON.stringify(adminToRestaurantTxResponse)}`
              );
              return adminToRestaurantTxResponse;
            }

            // Cập nhật ví nhà hàng
            const updatedRestaurantWallet =
              await this.fWalletsRepository.findByUserId(
                restaurant.owner_id,
                transactionalEntityManager
              );
            if (!updatedRestaurantWallet) {
              logger.error('Failed to get updated restaurant wallet');
              return createResponse(
                'ServerError',
                null,
                'Failed to get updated restaurant wallet'
              );
            }

            // Transaction 3: Nhà hàng trả admin (adminCommission)
            const restaurantToAdminTxDto = {
              user_id: restaurant.owner_id,
              fwallet_id: updatedRestaurantWallet.id,
              transaction_type: 'WITHDRAW',
              amount: adminCommission,
              balance_after: Number(
                (updatedRestaurantWallet.balance - adminCommission).toFixed(2)
              ),
              status: 'PENDING',
              source: 'FWALLET',
              destination: adminWallet!.id,
              destination_type: 'FWALLET',
              version: updatedRestaurantWallet.version,
              order_id: orderData.id
            } as CreateTransactionDto;

            logger.log(
              `Creating restaurant to admin transaction: ${JSON.stringify(restaurantToAdminTxDto)}`
            );
            const restaurantToAdminTxResponse =
              await this.transactionService.create(
                restaurantToAdminTxDto,
                transactionalEntityManager
              );
            if (restaurantToAdminTxResponse.EC !== 0) {
              logger.error(
                `Restaurant to admin transaction failed: ${JSON.stringify(restaurantToAdminTxResponse)}`
              );
              return restaurantToAdminTxResponse;
            }
          }

          // Cập nhật total_orders của nhà hàng
          logger.log('Updating restaurant total_orders...');
          await transactionalEntityManager
            .createQueryBuilder()
            .update(Restaurant)
            .set({
              total_orders: () => `total_orders + 1`,
              updated_at: Math.floor(Date.now() / 1000)
            })
            .where('id = :id', { id: createOrderDto.restaurant_id })
            .execute();
          logger.log('Restaurant total_orders updated');

          // Xóa cart items
          logger.log(
            `Checking cart items for customer_id: ${createOrderDto.customer_id}`
          );
          const existingCartItems = await transactionalEntityManager
            .getRepository(CartItem)
            .createQueryBuilder('cartItem')
            .where('cartItem.customer_id = :customerId', {
              customerId: createOrderDto.customer_id
            })
            .andWhere('cartItem.deleted_at IS NULL')
            .getMany();
          logger.log(
            `Found ${existingCartItems.length} cart items for customer ${createOrderDto.customer_id}`
          );

          if (existingCartItems.length > 0) {
            logger.log(
              `Deleting cart items for customer_id: ${createOrderDto.customer_id}`
            );
            const deleteResult = await transactionalEntityManager
              .createQueryBuilder()
              .update(CartItem)
              .set({ deleted_at: Math.floor(Date.now() / 1000) })
              .where('customer_id = :customerId', {
                customerId: createOrderDto.customer_id
              })
              .andWhere('deleted_at IS NULL')
              .execute();

            logger.log(
              `Deleted ${deleteResult.affected} cart items for customer ${createOrderDto.customer_id}`
            );
            if (deleteResult.affected === 0) {
              logger.warn(
                `No cart items were deleted for customer ${createOrderDto.customer_id}`
              );
            } else {
              const cacheKey = `cart_items:${createOrderDto.customer_id}`;
              await this.redisService.del(cacheKey);
              logger.log(`Cleared Redis cache: ${cacheKey}`);
            }
          }

          logger.log('Transaction completed successfully');
          return createResponse(
            'OK',
            savedOrder,
            'Order created in transaction'
          );
        }
      );
      logger.log(`Transaction took ${Date.now() - txStart}ms`);

      if (result.EC !== 0) {
        logger.error(`Transaction result: ${JSON.stringify(result)}`);
        return result;
      }
      const savedOrder = result.data as Order;

      // Cập nhật purchase count không đồng bộ
      logger.log('Updating menu item purchase count...');
      this.updateMenuItemPurchaseCount(createOrderDto.order_items).catch(err =>
        logger.error('Error updating menu item purchase count:', err)
      );

      // 6. Gửi sự kiện
      const emitStart = Date.now();
      const eventId = `${savedOrder.id}-${Date.now()}`;

      // Populate menu_item_variant for order_items in the tracking update
      const populatedOrderItems = savedOrder.order_items.map(item => {
        const variant = item.variant_id
          ? variantMap.get(item.variant_id)
          : null;
        if (item.variant_id && !variant) {
          logger.warn(
            `Variant ID ${item.variant_id} not found for order ${savedOrder.id}`
          );
        }

        // Get the menu item to access its avatar
        const menuItem = menuItemMap.get(item.item_id);

        // Create a new object with all properties from the original item plus the additional ones
        const result = {
          ...item,
          menu_item_variant: variant,
          avatar: menuItem ? (menuItem as any).avatar : null // Add the avatar from the menu item
        };

        return result;
      });

      const trackingUpdate = {
        orderId: savedOrder.id,
        status: savedOrder.status,
        tracking_info: savedOrder.tracking_info,
        updated_at: savedOrder.updated_at,
        customer_id: savedOrder.customer_id,
        driver_id: savedOrder.driver_id,
        restaurant_id: savedOrder.restaurant_id,
        restaurantAddress,
        customer_note: savedOrder.customer_note,
        customerAddress,
        order_items: populatedOrderItems,
        total_amount: savedOrder.total_amount,
        total_restaurant_earn: restaurantSubTotal,
        sub_total: savedOrder.sub_total,
        discount_amount: savedOrder.discount_amount,
        delivery_fee: savedOrder.delivery_fee,
        service_fee: savedOrder.service_fee,
        promotions_applied: savedOrder.promotions_applied,
        restaurant_avatar: restaurant.avatar || null,
        eventId
      };

      const redisResult = await redis.set(`event:${eventId}`, '1', {
        NX: true,
        EX: 60
      });
      logger.log(`Emitting event ${eventId} with redisResult: ${redisResult}`);
      if (redisResult === 'OK') {
        this.notifyOrderStatus(trackingUpdate as any);
        this.eventEmitter.emit('listenUpdateOrderTracking', trackingUpdate);

        // Emit admin notification for new order creation
        if (!isGenerated) {
          this.eventEmitter.emit('newly_created_entity_notification', {
            entity_name: 'Order'
          });
          logger.log('Emitted newly_created_entity_notification for new Order');
        }

        logger.log('check tracking update', trackingUpdate);
      } else {
        logger.log(`Event ${eventId} already emitted, skipped`);
      }

      logger.log(`Emit events took ${Date.now() - emitStart}ms`);
      logger.log(`Total execution took ${Date.now() - start}ms`);

      // Update orders:all cache with new order
      const allOrdersCacheKey = 'orders:all';
      const cachedOrders = await redis.get(allOrdersCacheKey);
      if (cachedOrders) {
        const orders = JSON.parse(cachedOrders);
        orders.push(result.data);
        await redis.setEx(allOrdersCacheKey, 300, JSON.stringify(orders));
        logger.log('Updated orders:all cache with new order');
      }

      return result;
    } catch (error: any) {
      logger.error('Error creating order:', error);
      return createResponse('ServerError', null, 'Error creating order');
    }
  }

  async assignDriver(orderId: string, driverId: string) {
    const lockKey = `lock:order:assign:${orderId}`;
    const lockAcquired = await this.redisService.setNx(
      lockKey,
      driverId,
      300000
    );
    if (!lockAcquired) {
      console.log(
        `[OrdersService] Skipping duplicated assignDriver for order ${orderId}`
      );
      return;
    }

    try {
      const order = await this.ordersRepository.findOne({
        where: { id: orderId },
        relations: ['restaurantAddress', 'customerAddress']
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      order.driver_id = driverId;
      order.status = OrderStatus.DISPATCHED;
      await this.ordersRepository.save(order);

      this.eventEmitter.emit('order.assignedToDriver', { orderId, driverId });
      await this.notifyOrderStatus(order);
    } finally {
      await this.redisService.del(lockKey);
    }
  }

  async notifyOrderStatus(order: Order) {
    const lockKey = `lock:notify:order:${order.id}`;
    const lockAcquired = await this.redisService.setNx(
      lockKey,
      'notified',
      60000
    );
    if (!lockAcquired) {
      console.log(
        `[OrdersService] Skipping notify due to existing lock: ${order.id}`
      );
      return;
    }

    try {
      console.log(`Emitted notifyOrderStatus for order ${order.id}`);
      this.eventEmitter.emit('notifyOrderStatus', {
        orderId: order.id,
        status: order.status,
        customerId: order.customer_id,
        restaurantId: order.restaurant_id,
        driverId: order.driver_id
      });

      if (order.customer_id) {
        console.log(
          `Emitted notifyOrderStatus to customer_${order.customer_id}`
        );
        this.eventEmitter.emit('notifyOrderStatus', {
          room: `customer_${order.customer_id}`,
          orderId: order.id,
          status: order.status
        });
      }
    } finally {
      await this.redisService.del(lockKey);
    }
  }

  private async updateMenuItemPurchaseCount(
    orderItems: any[],
    transactionalEntityManager?: EntityManager
  ): Promise<void> {
    const manager = transactionalEntityManager || this.dataSource.manager;
    const updates = orderItems.map(item => ({
      id: item.item_id,
      purchase_count: () => `COALESCE(purchase_count, 0) + 1`,
      updated_at: Math.floor(Date.now() / 1000)
    }));

    if (updates.length > 0) {
      await manager
        .createQueryBuilder()
        .update(MenuItem)
        .set({
          purchase_count: () => `COALESCE(purchase_count, 0) + 1`,
          updated_at: Math.floor(Date.now() / 1000)
        })
        .where('id IN (:...ids)', { ids: updates.map(u => u.id) })
        .execute();
    }
  }

  async notifyRestaurantAndDriver(order: Order): Promise<ApiResponse<any>> {
    const restaurant = await this.restaurantsRepository.findById(
      order.restaurant_id
    );
    if (!restaurant) {
      return createResponse(
        'NotFound',
        null,
        `Restaurant ${order.restaurant_id} not found`
      );
    }
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    transactionalEntityManager?: EntityManager
  ): Promise<ApiResponse<Order>> {
    try {
      const manager = transactionalEntityManager || this.dataSource.manager;
      const order = await manager.findOne(Order, {
        where: { id },
        relations: ['promotions_applied']
      });
      if (!order) {
        return createResponse('NotFound', null, 'Order not found');
      }

      let promotionsApplied: Promotion[] = order.promotions_applied || [];
      if (updateOrderDto.promotion_applied) {
        const promotion = await manager.getRepository(Promotion).findOne({
          where: { id: updateOrderDto.promotion_applied }
        });
        promotionsApplied = promotion ? [promotion] : [];
      }

      const updatedData: DeepPartial<Order> = {
        ...order,
        ...updateOrderDto,
        promotions_applied: promotionsApplied,
        status: updateOrderDto.status
          ? (updateOrderDto.status as OrderStatus)
          : order.status,
        tracking_info: updateOrderDto.tracking_info
          ? (updateOrderDto.tracking_info as OrderTrackingInfo)
          : order.tracking_info
      };

      const updatedOrder = await manager.save(Order, updatedData);
      return createResponse('OK', updatedOrder, 'Order updated successfully');
    } catch (error: any) {
      return this.handleError('Error updating order:', error);
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    transactionalEntityManager?: EntityManager
  ): Promise<ApiResponse<Order>> {
    try {
      const manager = transactionalEntityManager || this.dataSource.manager;
      logger.log('🔍 Finding order:', orderId);
      const order = await manager.findOne(Order, { where: { id: orderId } });
      logger.log('📋 Found order:', order);
      if (!order) {
        logger.log('❌ Order not found:', orderId);
        return createResponse('NotFound', null, 'Order not found');
      }

      order.status = status;
      logger.log('➡️ Updating order status to:', status);
      const updatedOrder = await manager.save(Order, order);
      logger.log('✅ Updated order:', updatedOrder);

      const trackingInfoMap = {
        [OrderStatus.PENDING]: OrderTrackingInfo.ORDER_PLACED,
        [OrderStatus.RESTAURANT_ACCEPTED]: OrderTrackingInfo.ORDER_RECEIVED,
        [OrderStatus.PREPARING]: OrderTrackingInfo.PREPARING,
        [OrderStatus.IN_PROGRESS]: OrderTrackingInfo.IN_PROGRESS,
        [OrderStatus.READY_FOR_PICKUP]: OrderTrackingInfo.PREPARING,
        [OrderStatus.RESTAURANT_PICKUP]: OrderTrackingInfo.RESTAURANT_PICKUP,
        [OrderStatus.DISPATCHED]: OrderTrackingInfo.DISPATCHED,
        [OrderStatus.EN_ROUTE]: OrderTrackingInfo.EN_ROUTE,
        [OrderStatus.OUT_FOR_DELIVERY]: OrderTrackingInfo.OUT_FOR_DELIVERY,
        [OrderStatus.DELIVERY_FAILED]: OrderTrackingInfo.DELIVERY_FAILED,
        [OrderStatus.DELIVERED]: OrderTrackingInfo.DELIVERED
      };
      const trackingInfo = trackingInfoMap[status];
      if (trackingInfo) {
        order.tracking_info = trackingInfo;
        await manager.save(Order, order);
        logger.log('✅ Updated tracking_info:', trackingInfo);
      } else {
        logger.warn(`No tracking info mapped for status: ${status}`);
      }

      return createResponse(
        'OK',
        updatedOrder,
        'Order status updated successfully'
      );
    } catch (error: any) {
      logger.error('Error updating order status:', error);
      return createResponse('ServerError', null, 'Error updating order status');
    }
  }

  async tipToDriver(
    orderId: string,
    tipAmount: number
  ): Promise<ApiResponse<Order>> {
    logger.log('check tipamount', tipAmount, typeof tipAmount);
    try {
      if (tipAmount < 0) {
        return createResponse(
          'InvalidFormatInput',
          null,
          'Tip amount cannot be negative'
        );
      }

      const order = await this.ordersRepository.findOneOrFail({
        where: { id: orderId }
      });
      if (!order) {
        logger.log('❌ Order not found:', orderId);
        return createResponse('NotFound', null, 'Order not found');
      }

      if (!order.driver_id) {
        return createResponse(
          'NotFound',
          null,
          'No driver assigned to this order'
        );
      }

      if (
        order.status !== OrderStatus.DELIVERED &&
        order.status !== OrderStatus.EN_ROUTE &&
        order.status !== OrderStatus.RESTAURANT_PICKUP &&
        order.status !== OrderStatus.READY_FOR_PICKUP &&
        order.status !== OrderStatus.DISPATCHED
      ) {
        return createResponse(
          'Forbidden',
          null,
          'Can only tip when order is out for delivery or delivered'
        );
      }

      const updatedOrder = await this.dataSource.transaction(
        async transactionalEntityManager => {
          const updatedOrder = await transactionalEntityManager
            .getRepository(Order)
            .findOne({ where: { id: orderId } });

          if (!updatedOrder) throw new Error('Order not found in transaction');

          updatedOrder.driver_tips =
            (updatedOrder.driver_tips || 0) + tipAmount;
          await transactionalEntityManager.save(Order, updatedOrder);
          logger.log(
            '✅ Updated driver_tips:',
            tipAmount,
            'for order:',
            updatedOrder
          );

          const existingDPS = await transactionalEntityManager
            .getRepository(DriverProgressStage)
            .createQueryBuilder('dps')
            .where('dps.driver_id = :driverId', { driverId: order.driver_id })
            .andWhere('dps.current_state NOT LIKE :completedState', {
              completedState: 'delivery_complete_%'
            })
            .andWhere(
              'dps.id IN (SELECT driver_progress_id FROM driver_progress_orders WHERE order_id = :orderId)',
              { orderId }
            )
            .getOne();

          if (existingDPS) {
            existingDPS.total_tips =
              Number(existingDPS.total_tips || 0) + Number(tipAmount);
            await transactionalEntityManager.save(
              DriverProgressStage,
              existingDPS
            );
            logger.log(
              `[DEBUG] Updated DPS total_tips to ${existingDPS.total_tips} for driver ${order.driver_id}`
            );
          } else {
            logger.warn(
              `[DEBUG] No active DPS found for driver ${order.driver_id} with order ${orderId}`
            );
          }

          return updatedOrder;
        }
      );

      await this.driverStatsService.updateStatsForDriver(
        order.driver_id,
        'daily'
      );
      await this.driversGateway.notifyPartiesOnce(updatedOrder);

      // Emit tip event for driver notification
      this.eventEmitter.emit('driver.receivedTip', {
        driverId: updatedOrder.driver_id,
        orderId: updatedOrder.id,
        tipAmount: tipAmount,
        tipTime: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
        totalTips: updatedOrder.driver_tips,
        orderDetails: {
          id: updatedOrder.id,
          customer_id: updatedOrder.customer_id,
          restaurant_id: updatedOrder.restaurant_id,
          status: updatedOrder.status,
          tracking_info: updatedOrder.tracking_info,
          total_amount: updatedOrder.total_amount,
          delivery_fee: updatedOrder.delivery_fee
        }
      });

      logger.log(
        `Emitted tip event for driver ${updatedOrder.driver_id} - tip: ${tipAmount} for order ${orderId}`
      );

      return createResponse('OK', updatedOrder, 'Driver tipped successfully');
    } catch (error: any) {
      logger.error('Error tipping driver:', error);
      return createResponse('ServerError', null, 'Error tipping driver');
    }
  }

  async findAll(): Promise<ApiResponse<Order[]>> {
    const start = Date.now();
    const cacheKey = 'orders:all';

    try {
      const cachedOrders = await redis.get(cacheKey);
      if (cachedOrders) {
        logger.log('Cache hit for all orders');
        return createResponse(
          'OK',
          JSON.parse(cachedOrders),
          'Fetched all orders (from cache)'
        );
      }

      logger.log('Cache miss for all orders');

      const orders = await this.ordersRepository.find({
        relations: [
          'restaurant',
          'driver',
          'customer',
          'restaurantAddress',
          'customerAddress'
        ]
      });

      const menuItemIds = new Set<string>();
      orders.forEach(order => {
        if (order.order_items) {
          order.order_items.forEach(item => {
            if (item.item_id) {
              menuItemIds.add(item.item_id);
            }
          });
        }
      });

      const menuItems = await this.menuItemsRepository.findByIds([
        ...menuItemIds
      ]);
      const menuItemMap = new Map(menuItems.map(item => [item.id, item]));

      orders.forEach(order => {
        if (order.order_items) {
          order.order_items = order.order_items.map(item => ({
            ...item,
            item: menuItemMap.get(item.item_id)
          }));
        }
      });

      await redis.setEx(cacheKey, 300, JSON.stringify(orders));

      logger.log(`Fetched all orders in ${Date.now() - start}ms`);
      return createResponse('OK', orders, 'Fetched all orders');
    } catch (error: any) {
      logger.error('Error fetching orders:', error);
      return this.handleError('Error fetching orders:', error);
    }
  }

  async findOne(id: string): Promise<ApiResponse<Order>> {
    const start = Date.now();
    const cacheKey = `order:${id}`;

    try {
      const cachedOrder = await redis.get(cacheKey);
      if (cachedOrder) {
        logger.log(`Cache hit for order ${id}`);
        return createResponse(
          'OK',
          JSON.parse(cachedOrder),
          'Fetched order (from cache)'
        );
      }

      logger.log(`Cache miss for order ${id}`);

      const order = await this.ordersRepository.findOne({
        where: { id },
        relations: [
          'restaurant',
          'driver',
          'customer',
          'restaurantAddress',
          'customerAddress'
        ]
      });

      if (!order) {
        return createResponse('NotFound', null, 'Order not found');
      }

      const menuItemIds = order.order_items?.map(item => item.item_id) || [];
      const menuItems = await this.menuItemsRepository.findByIds(menuItemIds);
      const menuItemMap = new Map(menuItems.map(item => [item.id, item]));

      if (order.order_items) {
        order.order_items = order.order_items.map(item => ({
          ...item,
          item: menuItemMap.get(item.item_id)
        }));
      }

      await redis.setEx(cacheKey, 300, JSON.stringify(order));

      logger.log(`Fetched order ${id} in ${Date.now() - start}ms`);
      return createResponse('OK', order, 'Fetched order');
    } catch (error: any) {
      logger.error(`Error fetching order ${id}:`, error);
      return this.handleError('Error fetching order:', error);
    }
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    try {
      const deletedOrder = await this.ordersRepository.delete(id);
      if (!deletedOrder) {
        return createResponse('NotFound', null, 'Order not found');
      }
      return createResponse('OK', null, 'Order deleted successfully');
    } catch (error: any) {
      return this.handleError('Error deleting order:', error);
    }
  }

  async cancelOrder(
    orderId: string,
    cancelledBy: 'customer' | 'restaurant' | 'driver',
    cancelledById: string,
    reason: OrderCancellationReason,
    title: string,
    description: string
  ): Promise<ApiResponse<Order>> {
    try {
      const order = await this.ordersRepository.findOneOrFail({
        where: { id: orderId }
      });
      if (!order) {
        return createResponse('NotFound', null, 'Order not found');
      }

      let entityExists = false;
      switch (cancelledBy) {
        case 'customer':
          const customer =
            await this.customersRepository.findById(cancelledById);
          entityExists = !!customer;
          break;
        case 'restaurant':
          const restaurant =
            await this.restaurantsRepository.findById(cancelledById);
          entityExists = !!restaurant;
          break;
        case 'driver':
          const driver = await this.driverService.findDriverById(cancelledById);
          entityExists = !!driver;
          break;
      }

      if (!entityExists) {
        return createResponse(
          'NotFound',
          null,
          `${cancelledBy} with ID ${cancelledById} not found`
        );
      }

      if (!this.canOrderBeCancelled(order.status)) {
        return createResponse(
          'Forbidden',
          null,
          'Order cannot be cancelled in its current status'
        );
      }

      const [customerAddress, restaurantAddress] = await Promise.all([
        this.addressBookRepository.findById(order.customer_location),
        this.addressBookRepository.findById(order.restaurant_location)
      ]);

      if (!restaurantAddress) {
        return createResponse(
          'NotFound',
          null,
          `Restaurant address ${order.restaurant_location} not found`
        );
      }

      const restaurant = await this.restaurantsRepository.findById(
        order.restaurant_id
      );
      if (!restaurant) {
        return createResponse(
          'NotFound',
          null,
          `Restaurant ${order.restaurant_id} not found`
        );
      }

      const updatedOrder = await this.dataSource.transaction(
        async transactionalEntityManager => {
          const orderToUpdate = await transactionalEntityManager
            .getRepository(Order)
            .findOne({ where: { id: orderId } });
          if (!orderToUpdate) throw new Error('Order not found in transaction');

          orderToUpdate.status = OrderStatus.CANCELLED;
          orderToUpdate.tracking_info = OrderTrackingInfo.CANCELLED;
          orderToUpdate.cancelled_by = cancelledBy;
          orderToUpdate.cancelled_by_id = cancelledById;
          orderToUpdate.cancellation_reason = reason;
          orderToUpdate.cancellation_title = title;
          orderToUpdate.cancellation_description = description;
          orderToUpdate.cancelled_at = Math.floor(Date.now() / 1000);
          orderToUpdate.updated_at = Math.floor(Date.now() / 1000);

          await transactionalEntityManager.save(Order, orderToUpdate);
          return orderToUpdate;
        }
      );

      await this.notifyRestaurantAndDriver(updatedOrder);

      const eventId = `${updatedOrder.id}-${Date.now()}`;
      const trackingUpdate = {
        orderId: updatedOrder.id,
        status: updatedOrder.status,
        tracking_info: updatedOrder.tracking_info,
        updated_at: updatedOrder.updated_at,
        customer_id: updatedOrder.customer_id,
        driver_id: updatedOrder.driver_id,
        restaurant_id: updatedOrder.restaurant_id,
        restaurantAddress,
        customerAddress,
        order_items: updatedOrder.order_items,
        total_amount: updatedOrder.total_amount,
        delivery_fee: updatedOrder.delivery_fee,
        service_fee: updatedOrder.service_fee,
        promotions_applied: updatedOrder.promotions_applied,
        restaurant_avatar: restaurant.avatar || null,
        eventId
      };

      const redisResult = await redis.set(`event:${eventId}`, '1', {
        NX: true,
        EX: 60
      });

      if (redisResult === 'OK') {
        this.notifyOrderStatus(updatedOrder as any);
        this.eventEmitter.emit('listenUpdateOrderTracking', trackingUpdate);
        logger.log('check tracking update', trackingUpdate);
      } else {
        logger.log(`Event ${eventId} already emitted, skipped`);
      }
      this.redisService.del(
        `orders:restaurant:${updatedOrder.restaurant_id}:page:1:limit:50`
      );
      return createResponse('OK', updatedOrder, 'Order cancelled successfully');
    } catch (error: any) {
      logger.error('Error cancelling order:', error);
      return createResponse('ServerError', null, 'Error cancelling order');
    }
  }

  private canOrderBeCancelled(status: OrderStatus): boolean {
    const nonCancellableStatuses = [
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
      OrderStatus.RETURNED,
      OrderStatus.DELIVERY_FAILED
    ];
    return !nonCancellableStatuses.includes(status);
  }

  async restaurantAcceptOrder(
    orderId: string,
    restaurantId: string
  ): Promise<ApiResponse<Order>> {
    try {
      console.log('check orrder id', orderId);

      const order = await this.ordersRepository.findOneOrFail({
        where: { id: orderId }
      });
      console.log('check oỏderordeẻ', order);

      if (!order) {
        return createResponse('NotFound', null, 'Order not found');
      }

      const restaurant =
        await this.restaurantsRepository.findById(restaurantId);
      if (!restaurant) {
        return createResponse(
          'NotFound',
          null,
          `Restaurant with ID ${restaurantId} not found`
        );
      }

      if (order.restaurant_id !== restaurantId) {
        return createResponse(
          'Forbidden',
          null,
          'Restaurant is not authorized to accept this order'
        );
      }

      if (!this.canOrderBeAccepted(order.status)) {
        return createResponse(
          'Forbidden',
          null,
          'Order cannot be accepted in its current status'
        );
      }

      const [customerAddress, restaurantAddress] = await Promise.all([
        this.addressBookRepository.findById(order.customer_location),
        this.addressBookRepository.findById(order.restaurant_location)
      ]);

      if (!restaurantAddress) {
        return createResponse(
          'NotFound',
          null,
          `Restaurant address ${order.restaurant_location} not found`
        );
      }

      const updatedOrder = await this.dataSource.transaction(
        async transactionalEntityManager => {
          const orderToUpdate = await transactionalEntityManager
            .getRepository(Order)
            .findOne({ where: { id: orderId } });
          if (!orderToUpdate) throw new Error('Order not found in transaction');

          orderToUpdate.status = OrderStatus.PREPARING;
          orderToUpdate.tracking_info = OrderTrackingInfo.PREPARING;
          orderToUpdate.updated_at = Math.floor(Date.now() / 1000);

          await transactionalEntityManager.save(Order, orderToUpdate);
          return orderToUpdate;
        }
      );

      await this.notifyRestaurantAndDriver(updatedOrder);

      const eventId = `${updatedOrder.id}-${Date.now()}`;
      const trackingUpdate = {
        orderId: updatedOrder.id,
        status: updatedOrder.status,
        tracking_info: updatedOrder.tracking_info,
        updated_at: updatedOrder.updated_at,
        customer_id: updatedOrder.customer_id,
        driver_id: updatedOrder.driver_id,
        restaurant_id: updatedOrder.restaurant_id,
        restaurantAddress,
        customerAddress,
        order_items: updatedOrder.order_items,
        total_amount: updatedOrder.total_amount,
        delivery_fee: updatedOrder.delivery_fee,
        service_fee: updatedOrder.service_fee,
        promotions_applied: updatedOrder.promotions_applied,
        restaurant_avatar: restaurant.avatar || null,
        eventId
      };

      const redisResult = await redis.set(`event:${eventId}`, '1', {
        NX: true,
        EX: 60
      });

      if (redisResult === 'OK') {
        this.notifyOrderStatus(updatedOrder as any);
        this.eventEmitter.emit('listenUpdateOrderTracking', trackingUpdate);
        logger.log('check tracking update', trackingUpdate);
      } else {
        logger.log(`Event ${eventId} already emitted, skipped`);
      }

      return createResponse('OK', updatedOrder, 'Order accepted successfully');
    } catch (error: any) {
      logger.error('Error accepting order:', error);
      return createResponse('ServerError', null, 'Error accepting order');
    }
  }

  private canOrderBeAccepted(status: OrderStatus): boolean {
    console.log('check order status', status);
    const acceptableStatuses = [OrderStatus.PENDING];
    return acceptableStatuses.includes(status);
  }

  private async validateOrderData(
    orderDto: CreateOrderDto | UpdateOrderDto,
    fetchedData: {
      customer: any;
      restaurant: any;
      customerAddress: any;
      restaurantAddress: any;
      menuItems: any[];
      variants: any[];
    }
  ): Promise<true | ApiResponse<null>> {
    const validationStart = Date.now();
    const { customer_id, order_items } = orderDto;

    if (!customer_id) {
      logger.log(
        `Validation failed: Customer ID missing (${Date.now() - validationStart}ms)`
      );
      return createResponse('MissingInput', null, 'Customer ID is required');
    }

    if (!fetchedData.customer) {
      logger.log(
        `Validation failed: Customer not found (${Date.now() - validationStart}ms)`
      );
      return createResponse('NotFound', null, 'Customer not found');
    }

    if (!fetchedData.restaurant) {
      logger.log(
        `Validation failed: Restaurant not found (${Date.now() - validationStart}ms)`
      );
      return createResponse('NotFound', null, 'Restaurant not found');
    }

    if (!fetchedData.customerAddress) {
      logger.log(
        `Validation failed: Customer address not found (${Date.now() - validationStart}ms)`
      );
      return createResponse('NotFound', null, 'Customer address not found');
    }

    if (!fetchedData.restaurantAddress) {
      logger.log(
        `Validation failed: Restaurant address not found (${Date.now() - validationStart}ms)`
      );
      return createResponse('NotFound', null, 'Restaurant address not found');
    }

    if (!order_items || order_items.length === 0) {
      logger.log(
        `Validation failed: No order items (${Date.now() - validationStart}ms)`
      );
      return createResponse('MissingInput', null, 'Order items are required');
    }

    const menuItemMap = new Map(
      fetchedData.menuItems.map(item => [item.id, item])
    );
    const variantMap = new Map(
      fetchedData.variants.map(variant => [variant.id, variant])
    );

    for (const item of order_items) {
      if (!menuItemMap.has(item.item_id)) {
        logger.log(
          `Validation failed: Menu item ${item.item_id} not found (${Date.now() - validationStart}ms)`
        );
        return createResponse(
          'NotFound',
          null,
          `Menu item ${item.item_id} not found`
        );
      }

      if (item.variant_id && !variantMap.has(item.variant_id)) {
        logger.log(
          `Validation failed: Variant ${item.variant_id} not found (${Date.now() - validationStart}ms)`
        );
        return createResponse(
          'NotFound',
          null,
          `Variant ${item.variant_id} not found for item ${item.item_id}`
        );
      }
    }

    logger.log(`Validation passed (${Date.now() - validationStart}ms)`);
    return true;
  }

  async updateOrderPaymentStatus(
    orderId: string,
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED',
    transactionalEntityManager?: EntityManager
  ): Promise<ApiResponse<Order>> {
    logger.log(`Updating order ${orderId} payment status to ${paymentStatus}`);
    try {
      const manager = transactionalEntityManager || this.dataSource.manager;
      logger.log(
        'Using entity manager:',
        !!transactionalEntityManager ? 'provided' : 'new'
      );

      const order = await manager.findOne(Order, { where: { id: orderId } });
      if (!order) {
        logger.warn(`Order ${orderId} not found`);
        return createResponse('NotFound', null, 'Order not found');
      }
      logger.log('Found order:', order);

      order.payment_status = paymentStatus;
      order.updated_at = Math.floor(Date.now() / 1000);
      logger.log('Updated order fields:', {
        payment_status: order.payment_status,
        updated_at: order.updated_at
      });

      if (paymentStatus === 'FAILED') {
        logger.log('Payment failed, cancelling order');
        order.status = OrderStatus.CANCELLED;
        order.cancellation_reason = OrderCancellationReason.OTHER;
        order.cancellation_title = 'Payment Failed';
        order.cancellation_description =
          'Order cancelled due to payment failure';
        order.cancelled_at = Math.floor(Date.now() / 1000);
        logger.log('Updated order cancellation details:', {
          status: order.status,
          reason: order.cancellation_reason,
          title: order.cancellation_title,
          cancelled_at: order.cancelled_at
        });
      }

      logger.log('Saving updated order');
      const updatedOrder = await manager.save(Order, order);
      logger.log('Order saved successfully:', updatedOrder);

      logger.log('Notifying order status update');
      await this.notifyOrderStatus(updatedOrder as any);
      logger.log('Order status notification sent');

      return createResponse(
        'OK',
        updatedOrder,
        'Order payment status updated successfully'
      );
    } catch (error) {
      logger.error('Error updating order payment status:', error);
      return createResponse(
        'ServerError',
        null,
        'Failed to update order payment status'
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
      items: Order[];
    }>
  > {
    try {
      const skip = (page - 1) * limit;
      const [orders, total] = await this.ordersRepository.findAndCount({
        skip,
        take: limit,
        relations: [
          'restaurant',
          'driver',
          'customer',
          'restaurantAddress',
          'customerAddress'
        ],
        order: {
          created_at: 'DESC'
        }
      });

      const totalPages = Math.ceil(total / limit);

      const menuItemIds = new Set<string>();
      orders.forEach(order => {
        if (order.order_items) {
          order.order_items.forEach(item => {
            if (item.item_id) {
              menuItemIds.add(item.item_id);
            }
          });
        }
      });

      if (menuItemIds.size > 0) {
        const menuItems = await this.menuItemsRepository.findByIds([
          ...menuItemIds
        ]);
        const menuItemMap = new Map(menuItems.map(item => [item.id, item]));

        orders.forEach(order => {
          if (order.order_items) {
            order.order_items = order.order_items.map(item => ({
              ...item,
              item: menuItemMap.get(item.item_id)
            }));
          }
        });
      }

      return createResponse(
        'OK',
        {
          totalPages,
          currentPage: page,
          totalItems: total,
          items: orders
        },
        'Fetched paginated orders successfully'
      );
    } catch (error: any) {
      logger.error('Error fetching paginated orders:', error);
      return createResponse(
        'ServerError',
        null,
        'Error fetching paginated orders'
      );
    }
  }

  private handleError(message: string, error: any): ApiResponse<null> {
    logger.error(message, error);
    return createResponse(
      'ServerError',
      null,
      'An error occurred while processing your request'
    );
  }
}
