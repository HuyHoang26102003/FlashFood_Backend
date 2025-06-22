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
exports.PromotionsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const promotion_entity_1 = require("./entities/promotion.entity");
let PromotionsRepository = class PromotionsRepository {
    constructor(promotionRepository) {
        this.promotionRepository = promotionRepository;
    }
    async create(promotionData) {
        const newPromotion = this.promotionRepository.create({
            ...promotionData,
            food_category_ids: promotionData.food_category_ids || []
        });
        return this.promotionRepository.save(newPromotion);
    }
    async findAll(options) {
        const queryBuilder = this.promotionRepository.createQueryBuilder('promotion');
        if (options?.relations?.includes('restaurants')) {
            queryBuilder
                .leftJoinAndSelect('promotion.restaurants', 'restaurants')
                .leftJoin('promotion.restaurants', 'restaurant_promotions');
        }
        return queryBuilder.getMany();
    }
    async findById(id) {
        return this.promotionRepository.findOne({ where: { id } });
    }
    async findByIdWithRestaurants(id) {
        const queryBuilder = this.promotionRepository
            .createQueryBuilder('promotion')
            .leftJoin('restaurant_promotions', 'rp', 'rp.promotion_id = promotion.id')
            .leftJoin('restaurants', 'restaurants', 'restaurants.id = rp.restaurant_id')
            .leftJoin('address_books', 'address', 'address.id = restaurants.address_id')
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
            'restaurants.id',
            'restaurants.restaurant_name',
            'restaurants.avatar',
            'restaurants.ratings',
            'restaurants.status',
            'address.id',
            'address.street',
            'address.city',
            'address.nationality',
            'address.postal_code',
            'address.location',
            'address.title'
        ])
            .where('promotion.id = :id', { id });
        const { entities, raw } = await queryBuilder.getRawAndEntities();
        if (!entities.length) {
            return null;
        }
        const promotion = entities[0];
        const restaurants = raw
            .map(row => ({
            id: row.restaurants_id,
            restaurant_name: row.restaurants_restaurant_name,
            avatar: row.restaurants_avatar,
            ratings: row.restaurants_ratings,
            status: row.restaurants_status,
            address: row.address_id
                ? {
                    id: row.address_id,
                    street: row.address_street,
                    city: row.address_city,
                    nationality: row.address_nationality,
                    postal_code: row.address_postal_code,
                    location: row.address_location,
                    title: row.address_title
                }
                : null
        }))
            .filter(restaurant => restaurant.id);
        return {
            ...promotion,
            restaurants: restaurants
        };
    }
    async findByName(name) {
        return this.promotionRepository.findOne({ where: { name } });
    }
    async update(id, updatePromotionDto) {
        await this.promotionRepository.update(id, {
            ...updatePromotionDto,
            food_category_ids: updatePromotionDto.food_category_ids
        });
        return this.findById(id);
    }
    async delete(id) {
        return this.promotionRepository.delete(id);
    }
    async findByIds(ids) {
        return await this.promotionRepository.findByIds(ids);
    }
    async findAllPaginated(skip, limit) {
        return this.promotionRepository.findAndCount({
            skip,
            take: limit,
            relations: ['restaurants']
        });
    }
};
exports.PromotionsRepository = PromotionsRepository;
exports.PromotionsRepository = PromotionsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(promotion_entity_1.Promotion)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PromotionsRepository);
//# sourceMappingURL=promotions.repository.js.map