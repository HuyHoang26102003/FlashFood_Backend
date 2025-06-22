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
exports.RestaurantsController = void 0;
const common_1 = require("@nestjs/common");
const restaurants_service_1 = require("./restaurants.service");
const create_restaurant_dto_1 = require("./dto/create-restaurant.dto");
const update_restaurant_dto_1 = require("./dto/update-restaurant.dto");
const update_menu_item_dto_1 = require("../menu_items/dto/update-menu_item.dto");
const create_menu_item_dto_1 = require("../menu_items/dto/create-menu_item.dto");
const create_menu_item_variant_dto_1 = require("../menu_item_variants/dto/create-menu_item_variant.dto");
const update_menu_item_variant_dto_1 = require("../menu_item_variants/dto/update-menu_item_variant.dto");
const restaurant_availability_dto_1 = require("./dto/restaurant-availability.dto");
const orders_service_1 = require("../orders/orders.service");
let RestaurantsController = class RestaurantsController {
    constructor(restaurantsService, ordersService) {
        this.restaurantsService = restaurantsService;
        this.ordersService = ordersService;
    }
    create(createRestaurantDto) {
        return this.restaurantsService.create(createRestaurantDto);
    }
    applyPromotion(restaurantId, promotionId) {
        return this.restaurantsService.applyPromotion(restaurantId, promotionId);
    }
    async acceptOrder(orderId, restaurantId) {
        return this.ordersService.restaurantAcceptOrder(orderId, restaurantId);
    }
    clearRedis() {
        return this.restaurantsService.clearRedis();
    }
    findAll() {
        return this.restaurantsService.findAll();
    }
    findAllPaginated(page = '1', limit = '10') {
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        return this.restaurantsService.findAllPaginated(parsedPage, parsedLimit);
    }
    async findOne(id) {
        return this.restaurantsService.findOne(id);
    }
    async getRestaurantRatingsReviews(id) {
        return this.restaurantsService.getRestaurantRatingsReviews(id);
    }
    update(id, updateRestaurantDto) {
        return this.restaurantsService.update(id, updateRestaurantDto);
    }
    remove(id) {
        return this.restaurantsService.remove(id);
    }
    createMenuItem(restaurantId, createMenuItemDto) {
        return this.restaurantsService.createMenuItemForRestaurant(restaurantId, createMenuItemDto);
    }
    getMenuItemsForRestaurant(restaurantId) {
        return this.restaurantsService.getMenuItemsForRestaurant(restaurantId);
    }
    findOneMenuItem(restaurantId, id) {
        return this.restaurantsService.findOne(id);
    }
    updateMenuItem(restaurantId, id, updateMenuItemDto) {
        return this.restaurantsService.updateMenuItemForRestaurant(restaurantId, id, updateMenuItemDto);
    }
    toggleAvailability(id, toggleDto) {
        return this.restaurantsService.toggleAvailability(id, toggleDto);
    }
    removeMenuItem(restaurantId, id) {
        return this.restaurantsService.deleteMenuItemForRestaurant(restaurantId, id);
    }
    createMenuItemVariant(variantId, createMenuItemVariantDto) {
        return this.restaurantsService.createMenuItemVariantForRestaurant(variantId, createMenuItemVariantDto);
    }
    updateMenuItemVariant(variantId, updateMenuItemVariantDto) {
        return this.restaurantsService.updateMenuItemVariantForRestaurant(variantId, updateMenuItemVariantDto);
    }
    removeMenuItemVariantForRestaurant(variantId) {
        return this.restaurantsService.deleteMenuItemVariantForRestaurant(variantId);
    }
    getRestaurantOrders(restaurantId, page = '1', limit = '10') {
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        return this.restaurantsService.getRestaurantOrders(restaurantId, parsedPage, parsedLimit);
    }
};
exports.RestaurantsController = RestaurantsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_restaurant_dto_1.CreateRestaurantDto]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('apply-promotion'),
    __param(0, (0, common_1.Body)('restaurantId')),
    __param(1, (0, common_1.Body)('promotionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "applyPromotion", null);
__decorate([
    (0, common_1.Post)('/accept-order/:orderId/:restaurantId'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "acceptOrder", null);
__decorate([
    (0, common_1.Post)('clear-redis'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "clearRedis", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('paginated'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "findAllPaginated", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/ratings-reviews'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "getRestaurantRatingsReviews", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_restaurant_dto_1.UpdateRestaurantDto]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('/menu-items/:restaurantId'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_menu_item_dto_1.CreateMenuItemDto]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "createMenuItem", null);
__decorate([
    (0, common_1.Get)('/menu-items/:restaurantId'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "getMenuItemsForRestaurant", null);
__decorate([
    (0, common_1.Get)('/menu-items/:restaurantId/:id'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "findOneMenuItem", null);
__decorate([
    (0, common_1.Patch)('/menu-items/:restaurantId/:id'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_menu_item_dto_1.UpdateMenuItemDto]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "updateMenuItem", null);
__decorate([
    (0, common_1.Patch)(':id/availability'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, restaurant_availability_dto_1.ToggleRestaurantAvailabilityDto]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "toggleAvailability", null);
__decorate([
    (0, common_1.Delete)('/menu-items/:restaurantId/:id'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "removeMenuItem", null);
__decorate([
    (0, common_1.Post)('/menu-item-variants/:variantId'),
    __param(0, (0, common_1.Param)('variantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_menu_item_variant_dto_1.CreateMenuItemVariantDto]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "createMenuItemVariant", null);
__decorate([
    (0, common_1.Patch)('/menu-item-variants/:variantId'),
    __param(0, (0, common_1.Param)('variantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_menu_item_variant_dto_1.UpdateMenuItemVariantDto]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "updateMenuItemVariant", null);
__decorate([
    (0, common_1.Delete)('/menu-item-variants/:variantId'),
    __param(0, (0, common_1.Param)('variantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "removeMenuItemVariantForRestaurant", null);
__decorate([
    (0, common_1.Get)(':restaurantId/orders'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], RestaurantsController.prototype, "getRestaurantOrders", null);
exports.RestaurantsController = RestaurantsController = __decorate([
    (0, common_1.Controller)('restaurants'),
    __metadata("design:paramtypes", [restaurants_service_1.RestaurantsService,
        orders_service_1.OrdersService])
], RestaurantsController);
//# sourceMappingURL=restaurants.controller.js.map