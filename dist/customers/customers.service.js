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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const update_customer_dto_1 = require("./dto/update-customer.dto");
const createResponse_1 = require("../utils/createResponse");
const users_repository_1 = require("../users/users.repository");
const restaurants_repository_1 = require("../restaurants/restaurants.repository");
const customers_repository_1 = require("./customers.repository");
const food_category_entity_1 = require("../food_categories/entities/food_category.entity");
const menu_item_entity_1 = require("../menu_items/entities/menu_item.entity");
const typeorm_1 = require("typeorm");
const order_entity_1 = require("../orders/entities/order.entity");
const notifications_repository_1 = require("../notifications/notifications.repository");
const redis_1 = require("redis");
const dotenv = __importStar(require("dotenv"));
const redis_service_1 = require("../redis/redis.service");
dotenv.config();
const redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redis.connect().catch(err => logger.error('Redis connection error:', err));
const logger = new common_1.Logger('CustomersService');
let CustomersService = class CustomersService {
    constructor(restaurantRepository, userRepository, dataSource, customerRepository, notificationsRepository, redisService) {
        this.restaurantRepository = restaurantRepository;
        this.userRepository = userRepository;
        this.dataSource = dataSource;
        this.customerRepository = customerRepository;
        this.notificationsRepository = notificationsRepository;
        this.redisService = redisService;
    }
    async onModuleInit() {
        try {
            const start = Date.now();
            const restaurants = await this.restaurantRepository.repository.find({
                select: ['id'],
                take: 1000
            });
            for (const restaurant of restaurants) {
                const cacheKey = `restaurant:${restaurant.id}`;
                await redis.setEx(cacheKey, 86400, JSON.stringify({ id: restaurant.id }));
            }
            logger.log(`Preloaded ${restaurants.length} restaurants into Redis in ${Date.now() - start}ms`);
        }
        catch (error) {
            logger.error('Error preloading restaurants into Redis:', error);
        }
    }
    async create(createCustomerDto) {
        try {
            const existingUser = await this.userRepository.findById(createCustomerDto.user_id);
            if (!existingUser) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'User not found');
            }
            const existingCustomer = await this.customerRepository.findByUserId(createCustomerDto.user_id);
            if (existingCustomer) {
                return (0, createResponse_1.createResponse)('DuplicatedRecord', null, 'Customer with this user ID already exists');
            }
            const newCustomer = await this.customerRepository.create(createCustomerDto);
            return (0, createResponse_1.createResponse)('OK', newCustomer, 'Customer created successfully');
        }
        catch (error) {
            console.error('Error creating customer:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while creating the customer');
        }
    }
    async searchRestaurantsByKeyword(keyword, page = 1, limit = 10) {
        try {
            const searchKeyword = keyword.trim().toLowerCase();
            const restaurantsByName = await this.restaurantRepository.repository.find({
                where: {
                    restaurant_name: (0, typeorm_1.ILike)(`%${searchKeyword}%`)
                },
                relations: ['specialize_in', 'address']
            });
            const foodCategories = await this.dataSource
                .getRepository(food_category_entity_1.FoodCategory)
                .find({
                where: {
                    name: (0, typeorm_1.ILike)(`%${searchKeyword}%`)
                }
            });
            const categoryIds = foodCategories.map(category => category.id);
            const restaurantsByCategory = categoryIds.length > 0
                ? await this.restaurantRepository.repository.find({
                    where: {
                        specialize_in: { id: (0, typeorm_1.In)(categoryIds) }
                    },
                    relations: ['specialize_in', 'address']
                })
                : [];
            const combinedRestaurants = [
                ...restaurantsByName,
                ...restaurantsByCategory
            ];
            const uniqueRestaurantsMap = new Map(combinedRestaurants.map(r => [r.id, r]));
            const uniqueRestaurants = Array.from(uniqueRestaurantsMap.values());
            const skip = (page - 1) * limit;
            const paginatedRestaurants = uniqueRestaurants.slice(skip, skip + limit);
            return (0, createResponse_1.createResponse)('OK', paginatedRestaurants, `Found ${paginatedRestaurants.length} restaurants matching keyword "${keyword}" (total: ${uniqueRestaurants.length})`);
        }
        catch (error) {
            console.error('Error searching restaurants:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while searching restaurants');
        }
    }
    async findAll() {
        const cacheKey = 'customers:all';
        const ttl = 300;
        const start = Date.now();
        try {
            const cacheStart = Date.now();
            const cachedData = await this.redisService.get(cacheKey);
            if (cachedData) {
                logger.log(`Fetched customers from cache in ${Date.now() - cacheStart}ms`);
                logger.log(`Total time (cache): ${Date.now() - start}ms`);
                return (0, createResponse_1.createResponse)('OK', JSON.parse(cachedData), 'Fetched customers from cache successfully');
            }
            logger.log(`Cache miss for ${cacheKey}`);
            const customers = await this.customerRepository.findAll();
            const cacheSaveStart = Date.now();
            const cacheSaved = await this.redisService.setNx(cacheKey, JSON.stringify(customers), ttl * 1000);
            if (cacheSaved) {
                logger.log(`Stored customers in cache: ${cacheKey} (took ${Date.now() - cacheSaveStart}ms)`);
            }
            else {
                logger.warn(`Failed to store customers in cache: ${cacheKey}`);
            }
            logger.log(`Total DB fetch and processing took ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', customers, 'Fetched all customers');
        }
        catch (error) {
            logger.error('Error fetching customers:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while fetching customers');
        }
    }
    async findCustomerById(id) {
        const cacheKey = `customer:${id}`;
        const ttl = 300;
        const start = Date.now();
        try {
            const cacheStart = Date.now();
            const cachedData = await this.redisService.get(cacheKey);
            if (cachedData) {
                logger.log(`Fetched customer from cache in ${Date.now() - cacheStart}ms`);
                logger.log(`Total time (cache): ${Date.now() - start}ms`);
                return (0, createResponse_1.createResponse)('OK', JSON.parse(cachedData), 'Fetched customer from cache successfully');
            }
            logger.log(`Cache miss for ${cacheKey}`);
            const customer = await this.customerRepository.findById(id);
            if (!customer) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Customer not found');
            }
            const user = await this.userRepository.findById(customer.user_id);
            if (!user) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'User not found');
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
            const cacheSaveStart = Date.now();
            const cacheSaved = await this.redisService.setNx(cacheKey, JSON.stringify(customerWithUserData), ttl * 1000);
            if (cacheSaved) {
                logger.log(`Stored customer in cache: ${cacheKey} (took ${Date.now() - cacheSaveStart}ms)`);
            }
            else {
                logger.warn(`Failed to store customer in cache: ${cacheKey}`);
            }
            logger.log(`Total DB fetch and processing took ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', customerWithUserData, 'Fetched customer and user data successfully');
        }
        catch (error) {
            logger.error('Error fetching customer and user:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while fetching the customer and user data');
        }
    }
    async update(id, updateCustomerDto) {
        const start = Date.now();
        try {
            const cacheKey = `customer:${id}`;
            const restaurantsCacheKey = `restaurants:customer:${id}`;
            let customer = null;
            const cached = await this.redisService.get(cacheKey);
            if (cached) {
                customer = JSON.parse(cached);
                logger.log(`Fetch customer (cache) took ${Date.now() - start}ms`);
            }
            else {
                customer = await this.customerRepository.findById(id);
                if (customer) {
                    await this.redisService.setNx(cacheKey, JSON.stringify(customer), 7200 * 1000);
                    logger.log(`Stored customer in Redis: ${cacheKey}`);
                }
                logger.log(`Fetch customer took ${Date.now() - start}ms`);
            }
            if (!customer) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Customer not found');
            }
            Object.assign(customer, updateCustomerDto);
            const saveStart = Date.now();
            const updatedCustomer = await this.customerRepository.save(customer);
            await this.redisService.setNx(cacheKey, JSON.stringify(updatedCustomer), 7200 * 1000);
            await this.redisService.del(restaurantsCacheKey);
            logger.log(`Save customer took ${Date.now() - saveStart}ms`);
            logger.log(`Update customer took ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', updatedCustomer, 'Customer updated successfully');
        }
        catch (error) {
            logger.error('Error updating customer:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while updating the customer');
        }
    }
    async toggleFavoriteRestaurant(id, toggleDto) {
        const start = Date.now();
        try {
            const restaurantId = toggleDto.favorite_restaurant;
            const cacheKey = `customer:${id}`;
            let customer = null;
            let favoriteRestaurantIds = [];
            const fetchCustomerStart = Date.now();
            const cached = await redis.get(cacheKey);
            if (cached) {
                customer = JSON.parse(cached);
                favoriteRestaurantIds = (customer.favorite_restaurants || []).map(r => r.id);
                logger.log(`Fetch customer (cache) took ${Date.now() - fetchCustomerStart}ms`);
            }
            else {
                customer = await this.customerRepository.findById(id);
                if (customer) {
                    favoriteRestaurantIds = (customer.favorite_restaurants || []).map(r => r.id);
                    await redis.setEx(cacheKey, 7200, JSON.stringify(customer));
                    logger.log(`Stored customer in Redis: ${cacheKey}`);
                }
                logger.log(`Fetch customer took ${Date.now() - fetchCustomerStart}ms`);
            }
            if (!customer) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Customer not found');
            }
            const restaurantCacheKey = `restaurant:${restaurantId}`;
            let restaurantExists = false;
            const restaurantFetchStart = Date.now();
            const restaurantCached = await redis.get(restaurantCacheKey);
            if (restaurantCached) {
                restaurantExists = true;
                logger.log(`Fetch restaurant (cache) took ${Date.now() - restaurantFetchStart}ms`);
            }
            else {
                const restaurant = await this.dataSource
                    .createQueryBuilder()
                    .from('restaurants', 'restaurant')
                    .where('restaurant.id = :id', { id: restaurantId })
                    .select('1')
                    .getRawOne();
                if (restaurant) {
                    restaurantExists = true;
                    await redis.setEx(restaurantCacheKey, 86400, JSON.stringify({ id: restaurantId }));
                    logger.log(`Stored restaurant in Redis: ${restaurantCacheKey}`);
                }
                logger.log(`Fetch restaurant took ${Date.now() - restaurantFetchStart}ms`);
            }
            if (!restaurantExists) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Restaurant not found');
            }
            let updatedFavoriteIds;
            let isAdding = false;
            if (favoriteRestaurantIds.includes(restaurantId)) {
                updatedFavoriteIds = favoriteRestaurantIds.filter(id => id !== restaurantId);
                logger.log(`Removed restaurant ${restaurantId} from favorites`);
            }
            else {
                updatedFavoriteIds = [...favoriteRestaurantIds, restaurantId];
                isAdding = true;
                logger.log(`Added restaurant ${restaurantId} to favorites`);
            }
            const updateStart = Date.now();
            if (isAdding) {
                await this.dataSource
                    .createQueryBuilder()
                    .insert()
                    .into('customer_favorite_restaurants')
                    .values({ customer_id: id, restaurant_id: restaurantId })
                    .orIgnore()
                    .execute();
            }
            else {
                await this.dataSource
                    .createQueryBuilder()
                    .delete()
                    .from('customer_favorite_restaurants')
                    .where('customer_id = :customerId AND restaurant_id = :restaurantId', {
                    customerId: id,
                    restaurantId
                })
                    .execute();
            }
            logger.log(`Update favorite restaurants took ${Date.now() - updateStart}ms`);
            const updatedCustomer = {
                ...customer,
                favorite_restaurants: updatedFavoriteIds.map(id => ({ id }))
            };
            await redis.setEx(cacheKey, 7200, JSON.stringify(updatedCustomer));
            logger.log(`Toggle favorite restaurant took ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', updatedCustomer, 'Favorite restaurant toggled successfully');
        }
        catch (error) {
            logger.error('Error toggling favorite restaurant:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while toggling favorite restaurant');
        }
    }
    async remove(id) {
        try {
            await this.customerRepository.remove(id);
            return (0, createResponse_1.createResponse)('OK', null, 'Customer deleted successfully');
        }
        catch (error) {
            console.error('Error deleting customer:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while deleting the customer');
        }
    }
    async updateEntityAvatar(uploadResult, entityId) {
        try {
            const customer = await this.customerRepository.findById(entityId);
            if (!customer) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Customer not found');
            }
            const updateDto = new update_customer_dto_1.UpdateCustomerDto();
            updateDto.avatar = {
                url: uploadResult.url,
                key: uploadResult.public_id
            };
            const updatedCustomer = await this.customerRepository.update(entityId, updateDto);
            return (0, createResponse_1.createResponse)('OK', updatedCustomer, 'Customer avatar updated successfully');
        }
        catch (error) {
            console.error('Error updating customer avatar:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while updating the customer avatar');
        }
    }
    isRestaurantOpen(restaurant) {
        const currentDay = new Date().getDay();
        const currentTime = new Date().getHours() * 60 + new Date().getMinutes();
        const openingHours = restaurant.opening_hours;
        const dayOfWeek = Object.keys(openingHours)[currentDay];
        if (openingHours[dayOfWeek]) {
            const { from, to } = openingHours[dayOfWeek];
            return currentTime >= from && currentTime <= to;
        }
        return false;
    }
    async getFavoriteRestaurants(customerId) {
        try {
            const customer = await this.customerRepository.findByIdWithFavoriterRestaurants(customerId);
            if (!customer) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Customer not found');
            }
            console.log('cehck what happen', customer.favorite_restaurants, customer);
            const favoriteRestaurantIds = customer.favorite_restaurants.map(r => r.id);
            if (!favoriteRestaurantIds || favoriteRestaurantIds.length === 0) {
                return (0, createResponse_1.createResponse)('OK', [], 'No favorite restaurants found for this customer');
            }
            const favoriteRestaurants = await this.restaurantRepository.repository.find({
                where: { id: (0, typeorm_1.In)(favoriteRestaurantIds) },
                relations: ['specialize_in', 'address'],
                select: {
                    id: true,
                    restaurant_name: true,
                    avatar: { url: true, key: true },
                    address: {
                        id: true,
                        street: true,
                        city: true,
                        postal_code: true,
                        location: { lat: true, lng: true }
                    }
                }
            });
            return (0, createResponse_1.createResponse)('OK', favoriteRestaurants, `Fetched ${favoriteRestaurants.length} favorite restaurants successfully`);
        }
        catch (error) {
            console.error('Error fetching favorite restaurants:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while fetching favorite restaurants');
        }
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
                Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    async getAllRestaurants(customerId) {
        const cacheKey = `restaurants:customer:${customerId}`;
        const ttl = 3600;
        const start = Date.now();
        try {
            const cacheStart = Date.now();
            const cachedData = await this.redisService.get(cacheKey);
            if (cachedData) {
                logger.log(`Fetched restaurants from cache in ${Date.now() - cacheStart}ms`);
                logger.log(`Total time (cache): ${Date.now() - start}ms`);
                return (0, createResponse_1.createResponse)('OK', JSON.parse(cachedData), 'Fetched and prioritized restaurants from cache successfully');
            }
            logger.log(`Cache miss, fetching from DB (took ${Date.now() - cacheStart}ms)`);
            const customerStart = Date.now();
            const customer = await this.customerRepository.findById(customerId);
            if (!customer) {
                logger.log(`Customer fetch took ${Date.now() - customerStart}ms`);
                return (0, createResponse_1.createResponse)('NotFound', null, 'Customer not found');
            }
            logger.log(`Customer fetch took ${Date.now() - customerStart}ms`);
            const { preferred_category, restaurant_history, address: customerAddress } = customer;
            const customerAddressArray = customerAddress;
            const restaurantsStart = Date.now();
            const restaurants = await this.restaurantRepository.findAll();
            logger.log(`Restaurants fetch took ${Date.now() - restaurantsStart}ms`);
            const prioritizationStart = Date.now();
            const prioritizedRestaurants = restaurants
                .map(restaurant => {
                const customerLocation = customerAddressArray?.[0]?.location;
                const restaurantAddress = restaurant.address;
                if (!customerLocation || !restaurantAddress?.location) {
                    return { ...restaurant, priorityScore: 0 };
                }
                const restaurantLocation = restaurantAddress.location;
                const isPreferred = restaurant.specialize_in.some(category => preferred_category.includes(category));
                const visitHistory = restaurant_history
                    ? restaurant_history.find(history => history.restaurant_id === restaurant.id)
                    : null;
                const visitCount = visitHistory ? visitHistory.count : 0;
                const distance = this.calculateDistance(customerLocation.lat, customerLocation.lng, restaurantLocation.lat, restaurantLocation.lng);
                const distanceWeight = 1 / (distance + 1);
                const priorityScore = (isPreferred ? 1 : 0) * 3 + visitCount * 2 + distanceWeight * 5;
                return {
                    ...restaurant,
                    priorityScore
                };
            })
                .sort((a, b) => b.priorityScore - a.priorityScore);
            logger.log(`Prioritization took ${Date.now() - prioritizationStart}ms`);
            const cacheSaveStart = Date.now();
            const cacheSaved = await this.redisService.setNx(cacheKey, JSON.stringify(prioritizedRestaurants), ttl * 1000);
            if (cacheSaved) {
                logger.log(`Stored restaurants in cache: ${cacheKey} (took ${Date.now() - cacheSaveStart}ms)`);
            }
            else {
                logger.warn(`Failed to store restaurants in cache: ${cacheKey}`);
            }
            logger.log(`Total DB fetch and processing took ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', prioritizedRestaurants, 'Fetched and prioritized restaurants successfully');
        }
        catch (error) {
            logger.error(`Error fetching restaurants: ${error.message}`, error.stack);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while fetching and prioritizing restaurants');
        }
    }
    async getAllOrders(customerId) {
        const cacheKey = `orders:customer:${customerId}`;
        const ttl = 300;
        const start = Date.now();
        try {
            const cacheStart = Date.now();
            const cachedData = await this.redisService.get(cacheKey);
            if (cachedData) {
                logger.log(`Fetched orders from cache in ${Date.now() - cacheStart}ms`);
                logger.log(`Total time (cache): ${Date.now() - start}ms`);
                return (0, createResponse_1.createResponse)('OK', JSON.parse(cachedData), 'Fetched orders from cache successfully');
            }
            logger.log(`Cache miss for ${cacheKey}`);
            const customerStart = Date.now();
            const customer = await this.customerRepository.findById(customerId);
            if (!customer) {
                logger.log(`Customer fetch took ${Date.now() - customerStart}ms`);
                return (0, createResponse_1.createResponse)('NotFound', null, 'Customer not found');
            }
            logger.log(`Customer fetch took ${Date.now() - customerStart}ms`);
            const ordersStart = Date.now();
            const orders = await this.dataSource.getRepository(order_entity_1.Order).find({
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
                const response = (0, createResponse_1.createResponse)('OK', [], 'No orders found for this customer');
                await this.redisService.setNx(cacheKey, JSON.stringify([]), ttl * 1000);
                logger.log(`Stored empty orders in cache: ${cacheKey}`);
                return response;
            }
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
            const specializationMap = new Map(specializations.map(spec => [spec.restaurant_id, spec.specializations]));
            logger.log(`Specializations fetch took ${Date.now() - specializationsStart}ms`);
            const menuItemsStart = Date.now();
            const allItemIds = orders.flatMap(order => order.order_items.map(item => item.item_id));
            const menuItems = await this.dataSource.getRepository(menu_item_entity_1.MenuItem).find({
                where: { id: (0, typeorm_1.In)(allItemIds) },
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
            const processingStart = Date.now();
            const populatedOrders = orders.map(order => {
                const populatedOrderItems = order.order_items.map(item => ({
                    ...item,
                    menu_item: menuItemMap.get(item.item_id) || null
                }));
                const restaurantSpecializations = specializationMap.get(order.restaurant_id) || [];
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
                if (order.status === 'CANCELLED' ||
                    order.tracking_info === 'CANCELLED') {
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
            const cacheSaveStart = Date.now();
            const cacheSaved = await this.redisService.setNx(cacheKey, JSON.stringify(populatedOrders), ttl * 1000);
            if (cacheSaved) {
                logger.log(`Stored orders in cache: ${cacheKey} (took ${Date.now() - cacheSaveStart}ms)`);
            }
            else {
                logger.warn(`Failed to store orders in cache: ${cacheKey}`);
            }
            logger.log(`Total DB fetch and processing took ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', populatedOrders, 'Fetched orders successfully');
        }
        catch (error) {
            logger.error(`Error fetching orders: ${error.message}`, error.stack);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while fetching orders');
        }
    }
    async findOne(conditions) {
        try {
            const customer = await this.customerRepository.findOneBy(conditions);
            if (!customer) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Customer not found');
            }
            return (0, createResponse_1.createResponse)('OK', customer, 'Customer found successfully');
        }
        catch (error) {
            console.error('Error finding customer:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while finding the customer');
        }
    }
    async getNotifications(customerId) {
        try {
            const customer = await this.customerRepository.findById(customerId);
            if (!customer) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Customer not found');
            }
            const specificNotifications = await this.notificationsRepository.findAll({
                where: { target_user_id: customerId },
                relations: ['created_by']
            });
            const broadcastNotifications = await this.notificationsRepository.findAll({
                where: {
                    target_user: (0, typeorm_1.Raw)(alias => `'CUSTOMER' = ANY(${alias})`)
                },
                relations: ['created_by']
            });
            const allNotifications = [
                ...specificNotifications,
                ...broadcastNotifications
            ];
            const uniqueNotificationsMap = new Map(allNotifications.map(n => [n.id, n]));
            const uniqueNotifications = Array.from(uniqueNotificationsMap.values());
            const sortedNotifications = uniqueNotifications.sort((a, b) => b.created_at - a.created_at);
            return (0, createResponse_1.createResponse)('OK', sortedNotifications, `Fetched ${sortedNotifications.length} notifications for customer ${customerId}`);
        }
        catch (error) {
            console.error('Error fetching notifications for customer:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while fetching notifications');
        }
    }
    async findAllPaginated(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [customers, total] = await this.customerRepository.findAllPaginated(skip, limit);
            const totalPages = Math.ceil(total / limit);
            return (0, createResponse_1.createResponse)('OK', {
                totalPages,
                currentPage: page,
                totalItems: total,
                items: customers
            }, 'Fetched paginated customers');
        }
        catch (error) {
            console.error('Error fetching paginated customers:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching paginated customers');
        }
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [restaurants_repository_1.RestaurantsRepository,
        users_repository_1.UserRepository,
        typeorm_1.DataSource,
        customers_repository_1.CustomersRepository,
        notifications_repository_1.NotificationsRepository,
        redis_service_1.RedisService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map