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
exports.OrdersRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const order_entity_1 = require("./entities/order.entity");
const promotion_entity_1 = require("../promotions/entities/promotion.entity");
let OrdersRepository = class OrdersRepository {
    constructor(repository, promotionRepository) {
        this.repository = repository;
        this.promotionRepository = promotionRepository;
    }
    async create(createDto) {
        let promotionsApplied = [];
        if (createDto.promotion_applied) {
            const promotion = await this.promotionRepository.findOne({
                where: {
                    id: createDto.promotion_applied
                }
            });
            if (promotion) {
                promotionsApplied = [promotion];
            }
        }
        const orderData = {
            ...createDto,
            status: createDto.status,
            tracking_info: createDto.tracking_info,
            promotions_applied: promotionsApplied
        };
        const order = this.repository.create(orderData);
        return await this.repository.save(order);
    }
    async findAll() {
        return await this.repository.find();
    }
    async findById(id) {
        const result = await this.repository.findOne({
            where: { id },
            relations: ['restaurantAddress', 'customerAddress'],
            cache: false
        });
        return result;
    }
    async findOne(conditions) {
        return await this.repository.findOne({ where: conditions });
    }
    async update(id, updateDto) {
        const existingOrder = await this.findById(id);
        if (!existingOrder) {
            throw new Error('Order not found');
        }
        const updateData = {
            status: updateDto.status ? updateDto.status : undefined,
            tracking_info: updateDto.tracking_info
                ? updateDto.tracking_info
                : undefined,
            driver_id: updateDto.driver_id,
            distance: updateDto.distance,
            updated_at: Math.floor(Date.now() / 1000)
        };
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        await this.repository
            .createQueryBuilder()
            .update(order_entity_1.Order)
            .set(updateData)
            .where('id = :id', { id })
            .execute();
        if (updateDto.promotions_applied?.length > 0) {
            const promotionsApplied = await this.promotionRepository.find({
                where: {
                    id: (0, typeorm_1.In)(updateDto.promotions_applied)
                }
            });
            const order = await this.repository.findOne({
                where: { id },
                relations: ['promotions_applied']
            });
            order.promotions_applied = promotionsApplied;
            await this.repository.save(order);
        }
        return await this.findById(id);
    }
    async delete(id) {
        const result = await this.repository.delete(id);
        return result.affected > 0;
    }
    async updateStatus(id, { status, tracking_info }) {
        await this.repository.update(id, {
            status,
            tracking_info,
            updated_at: Math.floor(Date.now() / 1000)
        });
        return this.findById(id);
    }
    async updateTrackingInfo(id, tracking_info) {
        await this.repository.update(id, {
            tracking_info,
            updated_at: Math.floor(Date.now() / 1000)
        });
        return this.findById(id);
    }
    async updateDriverTips(id, driver_tips) {
        await this.repository.update(id, {
            driver_tips,
            updated_at: Math.floor(Date.now() / 1000)
        });
        return this.findById(id);
    }
    async findAllPaginated(skip, limit) {
        return await this.repository.findAndCount({
            skip,
            take: limit,
            relations: ['customer', 'restaurant', 'driver']
        });
    }
};
exports.OrdersRepository = OrdersRepository;
exports.OrdersRepository = OrdersRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_2.InjectRepository)(promotion_entity_1.Promotion)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository])
], OrdersRepository);
//# sourceMappingURL=orders.repository.js.map