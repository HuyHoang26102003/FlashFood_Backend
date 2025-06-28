import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItemsService } from './cart_items.service';
import { CartItemsController } from './cart_items.controller';
import { CartItem } from './entities/cart_item.entity';
import { CartItemsRepository } from './cart_items.repository';
import { MenuItemsModule } from 'src/menu_items/menu_items.module';
import { MenuItemVariantsModule } from 'src/menu_item_variants/menu_item_variants.module';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { CustomersModule } from 'src/customers/customers.module';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem]),
    forwardRef(() => MenuItemsModule),
    forwardRef(() => MenuItemVariantsModule),
    forwardRef(() => RestaurantsModule),
    forwardRef(() => CustomersModule)
  ],
  controllers: [CartItemsController],
  providers: [CartItemsService, CartItemsRepository, RedisService],
  exports: [CartItemsService, CartItemsRepository]
})
export class CartItemsModule {}
