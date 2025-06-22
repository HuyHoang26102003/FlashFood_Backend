"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const jwt_strategy_1 = require("./jwt.strategy");
const auth_service_1 = require("./auth.service");
const customers_module_1 = require("../customers/customers.module");
const auth_controller_1 = require("./auth.controller");
const email_service_1 = require("../mailer/email.service");
const mailer_module_1 = require("../mailer/mailer.module");
const drivers_module_1 = require("../drivers/drivers.module");
const drivers_service_1 = require("../drivers/drivers.service");
const fwallets_service_1 = require("../fwallets/fwallets.service");
const fwallets_module_1 = require("../fwallets/fwallets.module");
const restaurants_module_1 = require("../restaurants/restaurants.module");
const restaurants_service_1 = require("../restaurants/restaurants.service");
const promotions_module_1 = require("../promotions/promotions.module");
const address_book_service_1 = require("../address_book/address_book.service");
const promotions_service_1 = require("../promotions/promotions.service");
const menu_items_service_1 = require("../menu_items/menu_items.service");
const menu_items_module_1 = require("../menu_items/menu_items.module");
const food_categories_module_1 = require("../food_categories/food_categories.module");
const menu_item_variants_service_1 = require("../menu_item_variants/menu_item_variants.service");
const menu_item_variants_module_1 = require("../menu_item_variants/menu_item_variants.module");
const cart_items_module_1 = require("../cart_items/cart_items.module");
const cart_items_service_1 = require("../cart_items/cart_items.service");
const orders_module_1 = require("../orders/orders.module");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const admin_entity_1 = require("../admin/entities/admin.entity");
const users_service_1 = require("../users/users.service");
const users_repository_1 = require("../users/users.repository");
const promotion_entity_1 = require("../promotions/entities/promotion.entity");
const address_book_entity_1 = require("../address_book/entities/address_book.entity");
const address_book_repository_1 = require("../address_book/address_book.repository");
const food_category_entity_1 = require("../food_categories/entities/food_category.entity");
const food_categories_repository_1 = require("../food_categories/food_categories.repository");
const fwallet_entity_1 = require("../fwallets/entities/fwallet.entity");
const fwallets_repository_1 = require("../fwallets/fwallets.repository");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const customers_repository_1 = require("../customers/customers.repository");
const driver_entity_1 = require("../drivers/entities/driver.entity");
const drivers_repository_1 = require("../drivers/drivers.repository");
const menu_item_variant_entity_1 = require("../menu_item_variants/entities/menu_item_variant.entity");
const menu_item_entity_1 = require("../menu_items/entities/menu_item.entity");
const menu_item_variants_repository_1 = require("../menu_item_variants/menu_item_variants.repository");
const menu_items_repository_1 = require("../menu_items/menu_items.repository");
const order_entity_1 = require("../orders/entities/order.entity");
const orders_repository_1 = require("../orders/orders.repository");
const cart_item_entity_1 = require("../cart_items/entities/cart_item.entity");
const cart_items_repository_1 = require("../cart_items/cart_items.repository");
const customer_cares_repository_1 = require("../customer_cares/customer_cares.repository");
const customer_care_entity_1 = require("../customer_cares/entities/customer_care.entity");
const transactions_service_1 = require("../transactions/transactions.service");
const transaction_entity_1 = require("../transactions/entities/transaction.entity");
const transactions_repository_1 = require("../transactions/transactions.repository");
const driver_progress_stage_entity_1 = require("../driver_progress_stages/entities/driver_progress_stage.entity");
const driver_progress_stages_repository_1 = require("../driver_progress_stages/driver_progress_stages.repository");
const online_session_repository_1 = require("../online-sessions/online-session.repository");
const online_sessions_service_1 = require("../online-sessions/online-sessions.service");
const online_session_entity_1 = require("../online-sessions/entities/online-session.entity");
const admin_service_1 = require("../admin/admin.service");
const admin_repository_1 = require("../admin/admin.repository");
const ratings_review_entity_1 = require("../ratings_reviews/entities/ratings_review.entity");
const ratings_reviews_repository_1 = require("../ratings_reviews/ratings_reviews.repository");
const driver_stats_record_entity_1 = require("../driver_stats_records/entities/driver_stats_record.entity");
const driver_stats_records_service_1 = require("../driver_stats_records/driver_stats_records.service");
const banned_account_entity_1 = require("../banned-account/entities/banned-account.entity");
const notification_entity_1 = require("../notifications/entities/notification.entity");
const notifications_repository_1 = require("../notifications/notifications.repository");
const socket_io_1 = require("socket.io");
const restaurants_gateway_1 = require("../restaurants/restaurants.gateway");
const finance_rules_service_1 = require("../finance_rules/finance_rules.service");
const finance_rule_entity_1 = require("../finance_rules/entities/finance_rule.entity");
const redis_service_1 = require("../redis/redis.service");
const finance_rules_repository_1 = require("../finance_rules/finance_rules.repository");
const orders_service_1 = require("../orders/orders.service");
const drivers_gateway_1 = require("../drivers/drivers.gateway");
const driver_progress_stages_service_1 = require("../driver_progress_stages/driver_progress_stages.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: '30d' }
            }),
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                admin_entity_1.Admin,
                promotion_entity_1.Promotion,
                notification_entity_1.Notification,
                address_book_entity_1.AddressBook,
                food_category_entity_1.FoodCategory,
                customer_entity_1.Customer,
                fwallet_entity_1.FWallet,
                driver_entity_1.Driver,
                ratings_review_entity_1.RatingsReview,
                finance_rule_entity_1.FinanceRule,
                driver_stats_record_entity_1.DriverStatsRecord,
                restaurant_entity_1.Restaurant,
                banned_account_entity_1.BannedAccount,
                menu_item_entity_1.MenuItem,
                online_session_entity_1.OnlineSession,
                transaction_entity_1.Transaction,
                driver_progress_stage_entity_1.DriverProgressStage,
                menu_item_variant_entity_1.MenuItemVariant,
                order_entity_1.Order,
                cart_item_entity_1.CartItem,
                customer_care_entity_1.CustomerCare
            ]),
            customers_module_1.CustomersModule,
            drivers_module_1.DriversModule,
            fwallets_module_1.FwalletsModule,
            restaurants_module_1.RestaurantsModule,
            promotions_module_1.PromotionsModule,
            menu_items_module_1.MenuItemsModule,
            menu_item_variants_module_1.MenuItemVariantsModule,
            cart_items_module_1.CartItemsModule,
            food_categories_module_1.FoodCategoriesModule,
            mailer_module_1.MailerCustomModule,
            orders_module_1.OrdersModule
        ],
        providers: [
            auth_service_1.AuthService,
            email_service_1.EmailService,
            jwt_strategy_1.JwtStrategy,
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
            restaurants_gateway_1.RestaurantsGateway,
            finance_rules_service_1.FinanceRulesService,
            redis_service_1.RedisService,
            email_service_1.EmailService,
            finance_rules_repository_1.FinanceRulesRepository,
            orders_service_1.OrdersService,
            drivers_gateway_1.DriversGateway,
            driver_progress_stages_service_1.DriverProgressStagesService,
            driver_stats_records_service_1.DriverStatsService,
            users_service_1.UsersService,
            driver_progress_stages_repository_1.DriverProgressStagesRepository,
            online_session_repository_1.OnlineSessionsRepository,
            online_sessions_service_1.OnlineSessionsService,
            notifications_repository_1.NotificationsRepository,
            transactions_repository_1.TransactionsRepository,
            drivers_service_1.DriversService,
            fwallets_service_1.FWalletService,
            restaurants_service_1.RestaurantsService,
            address_book_service_1.AddressBookService,
            cart_items_service_1.CartItemsService,
            ratings_reviews_repository_1.RatingsReviewsRepository,
            promotions_service_1.PromotionsService,
            menu_items_service_1.MenuItemsService,
            admin_repository_1.AdminRepository,
            admin_service_1.AdminService,
            menu_item_variants_service_1.MenuItemVariantsService,
            users_repository_1.UserRepository,
            address_book_repository_1.AddressBookRepository,
            food_categories_repository_1.FoodCategoriesRepository,
            fwallets_repository_1.FWalletsRepository,
            drivers_repository_1.DriversRepository,
            transactions_service_1.TransactionService,
            customers_repository_1.CustomersRepository,
            menu_items_repository_1.MenuItemsRepository,
            menu_item_variants_repository_1.MenuItemVariantsRepository,
            orders_repository_1.OrdersRepository,
            cart_items_repository_1.CartItemsRepository,
            customer_cares_repository_1.CustomerCaresRepository
        ],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService, email_service_1.EmailService]
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map