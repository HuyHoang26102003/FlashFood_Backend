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
exports.MenuItemsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const menu_item_entity_1 = require("./entities/menu_item.entity");
let MenuItemsRepository = class MenuItemsRepository {
    constructor(menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }
    async findByIds(ids) {
        return this.menuItemRepository.find({
            where: { id: (0, typeorm_2.In)(ids) },
            select: ['id', 'price', 'restaurant_id', 'avatar', 'name', 'variants']
        });
    }
    async create(data) {
        const menuItem = this.menuItemRepository.create(data);
        return this.menuItemRepository.save(menuItem);
    }
    async findById(id) {
        console.log('findById with id:', id);
        return this.menuItemRepository.findOne({
            where: { id: (0, typeorm_2.Equal)(id) },
            relations: ['variants', 'restaurant']
        });
    }
    async findOne(conditions) {
        console.log('findOne conditions:', JSON.stringify(conditions, null, 2));
        const { where, relations } = conditions;
        const result = await this.menuItemRepository.findOne({
            where: where || conditions,
            relations: relations || ['variants', 'restaurant']
        });
        console.log('findOne result:', JSON.stringify(result, null, 2));
        return result;
    }
    async findAll() {
        return this.menuItemRepository.find({ relations: ['variants'] });
    }
    async findByRestaurantId(restaurantId) {
        console.log('Finding menu items for restaurant:', restaurantId);
        const result = await this.menuItemRepository
            .createQueryBuilder('menuItem')
            .leftJoinAndSelect('menuItem.variants', 'variants')
            .where('menuItem.restaurant_id = :restaurantId', { restaurantId })
            .getMany();
        console.log(`Found ${result?.length || 0} menu items for restaurant ${restaurantId}`);
        return result || [];
    }
    async update(id, data) {
        await this.menuItemRepository
            .createQueryBuilder()
            .update(menu_item_entity_1.MenuItem)
            .set(data)
            .where('id = :id', { id })
            .execute();
        return this.findById(id);
    }
    async remove(id) {
        await this.menuItemRepository.delete(id);
    }
    async save(menuItem) {
        return this.menuItemRepository.save(menuItem);
    }
    async findAllPaginated(skip, limit) {
        return this.menuItemRepository.findAndCount({
            skip,
            take: limit,
            relations: ['variants', 'restaurant']
        });
    }
};
exports.MenuItemsRepository = MenuItemsRepository;
exports.MenuItemsRepository = MenuItemsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(menu_item_entity_1.MenuItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MenuItemsRepository);
//# sourceMappingURL=menu_items.repository.js.map