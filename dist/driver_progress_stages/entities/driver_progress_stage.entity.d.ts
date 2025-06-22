import { Driver } from 'src/drivers/entities/driver.entity';
import { Order } from 'src/orders/entities/order.entity';
import { ContactPhone } from 'src/restaurants/dto/create-restaurant.dto';
export declare class DriverProgressStage {
    id: string;
    driver_id: string;
    total_earns: number;
    driver: Driver;
    orders: Order[];
    current_state: string;
    previous_state: string;
    stages: Array<{
        state: string;
        status: 'pending' | 'completed' | 'in_progress' | 'failed';
        timestamp: number;
        duration: number;
        details?: {
            location?: {
                lat: number;
                lng: number;
            };
            estimated_time?: number;
            actual_time?: number;
            notes?: string;
            tip?: number;
            weather?: {
                temperature?: number;
                condition?: string;
            };
            restaurantDetails?: {
                id: string;
                restaurant_name: string;
                address: any;
                avatar: {
                    url: string;
                    key: string;
                };
                contact_phone: ContactPhone[];
            };
            customerDetails?: {
                id: string;
                first_name: string;
                last_name: string;
                address: any;
                avatar: {
                    url: string;
                    key: string;
                };
            };
        };
    }>;
    next_state: string;
    estimated_time_remaining: number;
    actual_time_spent: number;
    total_distance_travelled: number;
    total_tips: number;
    events: Array<{
        event_type: 'driver_start' | 'pickup_complete' | 'delivery_complete';
        event_timestamp: Date;
        event_details?: {
            location?: {
                lat: number;
                lng: number;
            };
            notes?: string;
        };
    }>;
    created_at: number;
    updated_at: number;
    transactions_processed: boolean;
    version: number;
    generateId(): void;
}
