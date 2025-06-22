import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerCareService } from './customer_cares.service';
import { CustomerCare } from './entities/customer_care.entity';
import { CustomerCaresRepository } from './customer_cares.repository';
import { CustomerCareInquiriesRepository } from 'src/customer_cares_inquires/customer_cares_inquires.repository';
import { CustomerCareInquiry } from 'src/customer_cares_inquires/entities/customer_care_inquiry.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrdersRepository } from 'src/orders/orders.repository';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { RedisService } from 'src/redis/redis.service';
import { CustomerCaresController } from './customer_cares.controller';
import { CustomerCaresControllerFake } from './customer_cares.controller.fake';
import { CustomerCaresGateway } from './customer_cares.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerCare,
      CustomerCareInquiry,
      Order,
      Promotion
    ])
  ],
  controllers: [CustomerCaresController, CustomerCaresControllerFake],
  providers: [
    RedisService,
    CustomerCareService,
    CustomerCaresRepository,
    OrdersRepository,
    CustomerCareInquiriesRepository,
    CustomerCaresGateway
  ],
  exports: [CustomerCareService, CustomerCaresRepository]
})
export class CustomerCaresModule {}
