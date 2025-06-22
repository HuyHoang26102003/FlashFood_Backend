"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressBookModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const address_book_service_1 = require("./address_book.service");
const address_book_controller_1 = require("./address_book.controller");
const address_book_entity_1 = require("./entities/address_book.entity");
const address_book_repository_1 = require("./address_book.repository");
const customer_entity_1 = require("../customers/entities/customer.entity");
const customers_repository_1 = require("../customers/customers.repository");
const food_category_entity_1 = require("../food_categories/entities/food_category.entity");
const food_categories_repository_1 = require("../food_categories/food_categories.repository");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const restaurants_repository_1 = require("../restaurants/restaurants.repository");
const user_entity_1 = require("../users/entities/user.entity");
const users_repository_1 = require("../users/users.repository");
let AddressBookModule = class AddressBookModule {
};
exports.AddressBookModule = AddressBookModule;
exports.AddressBookModule = AddressBookModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                address_book_entity_1.AddressBook,
                customer_entity_1.Customer,
                food_category_entity_1.FoodCategory,
                restaurant_entity_1.Restaurant,
                user_entity_1.User
            ])
        ],
        controllers: [address_book_controller_1.AddressBookController],
        providers: [
            address_book_service_1.AddressBookService,
            address_book_repository_1.AddressBookRepository,
            customers_repository_1.CustomersRepository,
            food_categories_repository_1.FoodCategoriesRepository,
            restaurants_repository_1.RestaurantsRepository,
            users_repository_1.UserRepository
        ],
        exports: [address_book_service_1.AddressBookService]
    })
], AddressBookModule);
//# sourceMappingURL=address_book.module.js.map