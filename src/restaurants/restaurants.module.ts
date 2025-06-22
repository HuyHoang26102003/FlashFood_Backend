// restaurants.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsControllerFake } from './restaurants.controller.fake';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsRepository } from './restaurants.repository';
import { DriversModule } from 'src/drivers/drivers.module';
import { MenuItemsModule } from 'src/menu_items/menu_items.module';
import { MenuItemVariantsModule } from 'src/menu_item_variants/menu_item_variants.module';
import { OrdersModule } from 'src/orders/orders.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsersModule } from 'src/users/users.module';
import { PromotionsModule } from 'src/promotions/promotions.module';
import { FoodCategoriesModule } from 'src/food_categories/food_categories.module';
import { AddressBookModule } from 'src/address_book/address_book.module';
import { AddressBook } from 'src/address_book/entities/address_book.entity';
import { AddressBookRepository } from 'src/address_book/address_book.repository';
import { FoodCategory } from 'src/food_categories/entities/food_category.entity';
import { FoodCategoriesRepository } from 'src/food_categories/food_categories.repository';
import { CartItemsModule } from 'src/cart_items/cart_items.module';
import { Order } from 'src/orders/entities/order.entity';
import { OrdersRepository } from 'src/orders/orders.repository';
import { UserRepository } from 'src/users/users.repository';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { TransactionService } from 'src/transactions/transactions.service';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { FWallet } from 'src/fwallets/entities/fwallet.entity';
import { FWalletsRepository } from 'src/fwallets/fwallets.repository';
import { TransactionsRepository } from 'src/transactions/transactions.repository';
import { PromotionsRepository } from 'src/promotions/promotions.repository';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { FinanceRule } from 'src/finance_rules/entities/finance_rule.entity';
import { FinanceRulesService } from 'src/finance_rules/finance_rules.service';
import { FinanceRulesRepository } from 'src/finance_rules/finance_rules.repository';
import { AdminRepository } from 'src/admin/admin.repository';
import { Admin } from 'src/admin/entities/admin.entity';
import { DriverStatsRecord } from 'src/driver_stats_records/entities/driver_stats_record.entity';
import { DriverStatsService } from 'src/driver_stats_records/driver_stats_records.service';
import { OnlineSessionsRepository } from 'src/online-sessions/online-session.repository';
import { OnlineSession } from 'src/online-sessions/entities/online-session.entity';
import { DriverProgressStagesRepository } from 'src/driver_progress_stages/driver_progress_stages.repository';
import { DriverProgressStage } from 'src/driver_progress_stages/entities/driver_progress_stage.entity';
import { RatingsReview } from 'src/ratings_reviews/entities/ratings_review.entity';
import { RatingsReviewsRepository } from 'src/ratings_reviews/ratings_reviews.repository';
import { RestaurantsGateway } from './restaurants.gateway';
import { Server } from 'socket.io';
import { RedisService } from 'src/redis/redis.service';
import { OrdersService } from 'src/orders/orders.service';
import { DriversGateway } from 'src/drivers/drivers.gateway';
import { DriverProgressStagesService } from 'src/driver_progress_stages/driver_progress_stages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Restaurant,
      AddressBook,
      Transaction,
      FoodCategory,
      Promotion,
      Order,
      FWallet,
      FinanceRule,
      OnlineSession,
      RatingsReview,
      Admin,
      DriverProgressStage,
      User,
      DriverStatsRecord
    ]),
    UsersModule,
    AddressBookModule,
    forwardRef(() => DriversModule),
    forwardRef(() => OrdersModule),
    forwardRef(() => MenuItemsModule),
    forwardRef(() => MenuItemVariantsModule),
    forwardRef(() => CartItemsModule),
    PromotionsModule,
    FoodCategoriesModule,
    EventEmitterModule.forRoot()
  ],
  controllers: [RestaurantsController, RestaurantsControllerFake],
  providers: [
    RestaurantsService,
    RestaurantsRepository,
    RatingsReviewsRepository,
    AddressBookRepository,
    FoodCategoriesRepository,
    UserRepository,
    FinanceRulesService,
    OnlineSessionsRepository,
    DriverProgressStagesRepository,
    DriverStatsService,
    FinanceRulesRepository,
    AdminRepository,
    OrdersRepository,
    JwtService,
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
    RedisService,
    TransactionService,
    FWalletsRepository,
    TransactionsRepository,
    DriversGateway,
    DriverProgressStagesService,
    PromotionsRepository
  ],
  exports: [RestaurantsService, RestaurantsRepository, AddressBookRepository]
})
export class RestaurantsModule {}
