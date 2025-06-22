import { CreateOrderDto } from './create-order.dto';
declare const UpdateOrderDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateOrderDto>>;
export declare class UpdateOrderDto extends UpdateOrderDto_base {
    status: 'PENDING' | 'RESTAURANT_ACCEPTED' | 'PREPARING' | 'IN_PROGRESS' | 'READY_FOR_PICKUP' | 'RESTAURANT_PICKUP' | 'DISPATCHED' | 'EN_ROUTE' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'DELIVERY_FAILED';
    distance?: number;
    total_amount?: number;
    delivery_fee?: number;
    service_fee?: number;
    payment_status?: 'PENDING' | 'PAID' | 'FAILED';
    payment_method?: 'COD' | 'FWallet';
    customer_location?: string;
    driver_id?: string;
    restaurant_location?: string;
    order_items?: Array<{
        item_id: string;
        variant_id: string;
        name: string;
        quantity: number;
        price_at_time_of_order: number;
        price_after_applied_promotion?: number;
    }>;
    customer_note?: string;
    restaurant_note?: string;
    order_time?: number;
    delivery_time?: number;
    tracking_info: 'ORDER_PLACED' | 'ORDER_RECEIVED' | 'PREPARING' | 'IN_PROGRESS' | 'RESTAURANT_PICKUP' | 'DISPATCHED' | 'EN_ROUTE' | 'OUT_FOR_DELIVERY' | 'DELIVERY_FAILED' | 'DELIVERED';
    promotion_applied?: string;
}
export {};
