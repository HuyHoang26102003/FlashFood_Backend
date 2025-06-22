import { User } from 'src/users/entities/user.entity';
import { AddressBook } from 'src/address_book/entities/address_book.entity';
import { FoodCategory } from 'src/food_categories/entities/food_category.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { MenuItem } from 'src/menu_items/entities/menu_item.entity';
export declare class Restaurant {
    id: string;
    owner_id: string;
    owner: User;
    owner_name: string;
    address_id: string;
    address: AddressBook;
    restaurant_name: string;
    description: string;
    contact_email: {
        title: string;
        is_default: boolean;
        email: string;
    }[];
    contact_phone: {
        title: string;
        number: string;
        is_default: boolean;
    }[];
    avatar: {
        url: string;
        key: string;
    };
    images_gallery: {
        url: string;
        key: string;
    }[];
    status: {
        is_open: boolean;
        is_active: boolean;
        is_accepted_orders: boolean;
    };
    promotions: Promotion[];
    ratings: {
        average_rating: number;
        review_count: number;
    };
    specialize_in: FoodCategory[];
    opening_hours: {
        mon: {
            from: number;
            to: number;
        };
        tue: {
            from: number;
            to: number;
        };
        wed: {
            from: number;
            to: number;
        };
        thu: {
            from: number;
            to: number;
        };
        fri: {
            from: number;
            to: number;
        };
        sat: {
            from: number;
            to: number;
        };
        sun: {
            from: number;
            to: number;
        };
    };
    created_at: number;
    updated_at: number;
    total_orders: number;
    admins: Admin[];
    orders: Order[];
    menuItems: MenuItem[];
    generateId(): void;
}
