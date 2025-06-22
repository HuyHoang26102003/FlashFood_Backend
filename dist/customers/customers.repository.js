"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("./entities/customer.entity");
const address_book_entity_1 = require("../address_book/entities/address_book.entity");
const food_category_entity_1 = require("../food_categories/entities/food_category.entity");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const redis_1 = require("redis");
const logger = new common_1.Logger('OrdersService');
const redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redis.connect().catch(err => logger.error('Redis connection error:', err));
let CustomersRepository = class CustomersRepository {
    constructor(customerRepository, addressRepository, foodCategoryRepository, restaurantRepository, dataSource) {
        this.customerRepository = customerRepository;
        this.addressRepository = addressRepository;
        this.foodCategoryRepository = foodCategoryRepository;
        this.restaurantRepository = restaurantRepository;
        this.dataSource = dataSource;
    }
    async save(customer) {
        const savedCustomer = await this.customerRepository.save(customer);
        await redis.del(`customer:${customer.id}`);
        await redis.del(`customer:user:${customer.user_id}`);
        return savedCustomer;
    }
    async create(createCustomerDto) {
        const { address_ids = [], preferred_category_ids = [], favorite_restaurant_ids = [], ...customerData } = createCustomerDto;
        const customer = new customer_entity_1.Customer();
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
                id: (0, typeorm_2.In)(address_ids)
            });
            customer.address = addresses;
        }
        if (preferred_category_ids.length > 0) {
            const categories = await this.foodCategoryRepository.findBy({
                id: (0, typeorm_2.In)(preferred_category_ids)
            });
            customer.preferred_category = categories;
        }
        if (favorite_restaurant_ids.length > 0) {
            const restaurants = await this.restaurantRepository.findBy({
                id: (0, typeorm_2.In)(favorite_restaurant_ids)
            });
            customer.favorite_restaurants = restaurants;
        }
        return await this.customerRepository.save(customer);
    }
    async findAll() {
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
    async findById(customerId) {
        return this.dataSource
            .createQueryBuilder(customer_entity_1.Customer, 'customer')
            .leftJoinAndSelect('customer.address', 'address')
            .leftJoinAndSelect('customer.preferred_category', 'preferred_category')
            .where('customer.id = :customerId', { customerId })
            .getOne();
    }
    async findByIdWithFavoriterRestaurants(customerId) {
        return this.dataSource
            .createQueryBuilder(customer_entity_1.Customer, 'customer')
            .leftJoinAndSelect('customer.favorite_restaurants', 'favoriteRestaurants')
            .where('customer.id = :customerId', { customerId })
            .getOne();
    }
    async findByUserId(userId) {
        const cacheKey = `customer:user:${userId}`;
        const cached = await redis.get(cacheKey);
        console.log('echck cached', cached);
        if (cached) {
            return JSON.parse(cached);
        }
        const customer = await this.customerRepository.findOne({
            where: { user_id: userId },
            relations: ['address']
        });
        if (customer) {
            await redis.setEx(cacheKey, 3600, JSON.stringify(customer));
        }
        return customer;
    }
    async update(id, updateCustomerDto) {
        const customer = await this.findById(id);
        if (!customer) {
            return null;
        }
        const { address_ids, preferred_category_ids, favorite_restaurant_ids, ...updateData } = updateCustomerDto;
        if (address_ids?.length) {
            const addresses = await this.addressRepository.findBy({
                id: (0, typeorm_2.In)(address_ids)
            });
            customer.address = addresses;
        }
        if (preferred_category_ids?.length) {
            const categories = await this.foodCategoryRepository.findBy({
                id: (0, typeorm_2.In)(preferred_category_ids)
            });
            customer.preferred_category = categories;
        }
        if (favorite_restaurant_ids?.length) {
            const restaurants = await this.restaurantRepository.findBy({
                id: (0, typeorm_2.In)(favorite_restaurant_ids)
            });
            customer.favorite_restaurants = restaurants;
        }
        Object.assign(customer, updateData);
        customer.updated_at = Math.floor(Date.now() / 1000);
        const updatedCustomer = await this.customerRepository.save(customer);
        await redis.del(`customer:${id}`);
        await redis.del(`customer:user:${customer.user_id}`);
        return updatedCustomer;
    }
    async remove(id) {
        const customer = await this.findById(id);
        await this.customerRepository.delete(id);
        if (customer) {
            await redis.del(`customer:${id}`);
            await redis.del(`customer:user:${customer.user_id}`);
        }
    }
    async findOneBy(conditions) {
        return await this.customerRepository.findOne({
            where: conditions,
            select: ['id', 'user_id']
        });
    }
    async findAllPaginated(skip, limit) {
        return await this.customerRepository.findAndCount({
            skip,
            take: limit,
            relations: ['user']
        });
    }
};
exports.CustomersRepository = CustomersRepository;
exports.CustomersRepository = CustomersRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(1, (0, typeorm_1.InjectRepository)(address_book_entity_1.AddressBook)),
    __param(2, (0, typeorm_1.InjectRepository)(food_category_entity_1.FoodCategory)),
    __param(3, (0, typeorm_1.InjectRepository)(restaurant_entity_1.Restaurant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], CustomersRepository);
//# sourceMappingURL=customers.repository.js.map