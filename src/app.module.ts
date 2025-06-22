// app.module.ts
import { Module, Global } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AddressBookModule } from './address_book/address_book.module';
import { CustomersModule } from './customers/customers.module';
import { DriversModule } from './drivers/drivers.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module';
import { EmailService } from './mailer/email.service';
import { MailerCustomModule } from './mailer/mailer.module';
import { FwalletsModule } from './fwallets/fwallets.module';
import { TransactionsModule } from './transactions/transactions.module';
import { FoodCategoriesModule } from './food_categories/food_categories.module';
import { PromotionsModule } from './promotions/promotions.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenuItemsModule } from './menu_items/menu_items.module';
import { MenuItemVariantsModule } from './menu_item_variants/menu_item_variants.module';
import { CartItemsModule } from './cart_items/cart_items.module';
import { OrdersModule } from './orders/orders.module';
import { RatingsReviewsModule } from './ratings_reviews/ratings_reviews.module';
import { AdminModule } from './admin/admin.module';
import { CustomerCaresModule } from './customer_cares/customer_cares.module';
import { FinanceAdminModule } from './admin/finance_admin/finance_admin.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DriverProgressStagesModule } from './driver_progress_stages/driver_progress_stages.module';
import { CompanionAdminModule } from './admin/companion_admin/companion_admin.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { FchatModule } from './FChat/fchat.module';
import { PenaltiesModule } from './penalties/penalties.module';
import { OnlineSessionsModule } from './online-sessions/online-sessions.module';
import { PenaltyRulesModule } from './penalty-rules/penalty-rules.module';
import { FinanceRulesModule } from './finance_rules/finance_rules.module';
import { FaqModule } from './faq/faq.module';
import { DriverStatsRecordsModule } from './driver_stats_records/driver_stats_records.module';
import { BannedAccountModule } from './banned-account/banned-account.module';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsModule } from './notifications/notifications.module';
import { RedisService } from './redis/redis.service';
import { RestaurantsGateway } from './restaurants/restaurants.gateway';
import { DriversGateway } from './drivers/drivers.gateway';
import { Server } from 'socket.io';
import { RestaurantsService } from './restaurants/restaurants.service';
import { DriversService } from './drivers/drivers.service';
import { DriversRepository } from './drivers/drivers.repository';
import { DriverStatsService } from './driver_stats_records/driver_stats_records.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FinanceRulesService } from './finance_rules/finance_rules.service';
import { FWalletsRepository } from './fwallets/fwallets.repository';
import { TransactionService } from './transactions/transactions.service';
import { DriverProgressStagesService } from './driver_progress_stages/driver_progress_stages.service';
import { AddressBookRepository } from './address_book/address_book.repository';
import { FoodCategory } from './food_categories/entities/food_category.entity';
import { FoodCategoriesRepository } from './food_categories/food_categories.repository';
import { Driver } from './drivers/entities/driver.entity';
import { OnlineSession } from './online-sessions/entities/online-session.entity';
import { OnlineSessionsService } from './online-sessions/online-sessions.service';
import { Order } from './orders/entities/order.entity';
import { DriverStatsRecord } from './driver_stats_records/entities/driver_stats_record.entity';
import { DriverProgressStage } from './driver_progress_stages/entities/driver_progress_stage.entity';
import { RatingsReview } from './ratings_reviews/entities/ratings_review.entity';
import { FinanceRule } from './finance_rules/entities/finance_rule.entity';
import { FinanceRulesRepository } from './finance_rules/finance_rules.repository';
import { FWallet } from './fwallets/entities/fwallet.entity';
import { Transaction } from './transactions/entities/transaction.entity';
import { OnlineSessionsRepository } from './online-sessions/online-session.repository';
import { AddressBook } from './address_book/entities/address_book.entity';
import { CustomersGateway } from './customers/customers.gateway';
import { AdminGateway } from './admin/admin.gateway';
import { CustomerCareInquiriesModule } from './customer_cares_inquires/customer_cares_inquires.module';
import { CustomerCareInquiry } from './customer_cares_inquires/entities/customer_care_inquiry.entity';
import { RestaurantStatsModule } from './restaurant_stats_records/restaurant_stats_records.module';
import { OrdersService } from './orders/orders.service';
import { AdminChartModule } from './admin_chart/admin_chart.module';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '30d' },
      global: true
    }),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true
    }),
    TypeOrmModule.forFeature([
      FoodCategory,
      Driver,
      OnlineSession,
      CustomerCareInquiry,
      Order,
      DriverStatsRecord,
      DriverProgressStage,
      RatingsReview,
      AddressBook,
      FinanceRule,
      FWallet,
      Transaction
    ]),
    AddressBookModule,
    CustomersModule,
    DriversModule,
    UploadModule,
    FoodCategory,
    AuthModule,
    MailerCustomModule,
    FwalletsModule,
    TransactionsModule,
    AdminChartModule,
    FoodCategoriesModule,
    PromotionsModule,
    RestaurantsModule,
    MenuItemsModule,
    MenuItemVariantsModule,
    CartItemsModule,
    OrdersModule,
    RatingsReviewsModule,
    AdminModule,
    CustomerCaresModule,
    FinanceAdminModule,
    DriverProgressStagesModule,
    CustomerCareInquiriesModule,
    CompanionAdminModule,
    FchatModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      name: 'default',
      host: process.env.NEON_HOST || 'localhost',
      port: parseInt(process.env.NEON_PORT || '5432', 10),
      username: process.env.NEON_USER || 'postgres',
      password: process.env.NEON_PASSWORD || 'postgres',
      database: process.env.NEON_DATABASE || 'flashstrom',
      ssl: {
        rejectUnauthorized: false // Neon yêu cầu
      },
      extra: {
        sslmode: 'require', // Cần cho Neon,
        max: 20
      },
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false
      // logging: true
    }),
    UsersModule,
    PenaltiesModule,
    OnlineSessionsModule,
    PenaltyRulesModule,
    FinanceRulesModule,
    FaqModule,
    DriverStatsRecordsModule,
    RestaurantStatsModule,
    BannedAccountModule,
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    FoodCategoriesRepository,
    EmailService,
    DriversGateway,
    CustomersGateway,
    AdminGateway,
    OrdersService,
    OnlineSessionsRepository,
    FinanceRulesRepository,
    RestaurantsGateway,
    RedisService,
    {
      provide: 'SOCKET_SERVER',
      useFactory: () => {
        const io = new Server({
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
    RestaurantsService,
    DriversService,
    DriversRepository,
    DriverStatsService,
    EventEmitter2,
    FinanceRulesService,
    FWalletsRepository,
    OnlineSessionsService,
    TransactionService,
    DriverProgressStagesService,
    AddressBookRepository
  ]
})
export class AppModule {
  constructor() {
    console.log('NEON_HOST:', process.env.NEON_HOST);
    console.log('NEON_PORT:', process.env.NEON_PORT);
    console.log('NEON_USER:', process.env.NEON_USER);
    console.log(
      'NEON_PASSWORD:',
      process.env.NEON_PASSWORD ? '***' : 'undefined'
    );
    console.log('NEON_DATABASE:', process.env.NEON_DATABASE);
  }
}
