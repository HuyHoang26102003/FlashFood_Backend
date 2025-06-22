"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartItemsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cart_items_service_1 = require("./cart_items.service");
const cart_items_controller_1 = require("./cart_items.controller");
const cart_item_entity_1 = require("./entities/cart_item.entity");
const cart_items_repository_1 = require("./cart_items.repository");
const menu_items_module_1 = require("../menu_items/menu_items.module");
const menu_item_variants_module_1 = require("../menu_item_variants/menu_item_variants.module");
const restaurants_module_1 = require("../restaurants/restaurants.module");
const customers_module_1 = require("../customers/customers.module");
let CartItemsModule = class CartItemsModule {
};
exports.CartItemsModule = CartItemsModule;
exports.CartItemsModule = CartItemsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([cart_item_entity_1.CartItem]),
            (0, common_1.forwardRef)(() => menu_items_module_1.MenuItemsModule),
            (0, common_1.forwardRef)(() => menu_item_variants_module_1.MenuItemVariantsModule),
            (0, common_1.forwardRef)(() => restaurants_module_1.RestaurantsModule),
            (0, common_1.forwardRef)(() => customers_module_1.CustomersModule)
        ],
        controllers: [cart_items_controller_1.CartItemsController],
        providers: [cart_items_service_1.CartItemsService, cart_items_repository_1.CartItemsRepository],
        exports: [cart_items_service_1.CartItemsService, cart_items_repository_1.CartItemsRepository]
    })
], CartItemsModule);
//# sourceMappingURL=cart_items.module.js.map