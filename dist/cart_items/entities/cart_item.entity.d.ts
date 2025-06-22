import { Customer } from 'src/customers/entities/customer.entity';
import { MenuItem } from 'src/menu_items/entities/menu_item.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
export declare class CartItem {
    id: string;
    customer_id: string;
    item_id: string;
    restaurant_id: string;
    customer: Customer;
    item: MenuItem;
    restaurant: Restaurant;
    variants: Array<{
        variant_id: string;
        variant_name: string;
        variant_price_at_time_of_addition: number;
        quantity: number;
    }>;
    created_at: number;
    updated_at: number;
    deleted_at: number;
    generateId(): void;
}
