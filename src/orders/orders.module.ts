// orders.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrdersRepository } from './orders.repository';
import { MenuItemsRepository } from 'src/menu_items/menu_items.repository';
import { MenuItemVariantsRepository } from 'src/menu_item_variants/menu_item_variants.repository';
import { MenuItem } from 'src/menu_items/entities/menu_item.entity';
import { MenuItemVariant } from 'src/menu_item_variants/entities/menu_item_variant.entity';
import { AddressBook } from 'src/address_book/entities/address_book.entity';
import { AddressBookRepository } from 'src/address_book/address_book.repository';
import { Customer } from 'src/customers/entities/customer.entity';
import { CustomersRepository } from 'src/customers/customers.repository';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantsRepository } from 'src/restaurants/restaurants.repository';
import { FoodCategoriesRepository } from 'src/food_categories/food_categories.repository';
import { FoodCategory } from 'src/food_categories/entities/food_category.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { DriversService } from 'src/drivers/drivers.service';
import { User } from 'src/users/entities/user.entity';
import { UserRepository } from 'src/users/users.repository';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { PromotionsRepository } from 'src/promotions/promotions.repository';
import { MenuItemsService } from 'src/menu_items/menu_items.service';
import { MenuItemVariantsService } from 'src/menu_item_variants/menu_item_variants.service';
import { DriversRepository } from 'src/drivers/drivers.repository';
import { DriverProgressStagesService } from 'src/driver_progress_stages/driver_progress_stages.service';
import { DriverProgressStage } from 'src/driver_progress_stages/entities/driver_progress_stage.entity';
import { DriverProgressStagesRepository } from 'src/driver_progress_stages/driver_progress_stages.repository';
import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { CartItemsRepository } from 'src/cart_items/cart_items.repository';
import { DriversModule } from 'src/drivers/drivers.module';
import { CustomersGateway } from 'src/customers/customers.gateway';
import { CustomersService } from 'src/customers/customers.service';
import { JwtService } from '@nestjs/jwt';
import { TransactionsRepository } from 'src/transactions/transactions.repository';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { FWalletsRepository } from 'src/fwallets/fwallets.repository';
import { TransactionService } from 'src/transactions/transactions.service';
import { FWallet } from 'src/fwallets/entities/fwallet.entity';
import { OnlineSession } from 'src/online-sessions/entities/online-session.entity';
import { OnlineSessionsService } from 'src/online-sessions/online-sessions.service';
import { OnlineSessionsRepository } from 'src/online-sessions/online-session.repository';
import { FinanceRule } from 'src/finance_rules/entities/finance_rule.entity';
import { FinanceRulesService } from 'src/finance_rules/finance_rules.service';
import { FinanceRulesRepository } from 'src/finance_rules/finance_rules.repository';
import { AdminRepository } from 'src/admin/admin.repository';
import { Admin } from 'src/admin/entities/admin.entity';
import { DriverStatsService } from 'src/driver_stats_records/driver_stats_records.service';
import { DriverStatsRecord } from 'src/driver_stats_records/entities/driver_stats_record.entity';
import { RatingsReview } from 'src/ratings_reviews/entities/ratings_review.entity';
import { RatingsReviewsRepository } from 'src/ratings_reviews/ratings_reviews.repository';
import { NotificationsRepository } from 'src/notifications/notifications.repository';
import { Notification } from 'src/notifications/entities/notification.entity';
import { RedisService } from 'src/redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DriversGateway } from 'src/drivers/drivers.gateway';
import { RestaurantsGateway } from 'src/restaurants/restaurants.gateway';
import { Server } from 'socket.io';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      MenuItem,
      FinanceRule,
      MenuItemVariant,
      AddressBook,
      DriverStatsRecord,
      RatingsReview,
      Restaurant,
      Customer,
      Transaction,
      FoodCategory,
      Notification,
      Driver,
      User,
      OnlineSession,
      Admin,
      Promotion,
      DriverProgressStage,
      FWallet,
      CartItem
    ]),
    forwardRef(() => DriversModule),
    forwardRef(() => TransactionsModule)
  ],
  controllers: [OrdersController],
  providers: [
    RedisService,
    OrdersService,
    OrdersRepository,
    NotificationsRepository,
    MenuItemsRepository,
    MenuItemVariantsRepository,
    OnlineSessionsRepository,
    AddressBookRepository,
    RatingsReviewsRepository,
    CustomersRepository,
    OnlineSessionsService,
    FinanceRulesService,
    FinanceRulesRepository,
    DriverStatsService,
    AdminRepository,
    RestaurantsRepository,
    FoodCategoriesRepository,
    RestaurantsService,
    DriversService,
    UserRepository,
    CustomersService,
    DriversRepository,
    PromotionsRepository,
    MenuItemsService,
    DriverProgressStagesService,
    MenuItemVariantsService,
    DriverProgressStagesRepository,
    CartItemsRepository,
    FWalletsRepository,
    TransactionService,
    CustomersGateway,
    DriversGateway,
    RestaurantsGateway,
    TransactionsRepository,
    JwtService,
    EventEmitter2,
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
    }
  ],
  exports: [OrdersService, OrdersRepository]
})
export class OrdersModule {}
