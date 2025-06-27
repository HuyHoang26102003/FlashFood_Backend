// update-order.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsString, IsEnum, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsEnum([
    'PENDING',
    'RESTAURANT_ACCEPTED',
    'PREPARING',
    'IN_PROGRESS',
    'READY_FOR_PICKUP',
    'RESTAURANT_PICKUP',
    'DISPATCHED',
    'EN_ROUTE',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'DELIVERY_FAILED'
  ])
  status:
    | 'PENDING'
    | 'RESTAURANT_ACCEPTED'
    | 'PREPARING'
    | 'IN_PROGRESS'
    | 'READY_FOR_PICKUP'
    | 'RESTAURANT_PICKUP'
    | 'DISPATCHED'
    | 'EN_ROUTE'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'DELIVERY_FAILED';

  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  total_amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  delivery_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  service_fee?: number;

  @IsOptional()
  @IsEnum(['PENDING', 'PAID', 'FAILED'])
  payment_status?: 'PENDING' | 'PAID' | 'FAILED';

  @IsOptional()
  @IsEnum(['COD', 'FWallet'])
  payment_method?: 'COD' | 'FWallet';

  @IsOptional()
  @IsString()
  customer_location?: string;

  @IsOptional()
  @IsString()
  driver_id?: string;

  @IsOptional()
  @IsString()
  restaurant_location?: string;

  @IsOptional()
  order_items?: Array<{
    item_id: string;
    variant_id: string;
    name: string;
    quantity: number;
    price_at_time_of_order: number;
    price_after_applied_promotion?: number; // Thêm từ CreateOrderDto
  }>;

  @IsOptional()
  @IsString()
  customer_note?: string;

  @IsOptional()
  @IsString()
  restaurant_note?: string;

  @IsOptional()
  @IsNumber()
  order_time?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sub_total?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_amount?: number;

  @IsOptional()
  @IsNumber()
  delivery_time?: number;

  @IsOptional()
  @IsEnum([
    'ORDER_PLACED',
    'ORDER_RECEIVED',
    'PREPARING',
    'IN_PROGRESS',
    'RESTAURANT_PICKUP',
    'DISPATCHED',
    'EN_ROUTE',
    'OUT_FOR_DELIVERY',
    'DELIVERY_FAILED',
    'DELIVERED'
  ])
  tracking_info:
    | 'ORDER_PLACED'
    | 'ORDER_RECEIVED'
    | 'PREPARING'
    | 'IN_PROGRESS'
    | 'RESTAURANT_PICKUP'
    | 'DISPATCHED'
    | 'EN_ROUTE'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERY_FAILED'
    | 'DELIVERED';

  @IsOptional()
  @IsString()
  promotion_applied?: string; // Thêm field này, khớp với CreateOrderDto
}
