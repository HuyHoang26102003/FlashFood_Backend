"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuItemVariantsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const menu_item_variant_entity_1 = require("./entities/menu_item_variant.entity");
const menu_item_variants_controller_1 = require("./menu_item_variants.controller");
const menu_item_variants_service_1 = require("./menu_item_variants.service");
const menu_item_variants_repository_1 = require("./menu_item_variants.repository");
const menu_item_entity_1 = require("../menu_items/entities/menu_item.entity");
const menu_items_repository_1 = require("../menu_items/menu_items.repository");
const menu_items_module_1 = require("../menu_items/menu_items.module");
const cart_items_module_1 = require("../cart_items/cart_items.module");
let MenuItemVariantsModule = class MenuItemVariantsModule {
};
exports.MenuItemVariantsModule = MenuItemVariantsModule;
exports.MenuItemVariantsModule = MenuItemVariantsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([menu_item_variant_entity_1.MenuItemVariant, menu_item_entity_1.MenuItem]),
            (0, common_1.forwardRef)(() => menu_items_module_1.MenuItemsModule),
            (0, common_1.forwardRef)(() => cart_items_module_1.CartItemsModule)
        ],
        controllers: [menu_item_variants_controller_1.MenuItemVariantsController],
        providers: [
            menu_item_variants_service_1.MenuItemVariantsService,
            menu_item_variants_repository_1.MenuItemVariantsRepository,
            menu_items_repository_1.MenuItemsRepository
        ],
        exports: [menu_item_variants_service_1.MenuItemVariantsService, menu_item_variants_repository_1.MenuItemVariantsRepository]
    })
], MenuItemVariantsModule);
//# sourceMappingURL=menu_item_variants.module.js.map