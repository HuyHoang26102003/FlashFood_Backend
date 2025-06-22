"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const order_entity_1 = require("./entities/order.entity");
const createResponse_1 = require("../utils/createResponse");
const address_book_repository_1 = require("../address_book/address_book.repository");
const restaurants_repository_1 = require("../restaurants/restaurants.repository");
const customers_repository_1 = require("../customers/customers.repository");
const menu_items_repository_1 = require("../menu_items/menu_items.repository");
const menu_item_variants_repository_1 = require("../menu_item_variants/menu_item_variants.repository");
const typeorm_1 = require("typeorm");
const cart_items_repository_1 = require("../cart_items/cart_items.repository");
const cart_item_entity_1 = require("../cart_items/entities/cart_item.entity");
const customers_gateway_1 = require("../customers/customers.gateway");
const drivers_gateway_1 = require("../drivers/drivers.gateway");
const transactions_service_1 = require("../transactions/transactions.service");
const fwallets_repository_1 = require("../fwallets/fwallets.repository");
const promotion_entity_1 = require("../promotions/entities/promotion.entity");
const menu_item_entity_1 = require("../menu_items/entities/menu_item.entity");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const driver_stats_records_service_1 = require("../driver_stats_records/driver_stats_records.service");
const driver_progress_stage_entity_1 = require("../driver_progress_stages/entities/driver_progress_stage.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const drivers_service_1 = require("../drivers/drivers.service");
const redis_1 = require("redis");
const dotenv = __importStar(require("dotenv"));
const typeorm_2 = require("@nestjs/typeorm");
const redis_service_1 = require("../redis/redis.service");
const orders_repository_1 = require("./orders.repository");
const commonFunctions_1 = require("../utils/commonFunctions");
const constants_1 = require("../utils/constants");
const finance_rule_entity_1 = require("../finance_rules/entities/finance_rule.entity");
dotenv.config();
const logger = new common_1.Logger('OrdersService');
const redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redis.on('error', err => logger.error('Redis error:', err));
redis.on('end', () => logger.error('Redis connection closed'));
redis.on('reconnecting', () => logger.warn('Redis reconnecting...'));
redis.on('connect', () => logger.log('Redis connected'));
redis.connect().catch(err => logger.error('Redis connection error:', err));
let OrdersService = class OrdersService {
    constructor(ordersRepository, menuItemsRepository, menuItemVariantsRepository, addressBookRepository, customersRepository, driverStatsService, restaurantsRepository, dataSource, cartItemsRepository, orderRepository, customersGateway, driversGateway, transactionService, fWalletsRepository, eventEmitter, driverService, redisService) {
        this.ordersRepository = ordersRepository;
        this.menuItemsRepository = menuItemsRepository;
        this.menuItemVariantsRepository = menuItemVariantsRepository;
        this.addressBookRepository = addressBookRepository;
        this.customersRepository = customersRepository;
        this.driverStatsService = driverStatsService;
        this.restaurantsRepository = restaurantsRepository;
        this.dataSource = dataSource;
        this.cartItemsRepository = cartItemsRepository;
        this.orderRepository = orderRepository;
        this.customersGateway = customersGateway;
        this.driversGateway = driversGateway;
        this.transactionService = transactionService;
        this.fWalletsRepository = fWalletsRepository;
        this.eventEmitter = eventEmitter;
        this.driverService = driverService;
        this.redisService = redisService;
        logger.log('OrdersService constructor called');
        logger.log('Checking injected dependencies:');
        logger.log('- ordersRepository:', !!this.ordersRepository);
        logger.log('- menuItemsRepository:', !!this.menuItemsRepository);
        logger.log('- menuItemVariantsRepository:', !!this.menuItemVariantsRepository);
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
    async getLatestFinanceRule(transactionalEntityManager) {
        const cacheKey = 'latest_finance_rule';
        const cached = await redis.get(cacheKey);
        if (cached) {
            logger.log(`Fetch finance rule (cache)`);
            return JSON.parse(cached);
        }
        const manager = transactionalEntityManager || this.dataSource.manager;
        const rule = await manager
            .getRepository(finance_rule_entity_1.FinanceRule)
            .createQueryBuilder('finance_rule')
            .orderBy('COALESCE(finance_rule.updated_at, finance_rule.created_at)', 'DESC')
            .getOne();
        if (rule) {
            await redis.setEx(cacheKey, 7200, JSON.stringify(rule));
            logger.log(`Stored finance rule in Redis: ${cacheKey}`);
        }
        return rule;
    }
    async createOrder(createOrderDto) {
        const start = Date.now();
        logger.log('createOrder called with:', JSON.stringify(createOrderDto));
        try {
            logger.log('Step 1: Checking for duplicate order');
            const orderHash = `${createOrderDto.customer_id}:${createOrderDto.order_time}:${createOrderDto.order_items
                .map(item => item.item_id)
                .sort()
                .join(',')}`;
            const cacheKey = `order_lock:${orderHash}`;
            let lockAcquired;
            try {
                lockAcquired = await redis.set(cacheKey, '1', { NX: true, EX: 60 });
                logger.log('Step 1 result (lockAcquired):', lockAcquired);
            }
            catch (err) {
                logger.error('Error acquiring Redis lock:', err);
                throw err;
            }
            if (!lockAcquired) {
                logger.warn(`Duplicate order detected: ${orderHash}`);
                return (0, createResponse_1.createResponse)('DuplicatedRecord', null, 'Order already processed');
            }
            logger.log('Step 2: Batch fetch related data');
            const fetchStart = Date.now();
            let customer, restaurant, customerAddress, restaurantAddress, menuItems, variants, promotion;
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
                        const result = await this.customersRepository.findById(createOrderDto.customer_id);
                        if (result) {
                            await redis.setEx(cacheKey, 7200, JSON.stringify(result));
                            logger.log(`Stored customer in Redis: ${cacheKey}`);
                        }
                        else {
                            logger.warn(`Customer not found: ${createOrderDto.customer_id}`);
                        }
                        logger.log(`Fetch customer took ${Date.now() - start}ms`);
                        return result;
                    })(),
                    (async () => {
                        const start = Date.now();
                        const cacheKey = `restaurant:${createOrderDto.restaurant_id}`;
                        await redis.del(cacheKey);
                        const result = await this.restaurantsRepository.findById(createOrderDto.restaurant_id);
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
                            logger.log(`Fetch customer address (cache) took ${Date.now() - start}ms`);
                            return JSON.parse(cached);
                        }
                        const address = await this.addressBookRepository.findById(createOrderDto.customer_location);
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
                            logger.log(`Fetch restaurant address (cache) took ${Date.now() - start}ms`);
                            return JSON.parse(cached);
                        }
                        const address = await this.addressBookRepository.findById(createOrderDto.restaurant_location);
                        if (address)
                            await redis.setEx(cacheKey, 7200, JSON.stringify(address));
                        logger.log(`Fetch restaurant address took ${Date.now() - start}ms`);
                        return address;
                    })(),
                    (async () => {
                        const start = Date.now();
                        const itemIds = createOrderDto.order_items.map(item => item.item_id);
                        const cacheKey = `menu_items:${itemIds.sort().join(',')}`;
                        const cached = await redis.get(cacheKey);
                        if (cached) {
                            logger.log(`Fetch menu items (cache) took ${Date.now() - start}ms`);
                            return JSON.parse(cached);
                        }
                        const items = await this.menuItemsRepository.findByIds(itemIds);
                        if (items.length > 0) {
                            await redis.setEx(cacheKey, 7200, JSON.stringify(items));
                            logger.log(`Stored menu items in Redis: ${cacheKey}`);
                        }
                        else {
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
                        if (!variantIds.length)
                            return [];
                        const cacheKey = `variants:${variantIds.join(',')}`;
                        const cached = await redis.get(cacheKey);
                        if (cached) {
                            logger.log(`Fetch variants (cache) took ${Date.now() - start}ms`);
                            return JSON.parse(cached);
                        }
                        const variants = await this.menuItemVariantsRepository.findByIds(variantIds);
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
                                logger.log(`Fetch promotion (cache) took ${Date.now() - start}ms`);
                                return JSON.parse(cached);
                            }
                            const promo = await this.dataSource
                                .getRepository(promotion_entity_1.Promotion)
                                .findOne({ where: { id: createOrderDto.promotion_applied } });
                            if (promo)
                                await redis.setEx(cacheKey, 7200, JSON.stringify(promo));
                            logger.log(`Fetch promotion took ${Date.now() - start}ms`);
                            return promo;
                        })()
                        : Promise.resolve(null)
                ]);
            }
            catch (err) {
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
            let customerWallet = null;
            let restaurantWallet = null;
            let adminWallet = null;
            if (createOrderDto.payment_method === 'FWallet' &&
                customer &&
                restaurant) {
                const walletStart = Date.now();
                [customerWallet, restaurantWallet, adminWallet] = await Promise.all([
                    (async () => {
                        const cacheKey = `fwallet:${customer.user_id}`;
                        const cached = await redis.get(cacheKey);
                        if (cached) {
                            logger.log(`Fetch customer wallet (cache) took ${Date.now() - walletStart}ms`);
                            return JSON.parse(cached);
                        }
                        const wallet = await this.fWalletsRepository.findByUserId(customer.user_id);
                        if (wallet)
                            await redis.setEx(cacheKey, 7200, JSON.stringify(wallet));
                        logger.log(`Fetch customer wallet took ${Date.now() - walletStart}ms`);
                        return wallet;
                    })(),
                    (async () => {
                        const cacheKey = `fwallet:${restaurant.owner_id}`;
                        const cached = await redis.get(cacheKey);
                        if (cached) {
                            logger.log(`Fetch restaurant wallet (cache) took ${Date.now() - walletStart}ms`);
                            return JSON.parse(cached);
                        }
                        const wallet = await this.fWalletsRepository.findByUserId(restaurant.owner_id);
                        if (wallet)
                            await redis.setEx(cacheKey, 7200, JSON.stringify(wallet));
                        logger.log(`Fetch restaurant wallet took ${Date.now() - walletStart}ms`);
                        return wallet;
                    })(),
                    (async () => {
                        const cacheKey = `fwallet:admin`;
                        const cached = await redis.get(cacheKey);
                        if (cached) {
                            logger.log(`Fetch admin wallet (cache) took ${Date.now() - walletStart}ms`);
                            return JSON.parse(cached);
                        }
                        const wallet = await this.fWalletsRepository.findById(constants_1.FLASHFOOD_FINANCE.id);
                        if (wallet)
                            await redis.setEx(cacheKey, 7200, JSON.stringify(wallet));
                        logger.log(`Fetch admin wallet took ${Date.now() - walletStart}ms`);
                        return wallet;
                    })()
                ]);
            }
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
            if (!customer) {
                return (0, createResponse_1.createResponse)('NotFound', null, `Customer ${createOrderDto.customer_id} not found`);
            }
            if (!restaurant) {
                return (0, createResponse_1.createResponse)('NotFound', null, `Restaurant ${createOrderDto.restaurant_id} not found`);
            }
            if (restaurant.status.is_open === false) {
                return (0, createResponse_1.createResponse)('NotAcceptingOrders', null, 'Restaurant is not available at the moment');
            }
            if (!customerAddress) {
                return (0, createResponse_1.createResponse)('NotFound', null, `Customer address ${createOrderDto.customer_location} not found`);
            }
            if (!restaurantAddress) {
                return (0, createResponse_1.createResponse)('NotFound', null, `Restaurant address ${createOrderDto.restaurant_location} not found`);
            }
            if (createOrderDto.payment_method === 'FWallet' &&
                (!customerWallet || !restaurantWallet || !adminWallet)) {
                logger.log('Check wallets:', {
                    customerWallet,
                    restaurantWallet,
                    adminWallet
                });
                return (0, createResponse_1.createResponse)('NotFound', null, `Wallet not found`);
            }
            let customerSubTotal = 0;
            let restaurantSubTotal = 0;
            let appliedPromotion = null;
            let distance = 0;
            if (customerAddress?.location && restaurantAddress?.location) {
                distance = (0, commonFunctions_1.calculateDistance)(customerAddress.location.lat, customerAddress.location.lng, restaurantAddress.location.lat, restaurantAddress.location.lng);
            }
            const menuItemMap = new Map(menuItems.map(mi => [mi.id, mi]));
            const variantMap = new Map(variants.map(v => [v.id, v]));
            const updatedOrderItems = createOrderDto.order_items.map(item => {
                const menuItem = menuItemMap.get(item.item_id);
                if (!menuItem) {
                    throw new Error(`Menu item ${item.item_id} not found`);
                }
                let originalPrice = item.price_at_time_of_order;
                if (item.variant_id) {
                    const variant = variantMap.get(item.variant_id);
                    if (!variant) {
                        throw new Error(`Variant ${item.variant_id} not found`);
                    }
                    originalPrice = variant.price;
                    logger.log(`Using variant price for ${item.name}: ${originalPrice}`);
                }
                else {
                    logger.warn(`No variant for item ${item.item_id}, using DTO price: ${originalPrice}`);
                }
                restaurantSubTotal += originalPrice * item.quantity;
                let discountedPrice = originalPrice;
                if (promotion &&
                    createOrderDto.promotion_applied &&
                    menuItem.category?.some(cat => promotion.food_category_ids.includes(cat))) {
                    const now = Math.floor(Date.now() / 1000);
                    if (promotion.start_date <= now &&
                        promotion.end_date >= now &&
                        promotion.status === 'ACTIVE') {
                        appliedPromotion = promotion;
                        if (promotion.discount_type === 'PERCENTAGE') {
                            discountedPrice =
                                originalPrice * (1 - promotion.discount_value / 100);
                        }
                        else if (promotion.discount_type === 'FIXED') {
                            discountedPrice = Math.max(0, originalPrice - promotion.discount_value);
                        }
                        discountedPrice = Number(discountedPrice.toFixed(2));
                    }
                }
                customerSubTotal += discountedPrice * item.quantity;
                return {
                    ...item,
                    price_after_applied_promotion: discountedPrice,
                    price_at_time_of_order: originalPrice
                };
            });
            customerSubTotal +=
                createOrderDto.delivery_fee + createOrderDto.service_fee;
            customerSubTotal = Number(customerSubTotal.toFixed(2));
            restaurantSubTotal = Number(restaurantSubTotal.toFixed(2));
            logger.log(`Order total amount: calculated=${customerSubTotal}, provided=${createOrderDto.total_amount} (using provided amount)`);
            const txStart = Date.now();
            const result = await this.dataSource.transaction(async (transactionalEntityManager) => {
                const latestFinanceRule = await this.getLatestFinanceRule(transactionalEntityManager);
                let commissionRate = latestFinanceRule &&
                    typeof latestFinanceRule.restaurant_commission === 'number'
                    ? latestFinanceRule.restaurant_commission
                    : 0.1;
                if (commissionRate < 0 || commissionRate > 1) {
                    logger.warn(`Invalid commission rate ${commissionRate}, using default 0.1`);
                    commissionRate = 0.1;
                }
                const adminCommission = Number((restaurantSubTotal * commissionRate).toFixed(2));
                const restaurantRevenue = Number((restaurantSubTotal * (1 - commissionRate)).toFixed(2));
                logger.log(`Price calculation:`, {
                    customerSubTotal,
                    restaurantSubTotal,
                    adminCommission,
                    restaurantRevenue,
                    deliveryFee: createOrderDto.delivery_fee,
                    serviceFee: createOrderDto.service_fee
                });
                if (createOrderDto.payment_method === 'FWallet') {
                    const walletBalance = Number(parseFloat(customerWallet.balance.toString()).toFixed(2));
                    if (walletBalance < customerSubTotal) {
                        return (0, createResponse_1.createResponse)('InsufficientBalance', null, 'Insufficient balance');
                    }
                    createOrderDto.payment_status = 'PAID';
                }
                else {
                    createOrderDto.payment_status = 'PENDING';
                }
                const orderData = {
                    ...createOrderDto,
                    total_amount: customerSubTotal,
                    order_items: updatedOrderItems,
                    promotions_applied: appliedPromotion ? [appliedPromotion] : [],
                    status: (createOrderDto.status ||
                        order_entity_1.OrderStatus.PENDING),
                    tracking_info: (createOrderDto.tracking_info ||
                        order_entity_1.OrderTrackingInfo.ORDER_PLACED),
                    customerAddress: { id: customerAddress.id },
                    restaurantAddress: { id: restaurantAddress.id },
                    created_at: Math.floor(Date.now() / 1000),
                    updated_at: Math.floor(Date.now() / 1000),
                    distance: Number(distance.toFixed(4))
                };
                logger.log('Saving order...');
                const newOrder = this.ordersRepository.create(orderData);
                const savedOrder = await transactionalEntityManager.save(order_entity_1.Order, newOrder);
                logger.log(`Order saved with id: ${savedOrder.id}`);
                orderData.id = savedOrder.id;
                if (createOrderDto.payment_method === 'FWallet') {
                    if (!restaurant.owner_id) {
                        logger.error('Restaurant owner_id not found');
                        return (0, createResponse_1.createResponse)('ServerError', null, 'Restaurant owner not found');
                    }
                    logger.log('Debug user IDs:', {
                        customer: {
                            user_id: customer.user_id,
                            wallet_id: customerWallet?.id
                        },
                        admin: {
                            user_id: constants_1.FLASHFOOD_FINANCE.user_id,
                            wallet_id: adminWallet?.id
                        },
                        restaurant: {
                            user_id: restaurant.owner_id,
                            wallet_id: restaurantWallet?.id
                        }
                    });
                    const customerTxDto = {
                        user_id: customer.user_id,
                        fwallet_id: customerWallet.id,
                        transaction_type: 'PURCHASE',
                        amount: customerSubTotal,
                        balance_after: Number((customerWallet.balance - customerSubTotal).toFixed(2)),
                        status: 'PENDING',
                        source: 'FWALLET',
                        destination: adminWallet.id,
                        destination_type: 'FWALLET',
                        version: customerWallet.version,
                        order_id: orderData.id
                    };
                    logger.log(`Creating customer transaction: ${JSON.stringify(customerTxDto)}`);
                    const customerTxResponse = await this.transactionService.create(customerTxDto, transactionalEntityManager);
                    if (customerTxResponse.EC !== 0) {
                        logger.error(`Customer transaction failed: ${JSON.stringify(customerTxResponse)}`);
                        return customerTxResponse;
                    }
                    const updatedAdminWallet = await this.fWalletsRepository.findById(constants_1.FLASHFOOD_FINANCE.id, transactionalEntityManager);
                    if (!updatedAdminWallet) {
                        logger.error('Failed to get updated admin wallet');
                        return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to get updated admin wallet');
                    }
                    const adminToRestaurantTxDto = {
                        user_id: constants_1.FLASHFOOD_FINANCE.user_id,
                        fwallet_id: updatedAdminWallet.id,
                        transaction_type: 'DEPOSIT',
                        amount: restaurantSubTotal,
                        balance_after: Number((updatedAdminWallet.balance - restaurantSubTotal).toFixed(2)),
                        status: 'PENDING',
                        source: 'FWALLET',
                        destination: restaurantWallet.id,
                        destination_type: 'FWALLET',
                        version: updatedAdminWallet.version,
                        order_id: orderData.id
                    };
                    logger.log(`Creating admin to restaurant transaction: ${JSON.stringify(adminToRestaurantTxDto)}`);
                    const adminToRestaurantTxResponse = await this.transactionService.create(adminToRestaurantTxDto, transactionalEntityManager);
                    if (adminToRestaurantTxResponse.EC !== 0) {
                        logger.error(`Admin to restaurant transaction failed: ${JSON.stringify(adminToRestaurantTxResponse)}`);
                        return adminToRestaurantTxResponse;
                    }
                    const updatedRestaurantWallet = await this.fWalletsRepository.findByUserId(restaurant.owner_id, transactionalEntityManager);
                    if (!updatedRestaurantWallet) {
                        logger.error('Failed to get updated restaurant wallet');
                        return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to get updated restaurant wallet');
                    }
                    const restaurantToAdminTxDto = {
                        user_id: restaurant.owner_id,
                        fwallet_id: updatedRestaurantWallet.id,
                        transaction_type: 'WITHDRAW',
                        amount: adminCommission,
                        balance_after: Number((updatedRestaurantWallet.balance - adminCommission).toFixed(2)),
                        status: 'PENDING',
                        source: 'FWALLET',
                        destination: adminWallet.id,
                        destination_type: 'FWALLET',
                        version: updatedRestaurantWallet.version,
                        order_id: orderData.id
                    };
                    logger.log(`Creating restaurant to admin transaction: ${JSON.stringify(restaurantToAdminTxDto)}`);
                    const restaurantToAdminTxResponse = await this.transactionService.create(restaurantToAdminTxDto, transactionalEntityManager);
                    if (restaurantToAdminTxResponse.EC !== 0) {
                        logger.error(`Restaurant to admin transaction failed: ${JSON.stringify(restaurantToAdminTxResponse)}`);
                        return restaurantToAdminTxResponse;
                    }
                }
                logger.log('Updating restaurant total_orders...');
                await transactionalEntityManager
                    .createQueryBuilder()
                    .update(restaurant_entity_1.Restaurant)
                    .set({
                    total_orders: () => `total_orders + 1`,
                    updated_at: Math.floor(Date.now() / 1000)
                })
                    .where('id = :id', { id: createOrderDto.restaurant_id })
                    .execute();
                logger.log('Restaurant total_orders updated');
                logger.log(`Checking cart items for customer_id: ${createOrderDto.customer_id}`);
                const existingCartItems = await transactionalEntityManager
                    .getRepository(cart_item_entity_1.CartItem)
                    .createQueryBuilder('cartItem')
                    .where('cartItem.customer_id = :customerId', {
                    customerId: createOrderDto.customer_id
                })
                    .andWhere('cartItem.deleted_at IS NULL')
                    .getMany();
                logger.log(`Found ${existingCartItems.length} cart items for customer ${createOrderDto.customer_id}`);
                if (existingCartItems.length > 0) {
                    logger.log(`Deleting cart items for customer_id: ${createOrderDto.customer_id}`);
                    const deleteResult = await transactionalEntityManager
                        .createQueryBuilder()
                        .update(cart_item_entity_1.CartItem)
                        .set({ deleted_at: Math.floor(Date.now() / 1000) })
                        .where('customer_id = :customerId', {
                        customerId: createOrderDto.customer_id
                    })
                        .andWhere('deleted_at IS NULL')
                        .execute();
                    logger.log(`Deleted ${deleteResult.affected} cart items for customer ${createOrderDto.customer_id}`);
                    if (deleteResult.affected === 0) {
                        logger.warn(`No cart items were deleted for customer ${createOrderDto.customer_id}`);
                    }
                    else {
                        const cacheKey = `cart_items:${createOrderDto.customer_id}`;
                        await this.redisService.del(cacheKey);
                        logger.log(`Cleared Redis cache: ${cacheKey}`);
                    }
                }
                logger.log('Transaction completed successfully');
                return (0, createResponse_1.createResponse)('OK', savedOrder, 'Order created in transaction');
            });
            logger.log(`Transaction took ${Date.now() - txStart}ms`);
            if (result.EC !== 0) {
                logger.error(`Transaction result: ${JSON.stringify(result)}`);
                return result;
            }
            const savedOrder = result.data;
            logger.log('Updating menu item purchase count...');
            this.updateMenuItemPurchaseCount(createOrderDto.order_items).catch(err => logger.error('Error updating menu item purchase count:', err));
            const emitStart = Date.now();
            const eventId = `${savedOrder.id}-${Date.now()}`;
            const trackingUpdate = {
                orderId: savedOrder.id,
                status: savedOrder.status,
                tracking_info: savedOrder.tracking_info,
                updated_at: savedOrder.updated_at,
                customer_id: savedOrder.customer_id,
                driver_id: savedOrder.driver_id,
                restaurant_id: savedOrder.restaurant_id,
                restaurantAddress,
                customerAddress,
                order_items: savedOrder.order_items,
                total_amount: savedOrder.total_amount,
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
                this.notifyOrderStatus(trackingUpdate);
                this.eventEmitter.emit('listenUpdateOrderTracking', trackingUpdate);
                this.eventEmitter.emit('newOrderForRestaurant', {
                    restaurant_id: savedOrder.restaurant_id,
                    order: trackingUpdate
                });
                logger.log('check tracking update', trackingUpdate);
            }
            else {
                logger.log(`Event ${eventId} already emitted, skipped`);
            }
            logger.log(`Emit events took ${Date.now() - emitStart}ms`);
            logger.log(`Total execution took ${Date.now() - start}ms`);
            return result;
        }
        catch (error) {
            logger.error('Error creating order:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error creating order');
        }
    }
    async assignDriver(orderId, driverId) {
        const lockKey = `lock:order:assign:${orderId}`;
        const lockAcquired = await this.redisService.setNx(lockKey, driverId, 300000);
        if (!lockAcquired) {
            console.log(`[OrdersService] Skipping duplicated assignDriver for order ${orderId}`);
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
            order.status = order_entity_1.OrderStatus.DISPATCHED;
            await this.ordersRepository.save(order);
            this.eventEmitter.emit('order.assignedToDriver', { orderId, driverId });
            await this.notifyOrderStatus(order);
        }
        finally {
            await this.redisService.del(lockKey);
        }
    }
    async notifyOrderStatus(order) {
        const lockKey = `lock:notify:order:${order.id}`;
        const lockAcquired = await this.redisService.setNx(lockKey, 'notified', 60000);
        if (!lockAcquired) {
            console.log(`[OrdersService] Skipping notify due to existing lock: ${order.id}`);
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
                console.log(`Emitted notifyOrderStatus to customer_${order.customer_id}`);
                this.eventEmitter.emit('notifyOrderStatus', {
                    room: `customer_${order.customer_id}`,
                    orderId: order.id,
                    status: order.status
                });
            }
        }
        finally {
            await this.redisService.del(lockKey);
        }
    }
    async updateMenuItemPurchaseCount(orderItems, transactionalEntityManager) {
        const manager = transactionalEntityManager || this.dataSource.manager;
        const updates = orderItems.map(item => ({
            id: item.item_id,
            purchase_count: () => `COALESCE(purchase_count, 0) + 1`,
            updated_at: Math.floor(Date.now() / 1000)
        }));
        if (updates.length > 0) {
            await manager
                .createQueryBuilder()
                .update(menu_item_entity_1.MenuItem)
                .set({
                purchase_count: () => `COALESCE(purchase_count, 0) + 1`,
                updated_at: Math.floor(Date.now() / 1000)
            })
                .where('id IN (:...ids)', { ids: updates.map(u => u.id) })
                .execute();
        }
    }
    async notifyRestaurantAndDriver(order) {
        const restaurant = await this.restaurantsRepository.findById(order.restaurant_id);
        if (!restaurant) {
            return (0, createResponse_1.createResponse)('NotFound', null, `Restaurant ${order.restaurant_id} not found`);
        }
    }
    async update(id, updateOrderDto, transactionalEntityManager) {
        try {
            const manager = transactionalEntityManager || this.dataSource.manager;
            const order = await manager.findOne(order_entity_1.Order, {
                where: { id },
                relations: ['promotions_applied']
            });
            if (!order) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Order not found');
            }
            let promotionsApplied = order.promotions_applied || [];
            if (updateOrderDto.promotion_applied) {
                const promotion = await manager.getRepository(promotion_entity_1.Promotion).findOne({
                    where: { id: updateOrderDto.promotion_applied }
                });
                promotionsApplied = promotion ? [promotion] : [];
            }
            const updatedData = {
                ...order,
                ...updateOrderDto,
                promotions_applied: promotionsApplied,
                status: updateOrderDto.status
                    ? updateOrderDto.status
                    : order.status,
                tracking_info: updateOrderDto.tracking_info
                    ? updateOrderDto.tracking_info
                    : order.tracking_info
            };
            const updatedOrder = await manager.save(order_entity_1.Order, updatedData);
            return (0, createResponse_1.createResponse)('OK', updatedOrder, 'Order updated successfully');
        }
        catch (error) {
            return this.handleError('Error updating order:', error);
        }
    }
    async updateOrderStatus(orderId, status, transactionalEntityManager) {
        try {
            const manager = transactionalEntityManager || this.dataSource.manager;
            logger.log('🔍 Finding order:', orderId);
            const order = await manager.findOne(order_entity_1.Order, { where: { id: orderId } });
            logger.log('📋 Found order:', order);
            if (!order) {
                logger.log('❌ Order not found:', orderId);
                return (0, createResponse_1.createResponse)('NotFound', null, 'Order not found');
            }
            order.status = status;
            logger.log('➡️ Updating order status to:', status);
            const updatedOrder = await manager.save(order_entity_1.Order, order);
            logger.log('✅ Updated order:', updatedOrder);
            const trackingInfoMap = {
                [order_entity_1.OrderStatus.PENDING]: order_entity_1.OrderTrackingInfo.ORDER_PLACED,
                [order_entity_1.OrderStatus.RESTAURANT_ACCEPTED]: order_entity_1.OrderTrackingInfo.ORDER_RECEIVED,
                [order_entity_1.OrderStatus.PREPARING]: order_entity_1.OrderTrackingInfo.PREPARING,
                [order_entity_1.OrderStatus.IN_PROGRESS]: order_entity_1.OrderTrackingInfo.IN_PROGRESS,
                [order_entity_1.OrderStatus.READY_FOR_PICKUP]: order_entity_1.OrderTrackingInfo.PREPARING,
                [order_entity_1.OrderStatus.RESTAURANT_PICKUP]: order_entity_1.OrderTrackingInfo.RESTAURANT_PICKUP,
                [order_entity_1.OrderStatus.DISPATCHED]: order_entity_1.OrderTrackingInfo.DISPATCHED,
                [order_entity_1.OrderStatus.EN_ROUTE]: order_entity_1.OrderTrackingInfo.EN_ROUTE,
                [order_entity_1.OrderStatus.OUT_FOR_DELIVERY]: order_entity_1.OrderTrackingInfo.OUT_FOR_DELIVERY,
                [order_entity_1.OrderStatus.DELIVERY_FAILED]: order_entity_1.OrderTrackingInfo.DELIVERY_FAILED,
                [order_entity_1.OrderStatus.DELIVERED]: order_entity_1.OrderTrackingInfo.DELIVERED
            };
            const trackingInfo = trackingInfoMap[status];
            if (trackingInfo) {
                order.tracking_info = trackingInfo;
                await manager.save(order_entity_1.Order, order);
                logger.log('✅ Updated tracking_info:', trackingInfo);
            }
            else {
                logger.warn(`No tracking info mapped for status: ${status}`);
            }
            return (0, createResponse_1.createResponse)('OK', updatedOrder, 'Order status updated successfully');
        }
        catch (error) {
            logger.error('Error updating order status:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error updating order status');
        }
    }
    async tipToDriver(orderId, tipAmount) {
        logger.log('check tipamount', tipAmount, typeof tipAmount);
        try {
            if (tipAmount < 0) {
                return (0, createResponse_1.createResponse)('InvalidFormatInput', null, 'Tip amount cannot be negative');
            }
            const order = await this.ordersRepository.findOneOrFail({
                where: { id: orderId }
            });
            if (!order) {
                logger.log('❌ Order not found:', orderId);
                return (0, createResponse_1.createResponse)('NotFound', null, 'Order not found');
            }
            if (!order.driver_id) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'No driver assigned to this order');
            }
            if (order.status !== order_entity_1.OrderStatus.DELIVERED &&
                order.status !== order_entity_1.OrderStatus.EN_ROUTE &&
                order.status !== order_entity_1.OrderStatus.RESTAURANT_PICKUP &&
                order.status !== order_entity_1.OrderStatus.READY_FOR_PICKUP &&
                order.status !== order_entity_1.OrderStatus.DISPATCHED) {
                return (0, createResponse_1.createResponse)('Forbidden', null, 'Can only tip when order is out for delivery or delivered');
            }
            const updatedOrder = await this.dataSource.transaction(async (transactionalEntityManager) => {
                const updatedOrder = await transactionalEntityManager
                    .getRepository(order_entity_1.Order)
                    .findOne({ where: { id: orderId } });
                if (!updatedOrder)
                    throw new Error('Order not found in transaction');
                updatedOrder.driver_tips =
                    (updatedOrder.driver_tips || 0) + tipAmount;
                await transactionalEntityManager.save(order_entity_1.Order, updatedOrder);
                logger.log('✅ Updated driver_tips:', tipAmount, 'for order:', updatedOrder);
                const existingDPS = await transactionalEntityManager
                    .getRepository(driver_progress_stage_entity_1.DriverProgressStage)
                    .createQueryBuilder('dps')
                    .where('dps.driver_id = :driverId', { driverId: order.driver_id })
                    .andWhere('dps.current_state NOT LIKE :completedState', {
                    completedState: 'delivery_complete_%'
                })
                    .andWhere('dps.id IN (SELECT driver_progress_id FROM driver_progress_orders WHERE order_id = :orderId)', { orderId })
                    .getOne();
                if (existingDPS) {
                    existingDPS.total_tips =
                        Number(existingDPS.total_tips || 0) + Number(tipAmount);
                    await transactionalEntityManager.save(driver_progress_stage_entity_1.DriverProgressStage, existingDPS);
                    logger.log(`[DEBUG] Updated DPS total_tips to ${existingDPS.total_tips} for driver ${order.driver_id}`);
                }
                else {
                    logger.warn(`[DEBUG] No active DPS found for driver ${order.driver_id} with order ${orderId}`);
                }
                return updatedOrder;
            });
            await this.driverStatsService.updateStatsForDriver(order.driver_id, 'daily');
            await this.driversGateway.notifyPartiesOnce(updatedOrder);
            logger.log(`Notified driver ${updatedOrder.driver_id} about tip of ${tipAmount} for order ${orderId}`);
            return (0, createResponse_1.createResponse)('OK', updatedOrder, 'Driver tipped successfully');
        }
        catch (error) {
            logger.error('Error tipping driver:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error tipping driver');
        }
    }
    async findAll() {
        const start = Date.now();
        const cacheKey = 'orders:all';
        try {
            const cachedOrders = await redis.get(cacheKey);
            if (cachedOrders) {
                logger.log('Cache hit for all orders');
                return (0, createResponse_1.createResponse)('OK', JSON.parse(cachedOrders), 'Fetched all orders (from cache)');
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
            const menuItemIds = new Set();
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
            return (0, createResponse_1.createResponse)('OK', orders, 'Fetched all orders');
        }
        catch (error) {
            logger.error('Error fetching orders:', error);
            return this.handleError('Error fetching orders:', error);
        }
    }
    async findOne(id) {
        const start = Date.now();
        const cacheKey = `order:${id}`;
        try {
            const cachedOrder = await redis.get(cacheKey);
            if (cachedOrder) {
                logger.log(`Cache hit for order ${id}`);
                return (0, createResponse_1.createResponse)('OK', JSON.parse(cachedOrder), 'Fetched order (from cache)');
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
                return (0, createResponse_1.createResponse)('NotFound', null, 'Order not found');
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
            return (0, createResponse_1.createResponse)('OK', order, 'Fetched order');
        }
        catch (error) {
            logger.error(`Error fetching order ${id}:`, error);
            return this.handleError('Error fetching order:', error);
        }
    }
    async remove(id) {
        try {
            const deletedOrder = await this.ordersRepository.delete(id);
            if (!deletedOrder) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Order not found');
            }
            return (0, createResponse_1.createResponse)('OK', null, 'Order deleted successfully');
        }
        catch (error) {
            return this.handleError('Error deleting order:', error);
        }
    }
    async cancelOrder(orderId, cancelledBy, cancelledById, reason, title, description) {
        try {
            const order = await this.ordersRepository.findOneOrFail({
                where: { id: orderId }
            });
            if (!order) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Order not found');
            }
            let entityExists = false;
            switch (cancelledBy) {
                case 'customer':
                    const customer = await this.customersRepository.findById(cancelledById);
                    entityExists = !!customer;
                    break;
                case 'restaurant':
                    const restaurant = await this.restaurantsRepository.findById(cancelledById);
                    entityExists = !!restaurant;
                    break;
                case 'driver':
                    const driver = await this.driverService.findDriverById(cancelledById);
                    entityExists = !!driver;
                    break;
            }
            if (!entityExists) {
                return (0, createResponse_1.createResponse)('NotFound', null, `${cancelledBy} with ID ${cancelledById} not found`);
            }
            if (!this.canOrderBeCancelled(order.status)) {
                return (0, createResponse_1.createResponse)('Forbidden', null, 'Order cannot be cancelled in its current status');
            }
            const [customerAddress, restaurantAddress] = await Promise.all([
                this.addressBookRepository.findById(order.customer_location),
                this.addressBookRepository.findById(order.restaurant_location)
            ]);
            if (!restaurantAddress) {
                return (0, createResponse_1.createResponse)('NotFound', null, `Restaurant address ${order.restaurant_location} not found`);
            }
            const restaurant = await this.restaurantsRepository.findById(order.restaurant_id);
            if (!restaurant) {
                return (0, createResponse_1.createResponse)('NotFound', null, `Restaurant ${order.restaurant_id} not found`);
            }
            const updatedOrder = await this.dataSource.transaction(async (transactionalEntityManager) => {
                const orderToUpdate = await transactionalEntityManager
                    .getRepository(order_entity_1.Order)
                    .findOne({ where: { id: orderId } });
                if (!orderToUpdate)
                    throw new Error('Order not found in transaction');
                orderToUpdate.status = order_entity_1.OrderStatus.CANCELLED;
                orderToUpdate.tracking_info = order_entity_1.OrderTrackingInfo.CANCELLED;
                orderToUpdate.cancelled_by = cancelledBy;
                orderToUpdate.cancelled_by_id = cancelledById;
                orderToUpdate.cancellation_reason = reason;
                orderToUpdate.cancellation_title = title;
                orderToUpdate.cancellation_description = description;
                orderToUpdate.cancelled_at = Math.floor(Date.now() / 1000);
                orderToUpdate.updated_at = Math.floor(Date.now() / 1000);
                await transactionalEntityManager.save(order_entity_1.Order, orderToUpdate);
                return orderToUpdate;
            });
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
                this.notifyOrderStatus(trackingUpdate);
                this.eventEmitter.emit('listenUpdateOrderTracking', trackingUpdate);
                logger.log('check tracking update', trackingUpdate);
            }
            else {
                logger.log(`Event ${eventId} already emitted, skipped`);
            }
            this.redisService.del(`orders:restaurant:${updatedOrder.restaurant_id}:page:1:limit:50`);
            return (0, createResponse_1.createResponse)('OK', updatedOrder, 'Order cancelled successfully');
        }
        catch (error) {
            logger.error('Error cancelling order:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error cancelling order');
        }
    }
    canOrderBeCancelled(status) {
        const nonCancellableStatuses = [
            order_entity_1.OrderStatus.DELIVERED,
            order_entity_1.OrderStatus.CANCELLED,
            order_entity_1.OrderStatus.RETURNED,
            order_entity_1.OrderStatus.DELIVERY_FAILED
        ];
        return !nonCancellableStatuses.includes(status);
    }
    async restaurantAcceptOrder(orderId, restaurantId) {
        try {
            console.log('check orrder id', orderId);
            const order = await this.ordersRepository.findOneOrFail({
                where: { id: orderId }
            });
            console.log('check oỏderordeẻ', order);
            if (!order) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Order not found');
            }
            const restaurant = await this.restaurantsRepository.findById(restaurantId);
            if (!restaurant) {
                return (0, createResponse_1.createResponse)('NotFound', null, `Restaurant with ID ${restaurantId} not found`);
            }
            if (order.restaurant_id !== restaurantId) {
                return (0, createResponse_1.createResponse)('Forbidden', null, 'Restaurant is not authorized to accept this order');
            }
            if (!this.canOrderBeAccepted(order.status)) {
                return (0, createResponse_1.createResponse)('Forbidden', null, 'Order cannot be accepted in its current status');
            }
            const [customerAddress, restaurantAddress] = await Promise.all([
                this.addressBookRepository.findById(order.customer_location),
                this.addressBookRepository.findById(order.restaurant_location)
            ]);
            if (!restaurantAddress) {
                return (0, createResponse_1.createResponse)('NotFound', null, `Restaurant address ${order.restaurant_location} not found`);
            }
            const updatedOrder = await this.dataSource.transaction(async (transactionalEntityManager) => {
                const orderToUpdate = await transactionalEntityManager
                    .getRepository(order_entity_1.Order)
                    .findOne({ where: { id: orderId } });
                if (!orderToUpdate)
                    throw new Error('Order not found in transaction');
                orderToUpdate.status = order_entity_1.OrderStatus.PREPARING;
                orderToUpdate.tracking_info = order_entity_1.OrderTrackingInfo.PREPARING;
                orderToUpdate.updated_at = Math.floor(Date.now() / 1000);
                await transactionalEntityManager.save(order_entity_1.Order, orderToUpdate);
                return orderToUpdate;
            });
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
                this.notifyOrderStatus(trackingUpdate);
                this.eventEmitter.emit('listenUpdateOrderTracking', trackingUpdate);
                logger.log('check tracking update', trackingUpdate);
            }
            else {
                logger.log(`Event ${eventId} already emitted, skipped`);
            }
            return (0, createResponse_1.createResponse)('OK', updatedOrder, 'Order accepted successfully');
        }
        catch (error) {
            logger.error('Error accepting order:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error accepting order');
        }
    }
    canOrderBeAccepted(status) {
        console.log('check order status', status);
        const acceptableStatuses = [order_entity_1.OrderStatus.PENDING];
        return acceptableStatuses.includes(status);
    }
    async validateOrderData(orderDto, fetchedData) {
        const validationStart = Date.now();
        const { customer_id, order_items } = orderDto;
        if (!customer_id) {
            logger.log(`Validation failed: Customer ID missing (${Date.now() - validationStart}ms)`);
            return (0, createResponse_1.createResponse)('MissingInput', null, 'Customer ID is required');
        }
        if (!fetchedData.customer) {
            logger.log(`Validation failed: Customer not found (${Date.now() - validationStart}ms)`);
            return (0, createResponse_1.createResponse)('NotFound', null, 'Customer not found');
        }
        if (!fetchedData.restaurant) {
            logger.log(`Validation failed: Restaurant not found (${Date.now() - validationStart}ms)`);
            return (0, createResponse_1.createResponse)('NotFound', null, 'Restaurant not found');
        }
        if (!fetchedData.customerAddress) {
            logger.log(`Validation failed: Customer address not found (${Date.now() - validationStart}ms)`);
            return (0, createResponse_1.createResponse)('NotFound', null, 'Customer address not found');
        }
        if (!fetchedData.restaurantAddress) {
            logger.log(`Validation failed: Restaurant address not found (${Date.now() - validationStart}ms)`);
            return (0, createResponse_1.createResponse)('NotFound', null, 'Restaurant address not found');
        }
        if (!order_items || order_items.length === 0) {
            logger.log(`Validation failed: No order items (${Date.now() - validationStart}ms)`);
            return (0, createResponse_1.createResponse)('MissingInput', null, 'Order items are required');
        }
        const menuItemMap = new Map(fetchedData.menuItems.map(item => [item.id, item]));
        const variantMap = new Map(fetchedData.variants.map(variant => [variant.id, variant]));
        for (const item of order_items) {
            if (!menuItemMap.has(item.item_id)) {
                logger.log(`Validation failed: Menu item ${item.item_id} not found (${Date.now() - validationStart}ms)`);
                return (0, createResponse_1.createResponse)('NotFound', null, `Menu item ${item.item_id} not found`);
            }
            if (item.variant_id && !variantMap.has(item.variant_id)) {
                logger.log(`Validation failed: Variant ${item.variant_id} not found (${Date.now() - validationStart}ms)`);
                return (0, createResponse_1.createResponse)('NotFound', null, `Variant ${item.variant_id} not found for item ${item.item_id}`);
            }
        }
        logger.log(`Validation passed (${Date.now() - validationStart}ms)`);
        return true;
    }
    async updateOrderPaymentStatus(orderId, paymentStatus, transactionalEntityManager) {
        logger.log(`Updating order ${orderId} payment status to ${paymentStatus}`);
        try {
            const manager = transactionalEntityManager || this.dataSource.manager;
            logger.log('Using entity manager:', !!transactionalEntityManager ? 'provided' : 'new');
            const order = await manager.findOne(order_entity_1.Order, { where: { id: orderId } });
            if (!order) {
                logger.warn(`Order ${orderId} not found`);
                return (0, createResponse_1.createResponse)('NotFound', null, 'Order not found');
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
                order.status = order_entity_1.OrderStatus.CANCELLED;
                order.cancellation_reason = order_entity_1.OrderCancellationReason.OTHER;
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
            const updatedOrder = await manager.save(order_entity_1.Order, order);
            logger.log('Order saved successfully:', updatedOrder);
            logger.log('Notifying order status update');
            await this.notifyOrderStatus(updatedOrder);
            logger.log('Order status notification sent');
            return (0, createResponse_1.createResponse)('OK', updatedOrder, 'Order payment status updated successfully');
        }
        catch (error) {
            logger.error('Error updating order payment status:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to update order payment status');
        }
    }
    async findAllPaginated(page = 1, limit = 10) {
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
            const menuItemIds = new Set();
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
            return (0, createResponse_1.createResponse)('OK', {
                totalPages,
                currentPage: page,
                totalItems: total,
                items: orders
            }, 'Fetched paginated orders successfully');
        }
        catch (error) {
            logger.error('Error fetching paginated orders:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching paginated orders');
        }
    }
    handleError(message, error) {
        logger.error(message, error);
        return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while processing your request');
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(order_entity_1.Order)),
    __param(7, (0, typeorm_2.InjectDataSource)()),
    __param(11, (0, common_1.Inject)((0, common_1.forwardRef)(() => drivers_gateway_1.DriversGateway))),
    __param(12, (0, common_1.Inject)((0, common_1.forwardRef)(() => transactions_service_1.TransactionService))),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        menu_items_repository_1.MenuItemsRepository,
        menu_item_variants_repository_1.MenuItemVariantsRepository,
        address_book_repository_1.AddressBookRepository,
        customers_repository_1.CustomersRepository,
        driver_stats_records_service_1.DriverStatsService,
        restaurants_repository_1.RestaurantsRepository,
        typeorm_1.DataSource,
        cart_items_repository_1.CartItemsRepository,
        orders_repository_1.OrdersRepository,
        customers_gateway_1.CustomersGateway,
        drivers_gateway_1.DriversGateway,
        transactions_service_1.TransactionService,
        fwallets_repository_1.FWalletsRepository,
        event_emitter_1.EventEmitter2,
        drivers_service_1.DriversService,
        redis_service_1.RedisService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map