// drivers.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { Driver } from './entities/driver.entity';
import { DriversRepository } from './drivers.repository';
import { AddressBookRepository } from 'src/address_book/address_book.repository';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { OrdersModule } from '../orders/orders.module';
import { DriverProgressStagesModule } from '../driver_progress_stages/driver_progress_stages.module';
import { AddressBook } from 'src/address_book/entities/address_book.entity';
import { OrdersRepository } from 'src/orders/orders.repository';
import { Order } from 'src/orders/entities/order.entity';
import { JwtService } from '@nestjs/jwt';
import { PromotionsRepository } from 'src/promotions/promotions.repository';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { DriverProgressStage } from 'src/driver_progress_stages/entities/driver_progress_stage.entity';
import { DriverProgressStagesRepository } from 'src/driver_progress_stages/driver_progress_stages.repository';
import { OnlineSession } from 'src/online-sessions/entities/online-session.entity';
import { OnlineSessionsRepository } from 'src/online-sessions/online-session.repository';
import { OnlineSessionsService } from 'src/online-sessions/online-sessions.service';
import { DriverStatsService } from 'src/driver_stats_records/driver_stats_records.service';
import { DriverStatsRecord } from 'src/driver_stats_records/entities/driver_stats_record.entity';
import { RatingsReview } from 'src/ratings_reviews/entities/ratings_review.entity';
import { RatingsReviewsRepository } from 'src/ratings_reviews/ratings_reviews.repository';
import { FinanceRulesRepository } from 'src/finance_rules/finance_rules.repository';
import { FinanceRule } from 'src/finance_rules/entities/finance_rule.entity';
import { FinanceRulesService } from 'src/finance_rules/finance_rules.service';
import { AdminRepository } from 'src/admin/admin.repository';
import { Admin } from 'src/admin/entities/admin.entity';
import { FWallet } from 'src/fwallets/entities/fwallet.entity';
import { FWalletsRepository } from 'src/fwallets/fwallets.repository';
import { TransactionService } from 'src/transactions/transactions.service';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { TransactionsRepository } from 'src/transactions/transactions.repository';
import { UserRepository } from 'src/users/users.repository';
import { User } from 'src/users/entities/user.entity';
import { Server } from 'socket.io';
import { RedisService } from 'src/redis/redis.service';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { MenuItem } from 'src/menu_items/entities/menu_item.entity';
import { MenuItemsRepository } from 'src/menu_items/menu_items.repository';
import { MenuItemsService } from 'src/menu_items/menu_items.service';
import { MenuItemVariantsRepository } from 'src/menu_item_variants/menu_item_variants.repository';
import { MenuItemVariantsService } from 'src/menu_item_variants/menu_item_variants.service';
import { MenuItemVariant } from 'src/menu_item_variants/entities/menu_item_variant.entity';
import { RestaurantsGateway } from 'src/restaurants/restaurants.gateway';
import { FoodCategory } from 'src/food_categories/entities/food_category.entity';
import { FoodCategoriesRepository } from 'src/food_categories/food_categories.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Driver,
      AddressBook,
      Order,
      Promotion,
      DriverProgressStage,
      MenuItem,
      Admin,
      OnlineSession,
      Transaction,
      Restaurant,
      Customer,
      FinanceRule,
      User,
      FoodCategory,
      FWallet,
      DriverStatsRecord,
      MenuItemVariant,
      RatingsReview
    ]),
    forwardRef(() => RestaurantsModule),
    forwardRef(() => OrdersModule),
    DriverProgressStagesModule
  ],
  controllers: [DriversController],
  providers: [
    RedisService,
    DriversService,
    OrdersRepository,
    FWalletsRepository,
    RestaurantsGateway,
    TransactionService,
    RestaurantsService,
    FoodCategoriesRepository,
    DriversRepository,
    TransactionsRepository,
    UserRepository,
    OnlineSessionsService,
    RatingsReviewsRepository,
    MenuItemsRepository,
    MenuItemsService,
    MenuItemVariantsRepository,
    MenuItemVariantsService,
    OnlineSessionsRepository,
    FinanceRulesRepository,
    FinanceRulesService,
    AdminRepository,
    AddressBookRepository,
    DriverProgressStagesRepository,
    PromotionsRepository,
    JwtService,
    DriverStatsService,
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
    }
  ],
  exports: [DriversService, DriversRepository, DriverStatsService]
})
export class DriversModule {}
