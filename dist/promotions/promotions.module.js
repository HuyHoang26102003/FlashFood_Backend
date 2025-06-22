"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const promotions_controller_1 = require("./promotions.controller");
const promotions_service_1 = require("./promotions.service");
const promotion_entity_1 = require("./entities/promotion.entity");
const promotions_repository_1 = require("./promotions.repository");
const food_category_entity_1 = require("../food_categories/entities/food_category.entity");
const food_categories_repository_1 = require("../food_categories/food_categories.repository");
const redis_service_1 = require("../redis/redis.service");
let PromotionsModule = class PromotionsModule {
};
exports.PromotionsModule = PromotionsModule;
exports.PromotionsModule = PromotionsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([promotion_entity_1.Promotion, food_category_entity_1.FoodCategory])],
        controllers: [promotions_controller_1.PromotionsController],
        providers: [
            promotions_service_1.PromotionsService,
            promotions_repository_1.PromotionsRepository,
            food_categories_repository_1.FoodCategoriesRepository,
            redis_service_1.RedisService
        ],
        exports: [promotions_service_1.PromotionsService, promotions_repository_1.PromotionsRepository]
    })
], PromotionsModule);
//# sourceMappingURL=promotions.module.js.map