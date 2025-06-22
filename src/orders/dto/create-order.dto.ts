// create-order.dto.ts
import {
  IsString,
  IsArray,
  IsEnum,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateOrderDto {
  @IsString()
  customer_id: string;

  @IsString()
  restaurant_id: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number;

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
    'DELIVERY_FAILED',
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

  @IsNumber()
  @Min(0)
  total_amount: number;

  @IsNumber()
  @Min(0)
  delivery_fee: number;

  @IsNumber()
  @Min(0)
  service_fee: number;

  @IsEnum(['PENDING', 'PAID', 'FAILED'])
  payment_status: 'PENDING' | 'PAID' | 'FAILED';

  @IsEnum(['COD', 'FWallet'])
  payment_method: 'COD' | 'FWallet';

  @IsString()
  customer_location: string;

  @IsString()
  restaurant_location: string;

  @IsArray()
  @IsOptional()
  order_items: Array<{
    item_id: string;
    variant_id: string;
    name: string;
    quantity: number;
    price_at_time_of_order: number;
    price_after_applied_promotion?: number; // Thêm field này
  }>;

  @IsString()
  @IsOptional()
  customer_note?: string;

  @IsString()
  @IsOptional()
  restaurant_note?: string;

  @IsNumber()
  order_time: number;

  @IsNumber()
  delivery_time: number;

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
    'DELIVERED',
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

  @IsString()
  @IsOptional()
  promotion_applied?: string; // Chỉ một promotion ID, không phải mảng
}