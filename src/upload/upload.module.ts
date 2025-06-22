// upload.module.ts
import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { CustomersModule } from 'src/customers/customers.module';
import { DriversModule } from 'src/drivers/drivers.module';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { DriversService } from 'src/drivers/drivers.service';
import { CustomersService } from 'src/customers/customers.service';
import { MenuItemsModule } from 'src/menu_items/menu_items.module';
import { MenuItemsService } from 'src/menu_items/menu_items.service';
import { FoodCategoriesModule } from 'src/food_categories/food_categories.module';
import { MenuItemVariantsModule } from 'src/menu_item_variants/menu_item_variants.module';
import { OrdersModule } from 'src/orders/orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UserRepository } from 'src/users/users.repository';
import { PromotionsService } from 'src/promotions/promotions.service';
import { PromotionsRepository } from 'src/promotions/promotions.repository';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { AddressBook } from 'src/address_book/entities/address_book.entity';
import { AddressBookRepository } from 'src/address_book/address_book.repository';
import { FoodCategory } from 'src/food_categories/entities/food_category.entity';
import { FoodCategoriesRepository } from 'src/food_categories/food_categories.repository';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantsRepository } from 'src/restaurants/restaurants.repository';
import { Customer } from 'src/customers/entities/customer.entity';
import { CustomersRepository } from 'src/customers/customers.repository';
import { Driver } from 'src/drivers/entities/driver.entity';
import { DriversRepository } from 'src/drivers/drivers.repository';
import { DriverProgressStagesService } from 'src/driver_progress_stages/driver_progress_stages.service';
import { DriverProgressStagesModule } from 'src/driver_progress_stages/driver_progress_stages.module';
import { MenuItem } from 'src/menu_items/entities/menu_item.entity';
import { MenuItemVariant } from 'src/menu_item_variants/entities/menu_item_variant.entity';
import { MenuItemVariantsRepository } from 'src/menu_item_variants/menu_item_variants.repository';
import { MenuItemsRepository } from 'src/menu_items/menu_items.repository';
import { Order } from 'src/orders/entities/order.entity';
import { OrdersRepository } from 'src/orders/orders.repository';
import { CustomerCareInquiry } from 'src/customer_cares_inquires/entities/customer_care_inquiry.entity';
import { DriverProgressStage } from 'src/driver_progress_stages/entities/driver_progress_stage.entity';
import { DriverProgressStagesRepository } from 'src/driver_progress_stages/driver_progress_stages.repository';
import { JwtService } from '@nestjs/jwt';
import { TransactionService } from 'src/transactions/transactions.service';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { FWallet } from 'src/fwallets/entities/fwallet.entity';
import { FWalletsRepository } from 'src/fwallets/fwallets.repository';
import { TransactionsRepository } from 'src/transactions/transactions.repository';
import { OnlineSession } from 'src/online-sessions/entities/online-session.entity';
import { OnlineSessionsService } from 'src/online-sessions/online-sessions.service';
import { OnlineSessionsRepository } from 'src/online-sessions/online-session.repository';
import { DriverStatsRecord } from 'src/driver_stats_records/entities/driver_stats_record.entity';
import { DriverStatsService } from 'src/driver_stats_records/driver_stats_records.service';
import { RatingsReview } from 'src/ratings_reviews/entities/ratings_review.entity';
import { RatingsReviewsRepository } from 'src/ratings_reviews/ratings_reviews.repository';
import { FinanceRulesService } from 'src/finance_rules/finance_rules.service';
import { FinanceRulesRepository } from 'src/finance_rules/finance_rules.repository';
import { FinanceRule } from 'src/finance_rules/entities/finance_rule.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { AdminRepository } from 'src/admin/admin.repository';
import { AdminService } from 'src/admin/admin.service';
import { UsersService } from 'src/users/users.service';
import { BannedAccount } from 'src/banned-account/entities/banned-account.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { NotificationsRepository } from 'src/notifications/notifications.repository';
import { RedisService } from 'src/redis/redis.service';
import { RestaurantsGateway } from 'src/restaurants/restaurants.gateway';
import { Server } from 'socket.io';
import { OrdersService } from 'src/orders/orders.service';
import { CartItemsRepository } from 'src/cart_items/cart_items.repository';
import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { DriversGateway } from 'src/drivers/drivers.gateway';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CustomerCareService } from 'src/customer_cares/customer_cares.service';
import { CustomerCare } from 'src/customer_cares/entities/customer_care.entity';
import { CustomerCaresRepository } from 'src/customer_cares/customer_cares.repository';
import { CustomerCareInquiriesRepository } from 'src/customer_cares_inquires/customer_cares_inquires.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Promotion,
      AddressBook,
      FoodCategory,
      CartItem,
      Restaurant,
      Customer,
      Notification,
      BannedAccount,
      RatingsReview,
      OnlineSession,
      Driver,
      MenuItem,
      MenuItemVariant,
      Order,
      DriverProgressStage,
      CustomerCareInquiry,
      FinanceRule,
      Admin,
      Transaction,
      CustomerCare,
      DriverStatsRecord,
      FWallet
    ]),
    CustomersModule,
    DriversModule,
    RestaurantsModule,
    MenuItemsModule,
    FoodCategoriesModule,
    MenuItemVariantsModule,
    DriverProgressStagesModule,
    OrdersModule
  ],
  controllers: [UploadController],
  providers: [
    RedisService,
    CustomerCareService,
    UploadService,
    RestaurantsGateway,
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
    RestaurantsService,
    DriversService,
    JwtService,
    FWalletsRepository,
    DriverStatsService,
    RatingsReviewsRepository,
    AdminRepository,
    FinanceRulesService,
    CustomerCaresRepository,
    AdminService,
    UsersService,
    FinanceRulesRepository,
    TransactionsRepository,
    CustomerCareInquiriesRepository,
    OnlineSessionsService,
    OnlineSessionsRepository,
    DriversGateway,
    MenuItemsService,
    CustomersService,
    UserRepository,
    TransactionService,
    PromotionsService,
    PromotionsRepository,
    NotificationsRepository,
    AddressBookRepository,
    FoodCategoriesRepository,
    DriverProgressStagesRepository,
    RestaurantsRepository,
    OrdersService,
    CartItemsRepository,
    CustomersRepository,
    DriversRepository,
    DriverProgressStagesService,
    MenuItemsRepository,
    MenuItemVariantsRepository,
    OrdersRepository
  ]
})
export class UploadModule {}
