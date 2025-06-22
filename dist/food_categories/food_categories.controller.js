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
exports.FoodCategoriesController = void 0;
const common_1 = require("@nestjs/common");
const food_categories_service_1 = require("./food_categories.service");
const create_food_category_dto_1 = require("./dto/create-food_category.dto");
const update_food_category_dto_1 = require("./dto/update-food_category.dto");
let FoodCategoriesController = class FoodCategoriesController {
    constructor(foodCategoriesService) {
        this.foodCategoriesService = foodCategoriesService;
    }
    create(createFoodCategoryDto) {
        return this.foodCategoriesService.create(createFoodCategoryDto);
    }
    findAll() {
        return this.foodCategoriesService.findAll();
    }
    findAllPaginated(page = '1', limit = '10') {
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        return this.foodCategoriesService.findAllPaginated(parsedPage, parsedLimit);
    }
    findOne(id) {
        return this.foodCategoriesService.findOne(id);
    }
    update(id, updateFoodCategoryDto) {
        return this.foodCategoriesService.update(id, updateFoodCategoryDto);
    }
    remove(id) {
        return this.foodCategoriesService.remove(id);
    }
};
exports.FoodCategoriesController = FoodCategoriesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_food_category_dto_1.CreateFoodCategoryDto]),
    __metadata("design:returntype", void 0)
], FoodCategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FoodCategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('paginated'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FoodCategoriesController.prototype, "findAllPaginated", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FoodCategoriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_food_category_dto_1.UpdateFoodCategoryDto]),
    __metadata("design:returntype", void 0)
], FoodCategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FoodCategoriesController.prototype, "remove", null);
exports.FoodCategoriesController = FoodCategoriesController = __decorate([
    (0, common_1.Controller)('food-categories'),
    __metadata("design:paramtypes", [food_categories_service_1.FoodCategoriesService])
], FoodCategoriesController);
//# sourceMappingURL=food_categories.controller.js.map