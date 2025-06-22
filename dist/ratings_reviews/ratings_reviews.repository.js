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
exports.RatingsReviewsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const ratings_review_entity_1 = require("./entities/ratings_review.entity");
let RatingsReviewsRepository = class RatingsReviewsRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async create(createDto) {
        const review = this.repository.create(createDto);
        return await this.repository.save(review);
    }
    async findAll(query = {}) {
        const whereClause = {};
        if (query.rr_recipient_driver_id) {
            whereClause.rr_recipient_driver_id = query.rr_recipient_driver_id;
        }
        if (query.rr_recipient_restaurant_id) {
            whereClause.rr_recipient_restaurant_id = query.rr_recipient_restaurant_id;
        }
        if (query.rr_recipient_customer_id) {
            whereClause.rr_recipient_customer_id = query.rr_recipient_customer_id;
        }
        if (query.rr_recipient_customercare_id) {
            whereClause.rr_recipient_customercare_id =
                query.rr_recipient_customercare_id;
        }
        if (query.recipient_type) {
            whereClause.recipient_type = query.recipient_type;
        }
        return await this.repository.find({
            where: whereClause,
            relations: [
                'reviewer_customer',
                'reviewer_restaurant',
                'reviewer_driver',
                'reviewer_customercare',
                'order'
            ]
        });
    }
    async findById(id) {
        return await this.repository.findOne({ where: { id } });
    }
    async findOne(query) {
        return await this.repository.findOne({ where: query });
    }
    async update(id, updateDto) {
        await this.repository.update(id, {
            ...updateDto,
            updated_at: Math.floor(Date.now() / 1000)
        });
        return await this.findById(id);
    }
    async remove(id) {
        const result = await this.repository.delete(id);
        return result.affected > 0;
    }
};
exports.RatingsReviewsRepository = RatingsReviewsRepository;
exports.RatingsReviewsRepository = RatingsReviewsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(ratings_review_entity_1.RatingsReview)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], RatingsReviewsRepository);
//# sourceMappingURL=ratings_reviews.repository.js.map