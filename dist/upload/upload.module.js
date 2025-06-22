"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadModule = void 0;
const common_1 = require("@nestjs/common");
const upload_service_1 = require("./upload.service");
const upload_controller_1 = require("./upload.controller");
const customers_module_1 = require("../customers/customers.module");
const drivers_module_1 = require("../drivers/drivers.module");
const restaurants_module_1 = require("../restaurants/restaurants.module");
const restaurants_service_1 = require("../restaurants/restaurants.service");
const drivers_service_1 = require("../drivers/drivers.service");
const customers_service_1 = require("../customers/customers.service");
const menu_items_module_1 = require("../menu_items/menu_items.module");
const menu_items_service_1 = require("../menu_items/menu_items.service");
const food_categories_module_1 = require("../food_categories/food_categories.module");
const menu_item_variants_module_1 = require("../menu_item_variants/menu_item_variants.module");
const orders_module_1 = require("../orders/orders.module");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const users_repository_1 = require("../users/users.repository");
const promotions_service_1 = require("../promotions/promotions.service");
const promotions_repository_1 = require("../promotions/promotions.repository");
const promotion_entity_1 = require("../promotions/entities/promotion.entity");
const address_book_entity_1 = require("../address_book/entities/address_book.entity");
const address_book_repository_1 = require("../address_book/address_book.repository");
const food_category_entity_1 = require("../food_categories/entities/food_category.entity");
const food_categories_repository_1 = require("../food_categories/food_categories.repository");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const restaurants_repository_1 = require("../restaurants/restaurants.repository");
const customer_entity_1 = require("../customers/entities/customer.entity");
const customers_repository_1 = require("../customers/customers.repository");
const driver_entity_1 = require("../drivers/entities/driver.entity");
const drivers_repository_1 = require("../drivers/drivers.repository");
const driver_progress_stages_service_1 = require("../driver_progress_stages/driver_progress_stages.service");
const driver_progress_stages_module_1 = require("../driver_progress_stages/driver_progress_stages.module");
const menu_item_entity_1 = require("../menu_items/entities/menu_item.entity");
const menu_item_variant_entity_1 = require("../menu_item_variants/entities/menu_item_variant.entity");
const menu_item_variants_repository_1 = require("../menu_item_variants/menu_item_variants.repository");
const menu_items_repository_1 = require("../menu_items/menu_items.repository");
const order_entity_1 = require("../orders/entities/order.entity");
const orders_repository_1 = require("../orders/orders.repository");
const customer_care_inquiry_entity_1 = require("../customer_cares_inquires/entities/customer_care_inquiry.entity");
const driver_progress_stage_entity_1 = require("../driver_progress_stages/entities/driver_progress_stage.entity");
const driver_progress_stages_repository_1 = require("../driver_progress_stages/driver_progress_stages.repository");
const jwt_1 = require("@nestjs/jwt");
const transactions_service_1 = require("../transactions/transactions.service");
const transaction_entity_1 = require("../transactions/entities/transaction.entity");
const fwallet_entity_1 = require("../fwallets/entities/fwallet.entity");
const fwallets_repository_1 = require("../fwallets/fwallets.repository");
const transactions_repository_1 = require("../transactions/transactions.repository");
const online_session_entity_1 = require("../online-sessions/entities/online-session.entity");
const online_sessions_service_1 = require("../online-sessions/online-sessions.service");
const online_session_repository_1 = require("../online-sessions/online-session.repository");
const driver_stats_record_entity_1 = require("../driver_stats_records/entities/driver_stats_record.entity");
const driver_stats_records_service_1 = require("../driver_stats_records/driver_stats_records.service");
const ratings_review_entity_1 = require("../ratings_reviews/entities/ratings_review.entity");
const ratings_reviews_repository_1 = require("../ratings_reviews/ratings_reviews.repository");
const finance_rules_service_1 = require("../finance_rules/finance_rules.service");
const finance_rules_repository_1 = require("../finance_rules/finance_rules.repository");
const finance_rule_entity_1 = require("../finance_rules/entities/finance_rule.entity");
const admin_entity_1 = require("../admin/entities/admin.entity");
const admin_repository_1 = require("../admin/admin.repository");
const admin_service_1 = require("../admin/admin.service");
const users_service_1 = require("../users/users.service");
const banned_account_entity_1 = require("../banned-account/entities/banned-account.entity");
const notification_entity_1 = require("../notifications/entities/notification.entity");
const notifications_repository_1 = require("../notifications/notifications.repository");
const redis_service_1 = require("../redis/redis.service");
const restaurants_gateway_1 = require("../restaurants/restaurants.gateway");
const socket_io_1 = require("socket.io");
const orders_service_1 = require("../orders/orders.service");
const cart_items_repository_1 = require("../cart_items/cart_items.repository");
const cart_item_entity_1 = require("../cart_items/entities/cart_item.entity");
const drivers_gateway_1 = require("../drivers/drivers.gateway");
let UploadModule = class UploadModule {
};
exports.UploadModule = UploadModule;
exports.UploadModule = UploadModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                promotion_entity_1.Promotion,
                address_book_entity_1.AddressBook,
                food_category_entity_1.FoodCategory,
                cart_item_entity_1.CartItem,
                restaurant_entity_1.Restaurant,
                customer_entity_1.Customer,
                notification_entity_1.Notification,
                banned_account_entity_1.BannedAccount,
                ratings_review_entity_1.RatingsReview,
                online_session_entity_1.OnlineSession,
                driver_entity_1.Driver,
                menu_item_entity_1.MenuItem,
                menu_item_variant_entity_1.MenuItemVariant,
                order_entity_1.Order,
                driver_progress_stage_entity_1.DriverProgressStage,
                customer_care_inquiry_entity_1.CustomerCareInquiry,
                finance_rule_entity_1.FinanceRule,
                admin_entity_1.Admin,
                transaction_entity_1.Transaction,
                driver_stats_record_entity_1.DriverStatsRecord,
                fwallet_entity_1.FWallet
            ]),
            customers_module_1.CustomersModule,
            drivers_module_1.DriversModule,
            restaurants_module_1.RestaurantsModule,
            menu_items_module_1.MenuItemsModule,
            food_categories_module_1.FoodCategoriesModule,
            menu_item_variants_module_1.MenuItemVariantsModule,
            driver_progress_stages_module_1.DriverProgressStagesModule,
            orders_module_1.OrdersModule
        ],
        controllers: [upload_controller_1.UploadController],
        providers: [
            redis_service_1.RedisService,
            upload_service_1.UploadService,
            restaurants_gateway_1.RestaurantsGateway,
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
            },
            restaurants_service_1.RestaurantsService,
            drivers_service_1.DriversService,
            jwt_1.JwtService,
            fwallets_repository_1.FWalletsRepository,
            driver_stats_records_service_1.DriverStatsService,
            ratings_reviews_repository_1.RatingsReviewsRepository,
            admin_repository_1.AdminRepository,
            finance_rules_service_1.FinanceRulesService,
            admin_service_1.AdminService,
            users_service_1.UsersService,
            finance_rules_repository_1.FinanceRulesRepository,
            transactions_repository_1.TransactionsRepository,
            online_sessions_service_1.OnlineSessionsService,
            online_session_repository_1.OnlineSessionsRepository,
            drivers_gateway_1.DriversGateway,
            menu_items_service_1.MenuItemsService,
            customers_service_1.CustomersService,
            users_repository_1.UserRepository,
            transactions_service_1.TransactionService,
            promotions_service_1.PromotionsService,
            promotions_repository_1.PromotionsRepository,
            notifications_repository_1.NotificationsRepository,
            address_book_repository_1.AddressBookRepository,
            food_categories_repository_1.FoodCategoriesRepository,
            driver_progress_stages_repository_1.DriverProgressStagesRepository,
            restaurants_repository_1.RestaurantsRepository,
            orders_service_1.OrdersService,
            cart_items_repository_1.CartItemsRepository,
            customers_repository_1.CustomersRepository,
            drivers_repository_1.DriversRepository,
            driver_progress_stages_service_1.DriverProgressStagesService,
            menu_items_repository_1.MenuItemsRepository,
            menu_item_variants_repository_1.MenuItemVariantsRepository,
            orders_repository_1.OrdersRepository
        ]
    })
], UploadModule);
//# sourceMappingURL=upload.module.js.map