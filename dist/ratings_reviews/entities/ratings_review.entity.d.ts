import { Customer } from 'src/customers/entities/customer.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { CustomerCare } from 'src/customer_cares/entities/customer_care.entity';
export declare class RatingsReview {
    id: string;
    rr_reviewer_driver_id: string;
    rr_reviewer_customer_id: string;
    rr_reviewer_restaurant_id: string;
    rr_reviewer_customercare_id: string;
    reviewer_driver: Driver;
    reviewer_customer: Customer;
    reviewer_restaurant: Restaurant;
    reviewer_customercare: CustomerCare;
    reviewer_type: string;
    rr_recipient_driver_id: string;
    rr_recipient_customer_id: string;
    rr_recipient_restaurant_id: string;
    rr_recipient_customercare_id: string;
    recipient_driver: Driver;
    recipient_customer: Customer;
    recipient_restaurant: Restaurant;
    recipient_customercare: CustomerCare;
    recipient_type: string;
    order_id: string;
    order: Order;
    food_rating: number;
    delivery_rating: number;
    food_review: string;
    delivery_review: string;
    images: Array<{
        url: string;
        key: string;
    }>;
    created_at: number;
    updated_at: number;
    generateId(): void;
}
