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
exports.FoodCategoriesService = void 0;
const common_1 = require("@nestjs/common");
const food_categories_repository_1 = require("./food_categories.repository");
const createResponse_1 = require("../utils/createResponse");
const food_category_entity_1 = require("./entities/food_category.entity");
const redis_service_1 = require("../redis/redis.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const logger = new common_1.Logger('FoodCategoriesService');
let FoodCategoriesService = class FoodCategoriesService {
    constructor(foodCategoriesRepository, redisService, foodCategoryRepository) {
        this.foodCategoriesRepository = foodCategoriesRepository;
        this.redisService = redisService;
        this.foodCategoryRepository = foodCategoryRepository;
        this.cacheKey = 'food_categories:all';
        this.cacheTtl = 3600;
    }
    async create(createFoodCategoryDto) {
        try {
            const existingCategory = await this.foodCategoriesRepository.findByName(createFoodCategoryDto.name);
            if (existingCategory) {
                return (0, createResponse_1.createResponse)('DuplicatedRecord', null, 'Food category with this name already exists');
            }
            const newCategory = await this.foodCategoriesRepository.create(createFoodCategoryDto);
            await this.redisService.del(this.cacheKey);
            logger.log(`Cleared cache: ${this.cacheKey}`);
            return (0, createResponse_1.createResponse)('OK', newCategory, 'Food category created successfully');
        }
        catch (error) {
            logger.error(`Error creating food category: ${error.message}`, error.stack);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error creating food category');
        }
    }
    async findAll() {
        const start = Date.now();
        try {
            const cachedData = await this.redisService.get(this.cacheKey);
            if (cachedData) {
                logger.log(`Fetched food categories from cache in ${Date.now() - start}ms`);
                return (0, createResponse_1.createResponse)('OK', JSON.parse(cachedData), 'Fetched all food categories from cache');
            }
            logger.log(`Cache miss for ${this.cacheKey}`);
            const dbStart = Date.now();
            const categories = await this.foodCategoriesRepository.findAll();
            logger.log(`Database fetch took ${Date.now() - dbStart}ms`);
            const cacheStart = Date.now();
            const cacheSaved = await this.redisService.setNx(this.cacheKey, JSON.stringify(categories), this.cacheTtl * 1000);
            if (cacheSaved) {
                logger.log(`Stored food categories in cache: ${this.cacheKey} (took ${Date.now() - cacheStart}ms)`);
            }
            else {
                logger.warn(`Failed to store food categories in cache: ${this.cacheKey}`);
            }
            logger.log(`Total time: ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', categories, 'Fetched all food categories');
        }
        catch (error) {
            logger.error(`Error fetching food categories: ${error.message}`, error.stack);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching food categories');
        }
    }
    async findOne(id) {
        try {
            const category = await this.foodCategoriesRepository.findById(id);
            if (!category) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Food category not found');
            }
            return (0, createResponse_1.createResponse)('OK', category, 'Food category retrieved successfully');
        }
        catch (error) {
            logger.error(`Error fetching food category: ${error.message}`, error.stack);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching food category');
        }
    }
    async update(id, updateFoodCategoryDto) {
        try {
            const category = await this.foodCategoriesRepository.findById(id);
            if (!category) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Food category not found');
            }
            const updatedCategory = await this.foodCategoriesRepository.update(id, updateFoodCategoryDto);
            await this.redisService.del(this.cacheKey);
            logger.log(`Cleared cache: ${this.cacheKey}`);
            return (0, createResponse_1.createResponse)('OK', updatedCategory, 'Food category updated successfully');
        }
        catch (error) {
            logger.error(`Error updating food category: ${error.message}`, error.stack);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error updating food category');
        }
    }
    async remove(id) {
        try {
            const result = await this.foodCategoriesRepository.delete(id);
            if (!result) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Food category not found');
            }
            await this.redisService.del(this.cacheKey);
            logger.log(`Cleared cache: ${this.cacheKey}`);
            return (0, createResponse_1.createResponse)('OK', null, 'Food category deleted successfully');
        }
        catch (error) {
            logger.error(`Error deleting food category: ${error.message}`, error.stack);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error deleting food category');
        }
    }
    async findAllPaginated(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [items, total] = await this.foodCategoriesRepository.findAllPaginated(skip, limit);
            const totalPages = Math.ceil(total / limit);
            return (0, createResponse_1.createResponse)('OK', {
                totalPages,
                currentPage: page,
                totalItems: total,
                items
            });
        }
        catch (error) {
            logger.error(`Error fetching paginated food categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return (0, createResponse_1.createResponse)('ServerError', null);
        }
    }
};
exports.FoodCategoriesService = FoodCategoriesService;
exports.FoodCategoriesService = FoodCategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(food_category_entity_1.FoodCategory)),
    __metadata("design:paramtypes", [food_categories_repository_1.FoodCategoriesRepository,
        redis_service_1.RedisService,
        typeorm_2.Repository])
], FoodCategoriesService);
//# sourceMappingURL=food_categories.service.js.map