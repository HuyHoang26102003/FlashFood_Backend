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
exports.CartItemsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const cart_item_entity_1 = require("./entities/cart_item.entity");
const typeorm_3 = require("typeorm");
const redis_1 = require("redis");
const logger = new common_1.Logger('CartItemsRepository');
const redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redis.connect().catch(err => logger.error('Redis connection error:', err));
let CartItemsRepository = class CartItemsRepository {
    constructor(repository, dataSource) {
        this.repository = repository;
        this.dataSource = dataSource;
    }
    async create(createDto) {
        try {
            const cartItem = this.repository.create(createDto);
            const savedItem = await this.repository.save(cartItem);
            await redis.del(`cart_items:${createDto.customer_id}`);
            return savedItem;
        }
        catch (error) {
            logger.error('Error creating cart item:', error);
            throw error;
        }
    }
    async findAll(query = {}) {
        try {
            return await this.repository.find({
                where: query,
                relations: ['customer', 'item', 'restaurant'],
                select: ['id', 'customer_id', 'item_id', 'variants', 'restaurant_id']
            });
        }
        catch (error) {
            logger.error('Error finding all cart items:', error);
            throw error;
        }
    }
    async findById(id) {
        try {
            return await this.repository.findOne({
                where: { id: (0, typeorm_3.Equal)(id) },
                relations: ['customer', 'item', 'restaurant'],
                select: ['id', 'customer_id', 'item_id', 'variants', 'restaurant_id']
            });
        }
        catch (error) {
            logger.error('Error finding cart item by id:', error);
            throw error;
        }
    }
    async findByCustomerId(customerId, options) {
        try {
            return this.dataSource
                .createQueryBuilder(cart_item_entity_1.CartItem, 'cart_item')
                .leftJoinAndSelect('cart_item.customer', 'customer')
                .leftJoinAndSelect('cart_item.item', 'item')
                .leftJoinAndSelect('cart_item.restaurant', 'restaurant')
                .where('cart_item.customer_id = :customerId', { customerId })
                .andWhere('cart_item.deleted_at IS NULL')
                .select([
                'cart_item.id',
                'cart_item.customer_id',
                'cart_item.item_id',
                'cart_item.restaurant_id',
                'cart_item.variants',
                'cart_item.created_at',
                'cart_item.updated_at'
            ])
                .take(options.take)
                .useIndex('idx_cart_items_customer_id')
                .getMany();
        }
        catch (error) {
            logger.error('Error finding cart items by customer id:', error);
            throw error;
        }
    }
    async findOne(query) {
        try {
            const { where } = query;
            return await this.repository.findOne({
                where: where || query,
                relations: ['customer', 'item', 'restaurant'],
                select: ['id', 'customer_id', 'item_id', 'variants', 'restaurant_id']
            });
        }
        catch (error) {
            logger.error('Error finding one cart item:', error);
            throw error;
        }
    }
    async update(id, updateDto) {
        try {
            await this.repository.update(id, {
                ...updateDto,
                updated_at: Math.floor(Date.now() / 1000)
            });
            const updatedItem = await this.findById(id);
            if (updatedItem) {
                await redis.del(`cart_items:${updatedItem.customer_id}`);
            }
            return updatedItem;
        }
        catch (error) {
            logger.error('Error updating cart item:', error);
            throw error;
        }
    }
    async remove(id) {
        try {
            const item = await this.findById(id);
            const result = await this.repository.delete(id);
            if (item) {
                await redis.del(`cart_items:${item.customer_id}`);
            }
            return result.affected > 0;
        }
        catch (error) {
            logger.error('Error removing cart item:', error);
            throw error;
        }
    }
};
exports.CartItemsRepository = CartItemsRepository;
exports.CartItemsRepository = CartItemsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(cart_item_entity_1.CartItem)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.DataSource])
], CartItemsRepository);
//# sourceMappingURL=cart_items.repository.js.map