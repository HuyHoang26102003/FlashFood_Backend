import { User } from 'src/users/entities/user.entity';
import { AddressBook } from 'src/address_book/entities/address_book.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { FoodCategory } from 'src/food_categories/entities/food_category.entity';
import { Enum_AppTheme } from 'src/types/Payload';
import { Order } from 'src/orders/entities/order.entity';
export declare class Customer {
    id: string;
    user_id: string;
    user: User;
    first_name: string;
    last_name: string;
    phone: string;
    avatar: {
        url: string;
        key: string;
    };
    address: AddressBook[];
    preferred_category: FoodCategory[];
    favorite_restaurants: Restaurant[];
    favorite_items: string[];
    support_tickets: string[];
    app_preferences: {
        theme: Enum_AppTheme;
    };
    restaurant_history: {
        restaurant_id: string;
        count: number;
    }[];
    created_at: number;
    updated_at: number;
    last_login: number;
    orders: Order[];
    generateId(): void;
}
