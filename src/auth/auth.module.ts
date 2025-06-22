import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { CustomersModule } from 'src/customers/customers.module';
import { AuthController } from './auth.controller';
import { EmailService } from 'src/mailer/email.service';
import { MailerCustomModule } from 'src/mailer/mailer.module';
import { DriversModule } from 'src/drivers/drivers.module';
import { DriversService } from 'src/drivers/drivers.service';
import { FWalletService } from 'src/fwallets/fwallets.service';
import { FwalletsModule } from 'src/fwallets/fwallets.module';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { PromotionsModule } from 'src/promotions/promotions.module';
import { AddressBookService } from 'src/address_book/address_book.service';
import { PromotionsService } from 'src/promotions/promotions.service';
import { MenuItemsService } from 'src/menu_items/menu_items.service';
import { MenuItemsModule } from 'src/menu_items/menu_items.module';
import { FoodCategoriesModule } from 'src/food_categories/food_categories.module';
import { MenuItemVariantsService } from 'src/menu_item_variants/menu_item_variants.service';
import { MenuItemVariantsModule } from 'src/menu_item_variants/menu_item_variants.module';
import { CartItemsModule } from 'src/cart_items/cart_items.module';
import { CartItemsService } from 'src/cart_items/cart_items.service';
import { OrdersModule } from 'src/orders/orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Admin } from '../admin/entities/admin.entity';
import { UsersService } from 'src/users/users.service';
import { UserRepository } from 'src/users/users.repository';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { AddressBook } from 'src/address_book/entities/address_book.entity';
import { AddressBookRepository } from 'src/address_book/address_book.repository';
import { FoodCategory } from 'src/food_categories/entities/food_category.entity';
import { FoodCategoriesRepository } from 'src/food_categories/food_categories.repository';
import { FWallet } from 'src/fwallets/entities/fwallet.entity';
import { FWalletsRepository } from 'src/fwallets/fwallets.repository';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { CustomersRepository } from 'src/customers/customers.repository';
import { Driver } from 'src/drivers/entities/driver.entity';
import { DriversRepository } from 'src/drivers/drivers.repository';
import { MenuItemVariant } from 'src/menu_item_variants/entities/menu_item_variant.entity';
import { MenuItem } from 'src/menu_items/entities/menu_item.entity';
import { MenuItemVariantsRepository } from 'src/menu_item_variants/menu_item_variants.repository';
import { MenuItemsRepository } from 'src/menu_items/menu_items.repository';
import { Order } from 'src/orders/entities/order.entity';
import { OrdersRepository } from 'src/orders/orders.repository';
import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { CartItemsRepository } from 'src/cart_items/cart_items.repository';
import { CustomerCaresRepository } from 'src/customer_cares/customer_cares.repository';
import { CustomerCare } from 'src/customer_cares/entities/customer_care.entity';
import { TransactionService } from 'src/transactions/transactions.service';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { TransactionsRepository } from 'src/transactions/transactions.repository';
import { DriverProgressStage } from 'src/driver_progress_stages/entities/driver_progress_stage.entity';
import { DriverProgressStagesRepository } from 'src/driver_progress_stages/driver_progress_stages.repository';
import { OnlineSessionsRepository } from 'src/online-sessions/online-session.repository';
import { OnlineSessionsService } from 'src/online-sessions/online-sessions.service';
import { OnlineSession } from 'src/online-sessions/entities/online-session.entity';
import { AdminService } from 'src/admin/admin.service';
import { AdminRepository } from 'src/admin/admin.repository';
import { RatingsReview } from 'src/ratings_reviews/entities/ratings_review.entity';
import { RatingsReviewsRepository } from 'src/ratings_reviews/ratings_reviews.repository';
import { DriverStatsRecord } from 'src/driver_stats_records/entities/driver_stats_record.entity';
import { DriverStatsService } from 'src/driver_stats_records/driver_stats_records.service';
import { BannedAccount } from 'src/banned-account/entities/banned-account.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { NotificationsRepository } from 'src/notifications/notifications.repository';
import { Server } from 'socket.io';
import { RestaurantsGateway } from 'src/restaurants/restaurants.gateway';
import { FinanceRulesService } from 'src/finance_rules/finance_rules.service';
import { FinanceRule } from 'src/finance_rules/entities/finance_rule.entity';
import { RedisService } from 'src/redis/redis.service';
import { FinanceRulesRepository } from 'src/finance_rules/finance_rules.repository';
import { OrdersService } from 'src/orders/orders.service';
import { DriversGateway } from 'src/drivers/drivers.gateway';
import { DriverProgressStagesService } from 'src/driver_progress_stages/driver_progress_stages.service';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' }
    }),
    TypeOrmModule.forFeature([
      User,
      Admin,
      Promotion,
      Notification,
      AddressBook,
      FoodCategory,
      Customer,
      FWallet,
      Driver,
      RatingsReview,
      FinanceRule,
      DriverStatsRecord,
      Restaurant,
      BannedAccount,
      MenuItem,
      OnlineSession,
      Transaction,
      DriverProgressStage,
      MenuItemVariant,
      Order,
      CartItem,
      CustomerCare
    ]),

    // Add Mongoose models
    CustomersModule,
    DriversModule,
    FwalletsModule,
    RestaurantsModule,
    PromotionsModule,
    MenuItemsModule,
    MenuItemVariantsModule,
    CartItemsModule,
    FoodCategoriesModule,
    MailerCustomModule,
    OrdersModule
  ],
  providers: [
    AuthService,
    EmailService,
    JwtStrategy,
    {
      provide: 'SOCKET_SERVER',
      useFactory: () => {
        const io = new Server({
          cors: {
            origin: '*',
            methods: ['GET', 'POST']
          }
        });
        return io;
      }
    },
    RestaurantsGateway,
    FinanceRulesService,
    RedisService,
    EmailService,
    FinanceRulesRepository,
    OrdersService,
    DriversGateway,
    DriverProgressStagesService,

    DriverStatsService,
    UsersService,
    DriverProgressStagesRepository,
    OnlineSessionsRepository,
    OnlineSessionsService,
    NotificationsRepository,
    TransactionsRepository,
    DriversService,
    FWalletService,
    RestaurantsService,
    AddressBookService,
    CartItemsService,
    RatingsReviewsRepository,
    PromotionsService,
    MenuItemsService,
    AdminRepository,
    AdminService,
    MenuItemVariantsService,
    UserRepository,
    AddressBookRepository,
    FoodCategoriesRepository,
    FWalletsRepository,
    DriversRepository,
    TransactionService,
    CustomersRepository,
    MenuItemsRepository,
    MenuItemVariantsRepository,
    OrdersRepository,
    CartItemsRepository,
    CustomerCaresRepository
  ],
  controllers: [AuthController],
  exports: [AuthService, EmailService]
})
export class AuthModule {}
