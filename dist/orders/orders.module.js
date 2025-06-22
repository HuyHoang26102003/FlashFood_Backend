"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const orders_service_1 = require("./orders.service");
const orders_controller_1 = require("./orders.controller");
const order_entity_1 = require("./entities/order.entity");
const orders_repository_1 = require("./orders.repository");
const menu_items_repository_1 = require("../menu_items/menu_items.repository");
const menu_item_variants_repository_1 = require("../menu_item_variants/menu_item_variants.repository");
const menu_item_entity_1 = require("../menu_items/entities/menu_item.entity");
const menu_item_variant_entity_1 = require("../menu_item_variants/entities/menu_item_variant.entity");
const address_book_entity_1 = require("../address_book/entities/address_book.entity");
const address_book_repository_1 = require("../address_book/address_book.repository");
const customer_entity_1 = require("../customers/entities/customer.entity");
const customers_repository_1 = require("../customers/customers.repository");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const restaurants_repository_1 = require("../restaurants/restaurants.repository");
const food_categories_repository_1 = require("../food_categories/food_categories.repository");
const food_category_entity_1 = require("../food_categories/entities/food_category.entity");
const driver_entity_1 = require("../drivers/entities/driver.entity");
const restaurants_service_1 = require("../restaurants/restaurants.service");
const drivers_service_1 = require("../drivers/drivers.service");
const user_entity_1 = require("../users/entities/user.entity");
const users_repository_1 = require("../users/users.repository");
const promotion_entity_1 = require("../promotions/entities/promotion.entity");
const promotions_repository_1 = require("../promotions/promotions.repository");
const menu_items_service_1 = require("../menu_items/menu_items.service");
const menu_item_variants_service_1 = require("../menu_item_variants/menu_item_variants.service");
const drivers_repository_1 = require("../drivers/drivers.repository");
const driver_progress_stages_service_1 = require("../driver_progress_stages/driver_progress_stages.service");
const driver_progress_stage_entity_1 = require("../driver_progress_stages/entities/driver_progress_stage.entity");
const driver_progress_stages_repository_1 = require("../driver_progress_stages/driver_progress_stages.repository");
const cart_item_entity_1 = require("../cart_items/entities/cart_item.entity");
const cart_items_repository_1 = require("../cart_items/cart_items.repository");
const drivers_module_1 = require("../drivers/drivers.module");
const customers_gateway_1 = require("../customers/customers.gateway");
const customers_service_1 = require("../customers/customers.service");
const jwt_1 = require("@nestjs/jwt");
const transactions_repository_1 = require("../transactions/transactions.repository");
const transaction_entity_1 = require("../transactions/entities/transaction.entity");
const fwallets_repository_1 = require("../fwallets/fwallets.repository");
const transactions_service_1 = require("../transactions/transactions.service");
const fwallet_entity_1 = require("../fwallets/entities/fwallet.entity");
const online_session_entity_1 = require("../online-sessions/entities/online-session.entity");
const online_sessions_service_1 = require("../online-sessions/online-sessions.service");
const online_session_repository_1 = require("../online-sessions/online-session.repository");
const finance_rule_entity_1 = require("../finance_rules/entities/finance_rule.entity");
const finance_rules_service_1 = require("../finance_rules/finance_rules.service");
const finance_rules_repository_1 = require("../finance_rules/finance_rules.repository");
const admin_repository_1 = require("../admin/admin.repository");
const admin_entity_1 = require("../admin/entities/admin.entity");
const driver_stats_records_service_1 = require("../driver_stats_records/driver_stats_records.service");
const driver_stats_record_entity_1 = require("../driver_stats_records/entities/driver_stats_record.entity");
const ratings_review_entity_1 = require("../ratings_reviews/entities/ratings_review.entity");
const ratings_reviews_repository_1 = require("../ratings_reviews/ratings_reviews.repository");
const notifications_repository_1 = require("../notifications/notifications.repository");
const notification_entity_1 = require("../notifications/entities/notification.entity");
const redis_service_1 = require("../redis/redis.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const drivers_gateway_1 = require("../drivers/drivers.gateway");
const restaurants_gateway_1 = require("../restaurants/restaurants.gateway");
const socket_io_1 = require("socket.io");
const transactions_module_1 = require("../transactions/transactions.module");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                order_entity_1.Order,
                menu_item_entity_1.MenuItem,
                finance_rule_entity_1.FinanceRule,
                menu_item_variant_entity_1.MenuItemVariant,
                address_book_entity_1.AddressBook,
                driver_stats_record_entity_1.DriverStatsRecord,
                ratings_review_entity_1.RatingsReview,
                restaurant_entity_1.Restaurant,
                customer_entity_1.Customer,
                transaction_entity_1.Transaction,
                food_category_entity_1.FoodCategory,
                notification_entity_1.Notification,
                driver_entity_1.Driver,
                user_entity_1.User,
                online_session_entity_1.OnlineSession,
                admin_entity_1.Admin,
                promotion_entity_1.Promotion,
                driver_progress_stage_entity_1.DriverProgressStage,
                fwallet_entity_1.FWallet,
                cart_item_entity_1.CartItem
            ]),
            (0, common_1.forwardRef)(() => drivers_module_1.DriversModule),
            (0, common_1.forwardRef)(() => transactions_module_1.TransactionsModule)
        ],
        controllers: [orders_controller_1.OrdersController],
        providers: [
            redis_service_1.RedisService,
            orders_service_1.OrdersService,
            orders_repository_1.OrdersRepository,
            notifications_repository_1.NotificationsRepository,
            menu_items_repository_1.MenuItemsRepository,
            menu_item_variants_repository_1.MenuItemVariantsRepository,
            online_session_repository_1.OnlineSessionsRepository,
            address_book_repository_1.AddressBookRepository,
            ratings_reviews_repository_1.RatingsReviewsRepository,
            customers_repository_1.CustomersRepository,
            online_sessions_service_1.OnlineSessionsService,
            finance_rules_service_1.FinanceRulesService,
            finance_rules_repository_1.FinanceRulesRepository,
            driver_stats_records_service_1.DriverStatsService,
            admin_repository_1.AdminRepository,
            restaurants_repository_1.RestaurantsRepository,
            food_categories_repository_1.FoodCategoriesRepository,
            restaurants_service_1.RestaurantsService,
            drivers_service_1.DriversService,
            users_repository_1.UserRepository,
            customers_service_1.CustomersService,
            drivers_repository_1.DriversRepository,
            promotions_repository_1.PromotionsRepository,
            menu_items_service_1.MenuItemsService,
            driver_progress_stages_service_1.DriverProgressStagesService,
            menu_item_variants_service_1.MenuItemVariantsService,
            driver_progress_stages_repository_1.DriverProgressStagesRepository,
            cart_items_repository_1.CartItemsRepository,
            fwallets_repository_1.FWalletsRepository,
            transactions_service_1.TransactionService,
            customers_gateway_1.CustomersGateway,
            drivers_gateway_1.DriversGateway,
            restaurants_gateway_1.RestaurantsGateway,
            transactions_repository_1.TransactionsRepository,
            jwt_1.JwtService,
            event_emitter_1.EventEmitter2,
            {
                provide: 'SOCKET_SERVER',
                useFactory: () => {
                    const io = new socket_io_1.Server({
                        cors: {
                            origin: '*',
                            methods: ['GET', 'POST']
                        }
                    });
                    return io;
                }
            }
        ],
        exports: [orders_service_1.OrdersService, orders_repository_1.OrdersRepository]
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map