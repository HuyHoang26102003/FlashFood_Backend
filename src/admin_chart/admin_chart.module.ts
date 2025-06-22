import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminChartRecord } from './entities/admin_chart_record.entity';
import { AdminChartController } from './admin_chart.controller';
import { AdminChartService } from './admin_chart.service';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RatingsReview } from 'src/ratings_reviews/entities/ratings_review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminChartRecord,
      Order,
      User,
      Promotion,
      Customer,
      Driver,
      Restaurant,
      RatingsReview
    ])
  ],
  controllers: [AdminChartController],
  providers: [AdminChartService],
  exports: [AdminChartService]
})
export class AdminChartModule {}
