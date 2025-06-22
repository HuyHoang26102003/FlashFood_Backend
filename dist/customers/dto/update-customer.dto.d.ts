import { Enum_AppTheme } from 'src/types/Payload';
import { CreateCustomerDto } from './create-customer.dto';
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
declare const UpdateCustomerDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateCustomerDto>>;
export declare class UpdateCustomerDto extends UpdateCustomerDto_base {
    id?: string;
    last_login?: number;
    user_id?: string;
    first_name?: string;
    last_name?: string;
    address_ids?: string[];
    avatar?: Avatar;
    preferred_category_ids?: string[];
    favorite_restaurant_ids?: string[];
    favorite_items?: string[];
    support_tickets?: string[];
    app_preferences?: AppPreferences;
    restaurant_history?: RestaurantHistory[];
}
export declare class UpdateCustomerPreferredCategoryDto extends UpdateCustomerDto {
    preferred_category: string;
}
export declare class UpdateCustomerFavoriteRestaurantDto extends UpdateCustomerDto {
    favorite_restaurant: string;
}
export declare class ToggleCustomerFavoriteRestaurantDto extends UpdateCustomerDto {
    favorite_restaurant: string;
}
export {};
