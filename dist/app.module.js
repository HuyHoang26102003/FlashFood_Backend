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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const address_book_module_1 = require("./address_book/address_book.module");
const customers_module_1 = require("./customers/customers.module");
const drivers_module_1 = require("./drivers/drivers.module");
const upload_module_1 = require("./upload/upload.module");
const auth_module_1 = require("./auth/auth.module");
const email_service_1 = require("./mailer/email.service");
const mailer_module_1 = require("./mailer/mailer.module");
const fwallets_module_1 = require("./fwallets/fwallets.module");
const transactions_module_1 = require("./transactions/transactions.module");
const food_categories_module_1 = require("./food_categories/food_categories.module");
const promotions_module_1 = require("./promotions/promotions.module");
const restaurants_module_1 = require("./restaurants/restaurants.module");
const menu_items_module_1 = require("./menu_items/menu_items.module");
const menu_item_variants_module_1 = require("./menu_item_variants/menu_item_variants.module");
const cart_items_module_1 = require("./cart_items/cart_items.module");
const orders_module_1 = require("./orders/orders.module");
const ratings_reviews_module_1 = require("./ratings_reviews/ratings_reviews.module");
const admin_module_1 = require("./admin/admin.module");
const customer_cares_module_1 = require("./customer_cares/customer_cares.module");
const finance_admin_module_1 = require("./admin/finance_admin/finance_admin.module");
const event_emitter_1 = require("@nestjs/event-emitter");
const driver_progress_stages_module_1 = require("./driver_progress_stages/driver_progress_stages.module");
const companion_admin_module_1 = require("./admin/companion_admin/companion_admin.module");
const typeorm_1 = require("@nestjs/typeorm");
const users_module_1 = require("./users/users.module");
const fchat_module_1 = require("./FChat/fchat.module");
const penalties_module_1 = require("./penalties/penalties.module");
const online_sessions_module_1 = require("./online-sessions/online-sessions.module");
const penalty_rules_module_1 = require("./penalty-rules/penalty-rules.module");
const finance_rules_module_1 = require("./finance_rules/finance_rules.module");
const faq_module_1 = require("./faq/faq.module");
const driver_stats_records_module_1 = require("./driver_stats_records/driver_stats_records.module");
const banned_account_module_1 = require("./banned-account/banned-account.module");
const jwt_1 = require("@nestjs/jwt");
const notifications_module_1 = require("./notifications/notifications.module");
const redis_service_1 = require("./redis/redis.service");
const restaurants_gateway_1 = require("./restaurants/restaurants.gateway");
const drivers_gateway_1 = require("./drivers/drivers.gateway");
const socket_io_1 = require("socket.io");
const restaurants_service_1 = require("./restaurants/restaurants.service");
const drivers_service_1 = require("./drivers/drivers.service");
const drivers_repository_1 = require("./drivers/drivers.repository");
const driver_stats_records_service_1 = require("./driver_stats_records/driver_stats_records.service");
const event_emitter_2 = require("@nestjs/event-emitter");
const finance_rules_service_1 = require("./finance_rules/finance_rules.service");
const fwallets_repository_1 = require("./fwallets/fwallets.repository");
const transactions_service_1 = require("./transactions/transactions.service");
const driver_progress_stages_service_1 = require("./driver_progress_stages/driver_progress_stages.service");
const address_book_repository_1 = require("./address_book/address_book.repository");
const food_category_entity_1 = require("./food_categories/entities/food_category.entity");
const food_categories_repository_1 = require("./food_categories/food_categories.repository");
const driver_entity_1 = require("./drivers/entities/driver.entity");
const online_session_entity_1 = require("./online-sessions/entities/online-session.entity");
const online_sessions_service_1 = require("./online-sessions/online-sessions.service");
const order_entity_1 = require("./orders/entities/order.entity");
const driver_stats_record_entity_1 = require("./driver_stats_records/entities/driver_stats_record.entity");
const driver_progress_stage_entity_1 = require("./driver_progress_stages/entities/driver_progress_stage.entity");
const ratings_review_entity_1 = require("./ratings_reviews/entities/ratings_review.entity");
const finance_rule_entity_1 = require("./finance_rules/entities/finance_rule.entity");
const finance_rules_repository_1 = require("./finance_rules/finance_rules.repository");
const fwallet_entity_1 = require("./fwallets/entities/fwallet.entity");
const transaction_entity_1 = require("./transactions/entities/transaction.entity");
const online_session_repository_1 = require("./online-sessions/online-session.repository");
const address_book_entity_1 = require("./address_book/entities/address_book.entity");
const customers_gateway_1 = require("./customers/customers.gateway");
const customer_cares_inquires_module_1 = require("./customer_cares_inquires/customer_cares_inquires.module");
const customer_care_inquiry_entity_1 = require("./customer_cares_inquires/entities/customer_care_inquiry.entity");
const restaurant_stats_records_module_1 = require("./restaurant_stats_records/restaurant_stats_records.module");
const orders_service_1 = require("./orders/orders.service");
const admin_chart_module_1 = require("./admin_chart/admin_chart.module");
let AppModule = class AppModule {
    constructor() {
        console.log('NEON_HOST:', process.env.NEON_HOST);
        console.log('NEON_PORT:', process.env.NEON_PORT);
        console.log('NEON_USER:', process.env.NEON_USER);
        console.log('NEON_PASSWORD:', process.env.NEON_PASSWORD ? '***' : 'undefined');
        console.log('NEON_DATABASE:', process.env.NEON_DATABASE);
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'default-secret',
                signOptions: { expiresIn: '30d' },
                global: true
            }),
            event_emitter_1.EventEmitterModule.forRoot({
                wildcard: false,
                delimiter: '.',
                newListener: false,
                removeListener: false,
                maxListeners: 10,
                verboseMemoryLeak: true
            }),
            typeorm_1.TypeOrmModule.forFeature([
                food_category_entity_1.FoodCategory,
                driver_entity_1.Driver,
                online_session_entity_1.OnlineSession,
                customer_care_inquiry_entity_1.CustomerCareInquiry,
                order_entity_1.Order,
                driver_stats_record_entity_1.DriverStatsRecord,
                driver_progress_stage_entity_1.DriverProgressStage,
                ratings_review_entity_1.RatingsReview,
                address_book_entity_1.AddressBook,
                finance_rule_entity_1.FinanceRule,
                fwallet_entity_1.FWallet,
                transaction_entity_1.Transaction
            ]),
            address_book_module_1.AddressBookModule,
            customers_module_1.CustomersModule,
            drivers_module_1.DriversModule,
            upload_module_1.UploadModule,
            food_category_entity_1.FoodCategory,
            auth_module_1.AuthModule,
            mailer_module_1.MailerCustomModule,
            fwallets_module_1.FwalletsModule,
            transactions_module_1.TransactionsModule,
            admin_chart_module_1.AdminChartModule,
            food_categories_module_1.FoodCategoriesModule,
            promotions_module_1.PromotionsModule,
            restaurants_module_1.RestaurantsModule,
            menu_items_module_1.MenuItemsModule,
            menu_item_variants_module_1.MenuItemVariantsModule,
            cart_items_module_1.CartItemsModule,
            orders_module_1.OrdersModule,
            ratings_reviews_module_1.RatingsReviewsModule,
            admin_module_1.AdminModule,
            customer_cares_module_1.CustomerCaresModule,
            finance_admin_module_1.FinanceAdminModule,
            driver_progress_stages_module_1.DriverProgressStagesModule,
            customer_cares_inquires_module_1.CustomerCareInquiriesModule,
            companion_admin_module_1.CompanionAdminModule,
            fchat_module_1.FchatModule,
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                name: 'default',
                host: process.env.NEON_HOST || 'localhost',
                port: parseInt(process.env.NEON_PORT || '5432', 10),
                username: process.env.NEON_USER || 'postgres',
                password: process.env.NEON_PASSWORD || 'postgres',
                database: process.env.NEON_DATABASE || 'flashstrom',
                ssl: {
                    rejectUnauthorized: false
                },
                extra: {
                    sslmode: 'require',
                    max: 20
                },
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: false
            }),
            users_module_1.UsersModule,
            penalties_module_1.PenaltiesModule,
            online_sessions_module_1.OnlineSessionsModule,
            penalty_rules_module_1.PenaltyRulesModule,
            finance_rules_module_1.FinanceRulesModule,
            faq_module_1.FaqModule,
            driver_stats_records_module_1.DriverStatsRecordsModule,
            restaurant_stats_records_module_1.RestaurantStatsModule,
            banned_account_module_1.BannedAccountModule,
            notifications_module_1.NotificationsModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            food_categories_repository_1.FoodCategoriesRepository,
            email_service_1.EmailService,
            drivers_gateway_1.DriversGateway,
            customers_gateway_1.CustomersGateway,
            orders_service_1.OrdersService,
            online_session_repository_1.OnlineSessionsRepository,
            finance_rules_repository_1.FinanceRulesRepository,
            restaurants_gateway_1.RestaurantsGateway,
            redis_service_1.RedisService,
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
            },
            restaurants_service_1.RestaurantsService,
            drivers_service_1.DriversService,
            drivers_repository_1.DriversRepository,
            driver_stats_records_service_1.DriverStatsService,
            event_emitter_2.EventEmitter2,
            finance_rules_service_1.FinanceRulesService,
            fwallets_repository_1.FWalletsRepository,
            online_sessions_service_1.OnlineSessionsService,
            transactions_service_1.TransactionService,
            driver_progress_stages_service_1.DriverProgressStagesService,
            address_book_repository_1.AddressBookRepository
        ]
    }),
    __metadata("design:paramtypes", [])
], AppModule);
//# sourceMappingURL=app.module.js.map