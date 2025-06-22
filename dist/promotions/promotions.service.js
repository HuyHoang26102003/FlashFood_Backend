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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionsService = void 0;
const common_1 = require("@nestjs/common");
const createResponse_1 = require("../utils/createResponse");
const uuid_1 = require("uuid");
const promotions_repository_1 = require("./promotions.repository");
const food_categories_repository_1 = require("../food_categories/food_categories.repository");
const redis_service_1 = require("../redis/redis.service");
const logger = new common_1.Logger('PromotionsService');
let PromotionsService = class PromotionsService {
    constructor(promotionsRepository, foodCategoriesRepository, redisService) {
        this.promotionsRepository = promotionsRepository;
        this.foodCategoriesRepository = foodCategoriesRepository;
        this.redisService = redisService;
        this.allPromotionsCacheKey = 'promotions:all';
        this.validPromotionsCacheKey = 'promotions:valid_with_restaurants';
        this.cacheTtl = 300;
    }
    async create(createPromotionDto) {
        try {
            const existingPromotion = await this.promotionsRepository.findByName(createPromotionDto.name);
            if (existingPromotion) {
                return (0, createResponse_1.createResponse)('DuplicatedRecord', null, 'Promotion with this name already exists');
            }
            const existingFoodCategories = await Promise.all(createPromotionDto.food_category_ids.map(async (foodCategoryId) => {
                return await this.foodCategoriesRepository.findById(foodCategoryId);
            }));
            const missingCategories = existingFoodCategories.some(category => !category);
            if (missingCategories) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'One or more food categories not found');
            }
            const savedPromotion = await this.promotionsRepository.create({
                ...createPromotionDto,
                id: `FF_PROMO_${(0, uuid_1.v4)()}`,
                food_category_ids: existingFoodCategories.map(category => category.id)
            });
            await this.redisService.del(this.allPromotionsCacheKey);
            await this.redisService.del(this.validPromotionsCacheKey);
            logger.log(`Cleared cache: ${this.allPromotionsCacheKey}, ${this.validPromotionsCacheKey}`);
            return (0, createResponse_1.createResponse)('OK', savedPromotion, 'Promotion created successfully');
        }
        catch (error) {
            logger.error(`Error creating promotion: ${error.message}`, error.stack);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error creating promotion');
        }
    }
    async findValidWithRestaurants() {
        const start = Date.now();
        try {
            const cachedData = await this.redisService.get(this.validPromotionsCacheKey);
            if (cachedData) {
                logger.log(`Fetched valid promotions from cache in ${Date.now() - start}ms`);
                return (0, createResponse_1.createResponse)('OK', JSON.parse(cachedData), 'Valid promotions with restaurants retrieved from cache');
            }
            logger.log(`Cache miss for ${this.validPromotionsCacheKey}`);
            const dbStart = Date.now();
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const queryBuilder = this.promotionsRepository.promotionRepository
                .createQueryBuilder('promotion')
                .leftJoin('restaurant_promotions', 'rp', 'rp.promotion_id = promotion.id')
                .leftJoin('restaurants', 'r', 'r.id = rp.restaurant_id')
                .leftJoin('address_books', 'ab', 'ab.id = r.address_id')
                .select([
                'promotion.id',
                'promotion.name',
                'promotion.description',
                'promotion.start_date',
                'promotion.end_date',
                'promotion.discount_type',
                'promotion.discount_value',
                'promotion.promotion_cost_price',
                'promotion.minimum_order_value',
                'promotion.avatar',
                'promotion.status',
                'promotion.bogo_details',
                'promotion.created_at',
                'promotion.updated_at',
                'r.id AS restaurant_id',
                'r.restaurant_name AS restaurant_name',
                'r.avatar AS restaurant_avatar',
                'r.ratings AS restaurant_ratings',
                'ab.id AS address_id',
                'ab.street AS address_street',
                'ab.city AS address_city',
                'ab.nationality AS address_nationality',
                'ab.postal_code AS address_postal_code',
                'ab.location AS address_location',
                'ab.title AS address_title'
            ])
                .where('promotion.start_date <= :currentTimestamp', {
                currentTimestamp
            })
                .andWhere('promotion.end_date >= :currentTimestamp', {
                currentTimestamp
            });
            const { entities, raw } = await queryBuilder.getRawAndEntities();
            logger.log(`Database fetch took ${Date.now() - dbStart}ms`);
            const processingStart = Date.now();
            const promotionMap = new Map();
            entities.forEach(promo => promotionMap.set(promo.id, { ...promo, restaurants: [] }));
            raw.forEach(row => {
                const promo = promotionMap.get(row.promotion_id);
                if (promo && row.restaurant_id) {
                    promo.restaurants.push({
                        id: row.restaurant_id,
                        restaurant_name: row.restaurant_name,
                        avatar: row.restaurant_avatar,
                        ratings: row.restaurant_ratings,
                        address: {
                            id: row.address_id,
                            street: row.address_street,
                            city: row.address_city,
                            nationality: row.address_nationality,
                            postal_code: row.address_postal_code,
                            location: row.address_location,
                            title: row.address_title
                        }
                    });
                }
            });
            const result = Array.from(promotionMap.values()).map(promo => ({
                ...promo,
                restaurants: promo.restaurants.slice(0, 5)
            }));
            logger.log(`Data processing took ${Date.now() - processingStart}ms`);
            const cacheStart = Date.now();
            const cacheSaved = await this.redisService.setNx(this.validPromotionsCacheKey, JSON.stringify(result), this.cacheTtl * 1000);
            if (cacheSaved) {
                logger.log(`Stored valid promotions in cache: ${this.validPromotionsCacheKey} (took ${Date.now() - cacheStart}ms)`);
            }
            else {
                logger.warn(`Failed to store valid promotions in cache: ${this.validPromotionsCacheKey}`);
            }
            logger.log(`Total time: ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', result, 'Valid promotions with restaurants retrieved successfully');
        }
        catch (error) {
            logger.error(`Error fetching valid promotions: ${error.message}`, error.stack);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching valid promotions with restaurants');
        }
    }
    async findAll() {
        const start = Date.now();
        try {
            const cachedData = await this.redisService.get(this.allPromotionsCacheKey);
            if (cachedData) {
                logger.log(`Fetched promotions from cache in ${Date.now() - start}ms`);
                return (0, createResponse_1.createResponse)('OK', JSON.parse(cachedData), 'Promotions retrieved from cache');
            }
            logger.log(`Cache miss for ${this.allPromotionsCacheKey}`);
            const dbStart = Date.now();
            const promotions = await this.promotionsRepository.findAll();
            logger.log(`Database fetch took ${Date.now() - dbStart}ms`);
            const cacheStart = Date.now();
            const cacheSaved = await this.redisService.setNx(this.allPromotionsCacheKey, JSON.stringify(promotions), this.cacheTtl * 1000);
            if (cacheSaved) {
                logger.log(`Stored promotions in cache: ${this.allPromotionsCacheKey} (took ${Date.now() - cacheStart}ms)`);
            }
            else {
                logger.warn(`Failed to store promotions in cache: ${this.allPromotionsCacheKey}`);
            }
            logger.log(`Total time: ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', promotions, 'Promotions retrieved successfully');
        }
        catch (error) {
            logger.error(`Error fetching promotions: ${error.message}`, error.stack);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching promotions');
        }
    }
    async findOne(id) {
        const start = Date.now();
        const cacheKey = `promotion:${id}`;
        try {
            const cachedData = await this.redisService.get(cacheKey);
            if (cachedData) {
                logger.log(`Cache hit for promotion ${id} in ${Date.now() - start}ms`);
                return (0, createResponse_1.createResponse)('OK', JSON.parse(cachedData), 'Promotion retrieved from cache');
            }
            logger.log(`Cache miss for promotion ${id}`);
            const promotion = await this.promotionsRepository.findByIdWithRestaurants(id);
            if (!promotion) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Promotion not found');
            }
            await this.redisService.set(cacheKey, JSON.stringify(promotion), 300);
            logger.log(`Fetched promotion ${id} in ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', promotion, 'Promotion retrieved successfully');
        }
        catch (error) {
            logger.error(`Error fetching promotion: ${error.message}`, error.stack);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching promotion');
        }
    }
    async update(id, updatePromotionDto) {
        try {
            const promotion = await this.promotionsRepository.findById(id);
            if (!promotion) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Promotion not found');
            }
            await this.promotionsRepository.update(id, updatePromotionDto);
            const updatedPromotion = await this.promotionsRepository.findById(id);
            await this.redisService.del(this.allPromotionsCacheKey);
            await this.redisService.del(this.validPromotionsCacheKey);
            logger.log(`Cleared cache: ${this.allPromotionsCacheKey}, ${this.validPromotionsCacheKey}`);
            return (0, createResponse_1.createResponse)('OK', updatedPromotion, 'Promotion updated successfully');
        }
        catch (error) {
            logger.error(`Error updating promotion: ${error.message}`, error.stack);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error updating promotion');
        }
    }
    async remove(id) {
        try {
            const result = await this.promotionsRepository.delete(id);
            if (result.affected === 0) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Promotion not found');
            }
            await this.redisService.del(this.allPromotionsCacheKey);
            await this.redisService.del(this.validPromotionsCacheKey);
            logger.log(`Cleared cache: ${this.allPromotionsCacheKey}, ${this.validPromotionsCacheKey}`);
            return (0, createResponse_1.createResponse)('OK', null, 'Promotion deleted successfully');
        }
        catch (error) {
            logger.error(`Error deleting promotion: ${error.message}`, error.stack);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error deleting promotion');
        }
    }
    async updateEntityAvatar(uploadResult, entityId) {
        try {
            const promotion = await this.promotionsRepository.update(entityId, {
                avatar: { url: uploadResult.url, key: uploadResult.public_id }
            });
            if (!promotion) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Promotion not found');
            }
            await this.redisService.del(this.allPromotionsCacheKey);
            await this.redisService.del(this.validPromotionsCacheKey);
            logger.log(`Cleared cache: ${this.allPromotionsCacheKey}, ${this.validPromotionsCacheKey}`);
            return (0, createResponse_1.createResponse)('OK', promotion, 'Promotion avatar updated successfully');
        }
        catch (error) {
            logger.error(`Error updating promotion avatar: ${error.message}`, error.stack);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error updating promotion avatar');
        }
    }
    async findAllPaginated(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [items, total] = await this.promotionsRepository.findAllPaginated(skip, limit);
            const totalPages = Math.ceil(total / limit);
            return (0, createResponse_1.createResponse)('OK', {
                totalPages,
                currentPage: page,
                totalItems: total,
                items
            });
        }
        catch (error) {
            logger.error(`Error fetching paginated promotions: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return (0, createResponse_1.createResponse)('ServerError', null);
        }
    }
};
exports.PromotionsService = PromotionsService;
exports.PromotionsService = PromotionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [promotions_repository_1.PromotionsRepository,
        food_categories_repository_1.FoodCategoriesRepository,
        redis_service_1.RedisService])
], PromotionsService);
//# sourceMappingURL=promotions.service.js.map