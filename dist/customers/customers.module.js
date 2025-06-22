"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersModule = void 0;
const common_1 = require("@nestjs/common");
const customers_service_1 = require("./customers.service");
const customers_controller_1 = require("./customers.controller");
const customers_controller_fake_1 = require("./customers.controller.fake");
const user_entity_1 = require("../users/entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const cart_items_module_1 = require("../cart_items/cart_items.module");
const address_book_service_1 = require("../address_book/address_book.service");
const customers_gateway_1 = require("./customers.gateway");
const users_repository_1 = require("../users/users.repository");
const users_module_1 = require("../users/users.module");
const address_book_entity_1 = require("../address_book/entities/address_book.entity");
const address_book_module_1 = require("../address_book/address_book.module");
const address_book_repository_1 = require("../address_book/address_book.repository");
const food_category_entity_1 = require("../food_categories/entities/food_category.entity");
const food_categories_repository_1 = require("../food_categories/food_categories.repository");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const restaurants_module_1 = require("../restaurants/restaurants.module");
const restaurants_repository_1 = require("../restaurants/restaurants.repository");
const customer_entity_1 = require("./entities/customer.entity");
const customers_repository_1 = require("./customers.repository");
const cart_item_entity_1 = require("../cart_items/entities/cart_item.entity");
const cart_items_repository_1 = require("../cart_items/cart_items.repository");
const orders_repository_1 = require("../orders/orders.repository");
const order_entity_1 = require("../orders/entities/order.entity");
const jwt_1 = require("@nestjs/jwt");
const promotions_repository_1 = require("../promotions/promotions.repository");
const promotion_entity_1 = require("../promotions/entities/promotion.entity");
const notification_entity_1 = require("../notifications/entities/notification.entity");
const notifications_repository_1 = require("../notifications/notifications.repository");
const redis_service_1 = require("../redis/redis.service");
let CustomersModule = class CustomersModule {
};
exports.CustomersModule = CustomersModule;
exports.CustomersModule = CustomersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                address_book_entity_1.AddressBook,
                food_category_entity_1.FoodCategory,
                restaurant_entity_1.Restaurant,
                customer_entity_1.Customer,
                promotion_entity_1.Promotion,
                cart_item_entity_1.CartItem,
                notification_entity_1.Notification,
                order_entity_1.Order
            ]),
            (0, common_1.forwardRef)(() => cart_items_module_1.CartItemsModule),
            users_module_1.UsersModule,
            address_book_module_1.AddressBookModule,
            (0, common_1.forwardRef)(() => restaurants_module_1.RestaurantsModule)
        ],
        controllers: [customers_controller_1.CustomersController, customers_controller_fake_1.CustomersControllerFake],
        providers: [
            customers_service_1.CustomersService,
            address_book_service_1.AddressBookService,
            customers_gateway_1.CustomersGateway,
            users_repository_1.UserRepository,
            redis_service_1.RedisService,
            address_book_repository_1.AddressBookRepository,
            notifications_repository_1.NotificationsRepository,
            food_categories_repository_1.FoodCategoriesRepository,
            restaurants_repository_1.RestaurantsRepository,
            customers_repository_1.CustomersRepository,
            promotions_repository_1.PromotionsRepository,
            cart_items_repository_1.CartItemsRepository,
            orders_repository_1.OrdersRepository,
            jwt_1.JwtService
        ],
        exports: [customers_service_1.CustomersService, customers_gateway_1.CustomersGateway, customers_repository_1.CustomersRepository]
    })
], CustomersModule);
//# sourceMappingURL=customers.module.js.map