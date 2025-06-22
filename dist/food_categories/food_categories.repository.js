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
exports.FoodCategoriesRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const food_category_entity_1 = require("./entities/food_category.entity");
let FoodCategoriesRepository = class FoodCategoriesRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async create(createDto) {
        const category = this.repository.create({
            ...createDto
        });
        return await this.repository.save(category);
    }
    async findAll() {
        return await this.repository.find();
    }
    async findById(id) {
        return await this.repository.findOne({ where: { id } });
    }
    async findByIds(ids) {
        return await this.repository.find({
            where: { id: (0, typeorm_1.In)(ids) }
        });
    }
    async findByName(name) {
        return await this.repository.findOne({ where: { name } });
    }
    async update(id, updateDto) {
        await this.repository.update(id, {
            ...updateDto,
            updated_at: Math.floor(Date.now() / 1000)
        });
        return await this.findById(id);
    }
    async delete(id) {
        const result = await this.repository.delete(id);
        return result.affected > 0;
    }
    async findAllPaginated(skip, limit) {
        return this.repository.findAndCount({
            skip,
            take: limit
        });
    }
};
exports.FoodCategoriesRepository = FoodCategoriesRepository;
exports.FoodCategoriesRepository = FoodCategoriesRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(food_category_entity_1.FoodCategory)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], FoodCategoriesRepository);
//# sourceMappingURL=food_categories.repository.js.map