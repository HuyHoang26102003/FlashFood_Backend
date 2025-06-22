"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuItemsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const menu_item_entity_1 = require("./entities/menu_item.entity");
const menu_items_controller_1 = require("./menu_items.controller");
const menu_items_service_1 = require("./menu_items.service");
const menu_items_repository_1 = require("./menu_items.repository");
const food_categories_module_1 = require("../food_categories/food_categories.module");
const restaurants_module_1 = require("../restaurants/restaurants.module");
const menu_item_variants_module_1 = require("../menu_item_variants/menu_item_variants.module");
const menu_item_variants_service_1 = require("../menu_item_variants/menu_item_variants.service");
const menu_item_variant_entity_1 = require("../menu_item_variants/entities/menu_item_variant.entity");
const food_categories_repository_1 = require("../food_categories/food_categories.repository");
const food_category_entity_1 = require("../food_categories/entities/food_category.entity");
const cart_items_module_1 = require("../cart_items/cart_items.module");
const redis_service_1 = require("../redis/redis.service");
let MenuItemsModule = class MenuItemsModule {
};
exports.MenuItemsModule = MenuItemsModule;
exports.MenuItemsModule = MenuItemsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([menu_item_entity_1.MenuItem, menu_item_variant_entity_1.MenuItemVariant, food_category_entity_1.FoodCategory]),
            (0, common_1.forwardRef)(() => food_categories_module_1.FoodCategoriesModule),
            (0, common_1.forwardRef)(() => restaurants_module_1.RestaurantsModule),
            (0, common_1.forwardRef)(() => menu_item_variants_module_1.MenuItemVariantsModule),
            (0, common_1.forwardRef)(() => cart_items_module_1.CartItemsModule)
        ],
        controllers: [menu_items_controller_1.MenuItemsController],
        providers: [
            menu_items_service_1.MenuItemsService,
            redis_service_1.RedisService,
            menu_items_repository_1.MenuItemsRepository,
            menu_item_variants_service_1.MenuItemVariantsService,
            food_categories_repository_1.FoodCategoriesRepository
        ],
        exports: [menu_items_service_1.MenuItemsService, menu_items_repository_1.MenuItemsRepository]
    })
], MenuItemsModule);
//# sourceMappingURL=menu_items.module.js.map