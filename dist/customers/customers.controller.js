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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const customers_service_1 = require("./customers.service");
const create_customer_dto_1 = require("./dto/create-customer.dto");
const update_customer_dto_1 = require("./dto/update-customer.dto");
const cart_items_service_1 = require("../cart_items/cart_items.service");
const create_cart_item_dto_1 = require("../cart_items/dto/create-cart_item.dto");
const update_cart_item_dto_1 = require("../cart_items/dto/update-cart_item.dto");
const address_book_service_1 = require("../address_book/address_book.service");
const create_address_book_dto_1 = require("../address_book/dto/create-address_book.dto");
let CustomersController = class CustomersController {
    constructor(customersService, cartItemService, addressBookService) {
        this.customersService = customersService;
        this.cartItemService = cartItemService;
        this.addressBookService = addressBookService;
    }
    create(createCustomerDto) {
        return this.customersService.create(createCustomerDto);
    }
    findAll() {
        return this.customersService.findAll();
    }
    findAllPaginated(page = '1', limit = '10') {
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        return this.customersService.findAllPaginated(parsedPage, parsedLimit);
    }
    getAllRestaurants(id) {
        return this.customersService.getAllRestaurants(id);
    }
    searchRestaurants(keyword, page = 1, limit = 10) {
        if (!keyword) {
            return {
                status: 'BadRequest',
                data: null,
                message: 'Keyword is required'
            };
        }
        return this.customersService.searchRestaurantsByKeyword(keyword, page, limit);
    }
    getFavoriteRestaurants(customerId) {
        return this.customersService.getFavoriteRestaurants(customerId);
    }
    getAllOrders(id) {
        return this.customersService.getAllOrders(id);
    }
    findAllCartItemByCustomerId(customerId) {
        return this.cartItemService.findAll({ customer_id: customerId });
    }
    getNotifications(customerId) {
        return this.customersService.getNotifications(customerId);
    }
    findCustomerById(id) {
        return this.customersService.findCustomerById(id);
    }
    findOne(field, value) {
        return this.customersService.findOne({ [field]: value });
    }
    toggleFavoriteRestaurant(id, toggleDto) {
        return this.customersService.toggleFavoriteRestaurant(id, toggleDto);
    }
    togglePreferredCategory(id, preferred_category) {
        return this.customersService.update(id, preferred_category);
    }
    updateCartItem(customer_id, cart_item_id, cart_item) {
        return this.cartItemService.update(cart_item_id, {
            ...cart_item,
            customer_id: customer_id
        });
    }
    addAddress(customerId, createAddressBookDto) {
        return this.addressBookService.create(createAddressBookDto, customerId);
    }
    createCartItem(customerId, createCartItemDto) {
        return this.cartItemService.create({
            ...createCartItemDto,
            customer_id: customerId
        });
    }
    deleteCartItem(cartItemId) {
        return this.cartItemService.remove(cartItemId);
    }
    updateAddress(customerId, addressbookId) {
        return this.addressBookService.toggleCustomerAddress(customerId, addressbookId);
    }
    update(id, updateCustomerDto) {
        return this.customersService.update(id, updateCustomerDto);
    }
    remove(id) {
        return this.customersService.remove(id);
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_dto_1.CreateCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('paginated'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "findAllPaginated", null);
__decorate([
    (0, common_1.Get)('/restaurants/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "getAllRestaurants", null);
__decorate([
    (0, common_1.Get)('/search-restaurants'),
    __param(0, (0, common_1.Query)('keyword')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "searchRestaurants", null);
__decorate([
    (0, common_1.Get)('/favorite-restaurants/:customerId'),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "getFavoriteRestaurants", null);
__decorate([
    (0, common_1.Get)('/orders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Get)('/cart-items/:customerId'),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "findAllCartItemByCustomerId", null);
__decorate([
    (0, common_1.Get)('/notifications/:customerId'),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "findCustomerById", null);
__decorate([
    (0, common_1.Get)(':field/:value'),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Param)('value')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('/favorite-restaurant/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_customer_dto_1.ToggleCustomerFavoriteRestaurantDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "toggleFavoriteRestaurant", null);
__decorate([
    (0, common_1.Patch)('/preferred-category/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_customer_dto_1.UpdateCustomerPreferredCategoryDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "togglePreferredCategory", null);
__decorate([
    (0, common_1.Patch)('/cart-items/:customerId/:cartItemId'),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Param)('cartItemId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_cart_item_dto_1.UpdateCartItemDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "updateCartItem", null);
__decorate([
    (0, common_1.Post)('/address/:id/'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_address_book_dto_1.CreateAddressBookDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "addAddress", null);
__decorate([
    (0, common_1.Post)('/cart-items/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_cart_item_dto_1.CreateCartItemDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "createCartItem", null);
__decorate([
    (0, common_1.Delete)('/cart-items/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "deleteCartItem", null);
__decorate([
    (0, common_1.Patch)('/address/:id/:addressbookId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('addressbookId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "updateAddress", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_customer_dto_1.UpdateCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "remove", null);
exports.CustomersController = CustomersController = __decorate([
    (0, common_1.Controller)('customers'),
    __metadata("design:paramtypes", [customers_service_1.CustomersService,
        cart_items_service_1.CartItemsService,
        address_book_service_1.AddressBookService])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map