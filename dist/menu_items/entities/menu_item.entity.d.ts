import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { MenuItemVariant } from 'src/menu_item_variants/entities/menu_item_variant.entity';
export declare class MenuItem {
    id: string;
    restaurant_id: string;
    restaurant: Restaurant;
    variants: MenuItemVariant[];
    name: string;
    description: string;
    price: number;
    category: string[];
    avatar: {
        url: string;
        key: string;
    };
    availability: boolean;
    suggest_notes: string[];
    discount: {
        discount_type: 'FIXED' | 'PERCENTAGE';
        discount_value: number;
        start_date: number;
        end_date: number;
    } | null;
    purchase_count: number;
    created_at: number;
    updated_at: number;
    generateId(): void;
}
