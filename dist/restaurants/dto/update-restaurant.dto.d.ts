import { CreateRestaurantDto } from './create-restaurant.dto';
declare const UpdateRestaurantDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateRestaurantDto>>;
export declare class UpdateRestaurantDto extends UpdateRestaurantDto_base {
    id?: string;
    owner_id?: string;
    owner_name?: string;
    address_id?: string;
    restaurant_name?: string;
    description?: string;
    contact_email?: {
        title: string;
        is_default: boolean;
        email: string;
    }[];
    contact_phone?: {
        title: string;
        number: string;
        is_default: boolean;
    }[];
    avatar?: {
        url: string;
        key: string;
    };
    images_gallery?: Array<{
        key: string;
        url: string;
    }>;
    status?: {
        is_open: boolean;
        is_active: boolean;
        is_accepted_orders: boolean;
    };
    promotions?: string[];
    ratings?: {
        average_rating: number;
        review_count: number;
    };
    specialize_in?: string[];
    opening_hours?: {
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
}
export {};
