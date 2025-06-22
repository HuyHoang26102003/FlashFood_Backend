import { Enum_AppTheme } from 'src/types/Payload';
declare class Avatar {
    url: string;
    key: string;
}
declare class AppPreferences {
    theme: Enum_AppTheme;
}
declare class RestaurantHistory {
    restaurant_id: string;
    count: number;
}
export declare class CreateCustomerDto {
    user_id: string;
    first_name: string;
    last_name: string;
    address: string;
    avatar?: Avatar;
    address_ids?: string[];
    preferred_category_ids?: string[];
    favorite_restaurant_ids?: string[];
    favorite_items?: string[];
    support_tickets?: string[];
    app_preferences?: AppPreferences;
    restaurant_history?: RestaurantHistory[];
    created_at: number;
    updated_at: number;
}
export declare class createCustomerSignup extends CreateCustomerDto {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone: string;
}
export {};
