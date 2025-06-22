import { MenuItem } from 'src/menu_items/entities/menu_item.entity';
export declare class MenuItemVariant {
    id: string;
    menu_id: string;
    menu_item: MenuItem;
    variant: string;
    description: string;
    avatar: {
        key: string;
        url: string;
    };
    availability: boolean;
    default_restaurant_notes: string[];
    price: number;
    discount_rate: number;
    created_at: number;
    updated_at: number;
    generateId(): void;
}
