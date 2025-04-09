import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { MongooseModule } from '@nestjs/mongoose';
import { AddressBookModule } from './address_book/address_book.module';
import { CustomersModule } from './customers/customers.module';
import { DriversModule } from './drivers/drivers.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module'; // Make sure AuthModule is imported here
import { EmailService } from './mailer/email.service';
import { MailerCustomModule } from './mailer/mailer.module'; // Import MailerCustomModule (which configures MailerService)
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
import { CustomerCareInquiriesModule } from './customer_cares_inquires/customer_cares_inquires.module';
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
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
      global: true // Đặt global để JwtService dùng được khắp app
    }),
    // MongooseModule.forRoot(process.env.MONGO_URI), // Your MongoDB URI
    AddressBookModule,
    EventEmitterModule.forRoot(),
    CustomersModule,
    DriversModule,
    UploadModule,
    AuthModule, // Ensure AuthModule is imported
    MailerCustomModule,
    FwalletsModule,
    TransactionsModule,
    FoodCategoriesModule,
    PromotionsModule,
    RestaurantsModule,
    MenuItemsModule,
    MenuItemVariantsModule,
    CartItemsModule,
    OrdersModule,
    RatingsReviewsModule, // Import the mailer module here
    AdminModule,
    CustomerCaresModule,
    FinanceAdminModule,
    DriverProgressStagesModule,
    CompanionAdminModule,
    CustomerCareInquiriesModule,
    FchatModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.NEON_HOST,
      port: parseInt(process.env.NEON_PORT),
      username: process.env.NEON_USER,
      password: process.env.NEON_PASSWORD,
      database: process.env.NEON_DATABASE,
      ssl: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true // Set to false in production
      // extra: {
      //   statement_timeout: 5000, // 10 giây cho mỗi truy vấn
      //   lock_timeout: 3000 // 5 giây cho khóa
      // }
    }),
    UsersModule,
    PenaltiesModule,
    OnlineSessionsModule,
    PenaltyRulesModule,
    FinanceRulesModule,
    FaqModule,
    DriverStatsRecordsModule,
    BannedAccountModule,
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [AppService, EmailService]
})
export class AppModule {}
