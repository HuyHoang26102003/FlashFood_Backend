import { Order } from 'src/orders/entities/order.entity';
export declare class AddressBook {
    id: string;
    street: string;
    city: string;
    nationality: string;
    is_default: boolean;
    created_at: number;
    updated_at: number;
    postal_code: number;
    location: {
        lng: number;
        lat: number;
    };
    title: string;
    customer_orders: Order[];
    restaurant_orders: Order[];
    generateId(): void;
}
