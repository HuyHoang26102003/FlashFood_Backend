import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingsReviewsService } from './ratings_reviews.service';
import { RatingsReviewsController } from './ratings_reviews.controller';
import { RatingsReview } from './entities/ratings_review.entity';
import { RatingsReviewsRepository } from './ratings_reviews.repository';
import { Order } from 'src/orders/entities/order.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RatingsReview,
      Order,
      Driver,
      Customer,
      Restaurant
    ])
  ],
  controllers: [RatingsReviewsController],
  providers: [RatingsReviewsService, RatingsReviewsRepository, RedisService],
  exports: [RatingsReviewsService, RatingsReviewsRepository]
})
export class RatingsReviewsModule {}
