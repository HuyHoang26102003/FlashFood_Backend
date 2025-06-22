export declare class ContactEmail {
    title: string;
    is_default: boolean;
    email: string;
}
export declare class ContactPhone {
    title: string;
    number: string;
    is_default: boolean;
}
export declare class Status {
    is_open: boolean;
    is_active: boolean;
    is_accepted_orders: boolean;
}
declare class OpeningHours {
    from: number;
    to: number;
}
export declare class DailyHours {
    mon: OpeningHours;
    tue: OpeningHours;
    wed: OpeningHours;
    thu: OpeningHours;
    fri: OpeningHours;
    sat: OpeningHours;
    sun: OpeningHours;
}
export declare class CreateRestaurantDto {
    owner_id: string;
    owner_name: string;
    address_id: string;
    restaurant_name: string;
    description?: string;
    contact_email: ContactEmail[];
    contact_phone: ContactPhone[];
    avatar?: {
        url: string;
        key: string;
    };
    images_gallery?: {
        url: string;
        key: string;
    }[];
    status: Status;
    promotions?: string[];
    ratings?: {
        average_rating: number;
        review_count: number;
    };
    food_category_ids?: string[];
    opening_hours: DailyHours;
}
export declare class CreateRestaurantSignup extends CreateRestaurantDto {
    owner_id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    phone?: string;
}
export {};
