import { DriverProgressStage } from 'src/driver_progress_stages/entities/driver_progress_stage.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { AddressBook } from 'src/address_book/entities/address_book.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { RatingsReview } from 'src/ratings_reviews/entities/ratings_review.entity';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { MenuItem } from 'src/menu_items/entities/menu_item.entity';
export declare enum OrderTrackingInfo {
    ORDER_PLACED = "ORDER_PLACED",
    ORDER_RECEIVED = "ORDER_RECEIVED",
    PREPARING = "PREPARING",
    IN_PROGRESS = "IN_PROGRESS",
    RESTAURANT_PICKUP = "RESTAURANT_PICKUP",
    DISPATCHED = "DISPATCHED",
    EN_ROUTE = "EN_ROUTE",
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
    DELIVERY_FAILED = "DELIVERY_FAILED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    RETURNED = "RETURNED"
}
export declare enum OrderStatus {
    PENDING = "PENDING",
    RESTAURANT_ACCEPTED = "RESTAURANT_ACCEPTED",
    PREPARING = "PREPARING",
    IN_PROGRESS = "IN_PROGRESS",
    READY_FOR_PICKUP = "READY_FOR_PICKUP",
    RESTAURANT_PICKUP = "RESTAURANT_PICKUP",
    DISPATCHED = "DISPATCHED",
    EN_ROUTE = "EN_ROUTE",
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    RETURNED = "RETURNED",
    DELIVERY_FAILED = "DELIVERY_FAILED"
}
export declare enum OrderCancellationReason {
    CUSTOMER_CANCELLED = "CUSTOMER_CANCELLED",
    RESTAURANT_CANCELLED = "RESTAURANT_CANCELLED",
    DRIVER_CANCELLED = "DRIVER_CANCELLED",
    OUT_OF_STOCK = "OUT_OF_STOCK",
    RESTAURANT_CLOSED = "RESTAURANT_CLOSED",
    DRIVER_UNAVAILABLE = "DRIVER_UNAVAILABLE",
    CUSTOMER_UNAVAILABLE = "CUSTOMER_UNAVAILABLE",
    OTHER = "OTHER"
}
export interface OrderItem {
    item_id: string;
    variant_id: string;
    name: string;
    quantity: number;
    price_at_time_of_order: number;
    item?: MenuItem;
}
export declare class Order {
    id: string;
    customer_id: string;
    customer: Customer;
    restaurant_id: string;
    restaurant: Restaurant;
    driver_id: string;
    distance: number;
    driver_wage: number;
    driver: Driver;
    status: OrderStatus;
    total_amount: number;
    delivery_fee: number;
    service_fee: number;
    payment_status: 'PENDING' | 'PAID' | 'FAILED';
    payment_method: 'COD' | 'FWallet';
    customer_location: string;
    customerAddress: AddressBook;
    restaurant_location: string;
    restaurantAddress: AddressBook;
    order_items: OrderItem[];
    menu_items?: MenuItem[];
    customer_note: string;
    restaurant_note: string;
    order_time: number;
    delivery_time: number;
    tracking_info: OrderTrackingInfo;
    driver_tips: number;
    created_at: number;
    updated_at: number;
    driver_progress_stages: DriverProgressStage[];
    drivers: Driver[];
    ratings_reviews: RatingsReview[];
    promotions_applied: Promotion[];
    cancelled_by: 'customer' | 'restaurant' | 'driver';
    cancelled_by_id: string;
    cancellation_reason: OrderCancellationReason;
    cancellation_title: string;
    cancellation_description: string;
    cancelled_at: number;
    version: number;
    generateId(): void;
}
