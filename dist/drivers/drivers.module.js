"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriversModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const drivers_service_1 = require("./drivers.service");
const drivers_controller_1 = require("./drivers.controller");
const driver_entity_1 = require("./entities/driver.entity");
const drivers_repository_1 = require("./drivers.repository");
const address_book_repository_1 = require("../address_book/address_book.repository");
const restaurants_module_1 = require("../restaurants/restaurants.module");
const orders_module_1 = require("../orders/orders.module");
const driver_progress_stages_module_1 = require("../driver_progress_stages/driver_progress_stages.module");
const address_book_entity_1 = require("../address_book/entities/address_book.entity");
const orders_repository_1 = require("../orders/orders.repository");
const order_entity_1 = require("../orders/entities/order.entity");
const jwt_1 = require("@nestjs/jwt");
const promotions_repository_1 = require("../promotions/promotions.repository");
const promotion_entity_1 = require("../promotions/entities/promotion.entity");
const driver_progress_stage_entity_1 = require("../driver_progress_stages/entities/driver_progress_stage.entity");
const driver_progress_stages_repository_1 = require("../driver_progress_stages/driver_progress_stages.repository");
const online_session_entity_1 = require("../online-sessions/entities/online-session.entity");
const online_session_repository_1 = require("../online-sessions/online-session.repository");
const online_sessions_service_1 = require("../online-sessions/online-sessions.service");
const driver_stats_records_service_1 = require("../driver_stats_records/driver_stats_records.service");
const driver_stats_record_entity_1 = require("../driver_stats_records/entities/driver_stats_record.entity");
const ratings_review_entity_1 = require("../ratings_reviews/entities/ratings_review.entity");
const ratings_reviews_repository_1 = require("../ratings_reviews/ratings_reviews.repository");
const finance_rules_repository_1 = require("../finance_rules/finance_rules.repository");
const finance_rule_entity_1 = require("../finance_rules/entities/finance_rule.entity");
const finance_rules_service_1 = require("../finance_rules/finance_rules.service");
const admin_repository_1 = require("../admin/admin.repository");
const admin_entity_1 = require("../admin/entities/admin.entity");
const fwallet_entity_1 = require("../fwallets/entities/fwallet.entity");
const fwallets_repository_1 = require("../fwallets/fwallets.repository");
const transactions_service_1 = require("../transactions/transactions.service");
const transaction_entity_1 = require("../transactions/entities/transaction.entity");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const transactions_repository_1 = require("../transactions/transactions.repository");
const users_repository_1 = require("../users/users.repository");
const user_entity_1 = require("../users/entities/user.entity");
const socket_io_1 = require("socket.io");
const redis_service_1 = require("../redis/redis.service");
const restaurants_service_1 = require("../restaurants/restaurants.service");
const menu_item_entity_1 = require("../menu_items/entities/menu_item.entity");
const menu_items_repository_1 = require("../menu_items/menu_items.repository");
const menu_items_service_1 = require("../menu_items/menu_items.service");
const menu_item_variants_repository_1 = require("../menu_item_variants/menu_item_variants.repository");
const menu_item_variants_service_1 = require("../menu_item_variants/menu_item_variants.service");
const menu_item_variant_entity_1 = require("../menu_item_variants/entities/menu_item_variant.entity");
const restaurants_gateway_1 = require("../restaurants/restaurants.gateway");
const food_category_entity_1 = require("../food_categories/entities/food_category.entity");
const food_categories_repository_1 = require("../food_categories/food_categories.repository");
let DriversModule = class DriversModule {
};
exports.DriversModule = DriversModule;
exports.DriversModule = DriversModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                driver_entity_1.Driver,
                address_book_entity_1.AddressBook,
                order_entity_1.Order,
                promotion_entity_1.Promotion,
                driver_progress_stage_entity_1.DriverProgressStage,
                menu_item_entity_1.MenuItem,
                admin_entity_1.Admin,
                online_session_entity_1.OnlineSession,
                transaction_entity_1.Transaction,
                restaurant_entity_1.Restaurant,
                customer_entity_1.Customer,
                finance_rule_entity_1.FinanceRule,
                user_entity_1.User,
                food_category_entity_1.FoodCategory,
                fwallet_entity_1.FWallet,
                driver_stats_record_entity_1.DriverStatsRecord,
                menu_item_variant_entity_1.MenuItemVariant,
                ratings_review_entity_1.RatingsReview
            ]),
            (0, common_1.forwardRef)(() => restaurants_module_1.RestaurantsModule),
            (0, common_1.forwardRef)(() => orders_module_1.OrdersModule),
            driver_progress_stages_module_1.DriverProgressStagesModule
        ],
        controllers: [drivers_controller_1.DriversController],
        providers: [
            redis_service_1.RedisService,
            drivers_service_1.DriversService,
            orders_repository_1.OrdersRepository,
            fwallets_repository_1.FWalletsRepository,
            restaurants_gateway_1.RestaurantsGateway,
            transactions_service_1.TransactionService,
            restaurants_service_1.RestaurantsService,
            food_categories_repository_1.FoodCategoriesRepository,
            drivers_repository_1.DriversRepository,
            transactions_repository_1.TransactionsRepository,
            users_repository_1.UserRepository,
            online_sessions_service_1.OnlineSessionsService,
            ratings_reviews_repository_1.RatingsReviewsRepository,
            menu_items_repository_1.MenuItemsRepository,
            menu_items_service_1.MenuItemsService,
            menu_item_variants_repository_1.MenuItemVariantsRepository,
            menu_item_variants_service_1.MenuItemVariantsService,
            online_session_repository_1.OnlineSessionsRepository,
            finance_rules_repository_1.FinanceRulesRepository,
            finance_rules_service_1.FinanceRulesService,
            admin_repository_1.AdminRepository,
            address_book_repository_1.AddressBookRepository,
            driver_progress_stages_repository_1.DriverProgressStagesRepository,
            promotions_repository_1.PromotionsRepository,
            jwt_1.JwtService,
            driver_stats_records_service_1.DriverStatsService,
            {
                provide: 'SOCKET_SERVER',
                useFactory: () => {
                    const io = new socket_io_1.Server({
                        cors: {
                            origin: ['http://localhost:3000', 'http://localhost:1310'],
                            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                            credentials: true,
                            allowedHeaders: ['Authorization', 'auth', 'Content-Type']
                        },
                        transports: ['websocket', 'polling']
                    });
                    return io;
                }
            }
        ],
        exports: [drivers_service_1.DriversService, drivers_repository_1.DriversRepository, driver_stats_records_service_1.DriverStatsService]
    })
], DriversModule);
//# sourceMappingURL=drivers.module.js.map