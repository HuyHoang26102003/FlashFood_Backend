export interface AddressPopulate {
    _id?: string;
    street?: string;
    city?: string;
    postal_code?: number;
    location?: {
        lat?: number;
        lng?: number;
    };
}
export declare enum Enum_UserType {
    DRIVER = "DRIVER",
    ADMIN = "ADMIN",
    CUSTOMER = "CUSTOMER",
    RESTAURANT_OWNER = "RESTAURANT_OWNER",
    CUSTOMER_CARE_REPRESENTATIVE = "CUSTOMER_CARE_REPRESENTATIVE",
    F_WALLET = "F_WALLET",
    SUPER_ADMIN = "SUPER_ADMIN",
    FINANCE_ADMIN = "FINANCE_ADMIN",
    COMPANION_ADMIN = "COMPANION_ADMIN"
}
export declare enum Enum_AvatarType {
    DRIVER = "DRIVER",
    ADMIN = "ADMIN",
    CUSTOMER = "CUSTOMER",
    RESTAURANT_OWNER = "RESTAURANT_OWNER",
    CUSTOMER_CARE_REPRESENTATIVE = "CUSTOMER_CARE_REPRESENTATIVE",
    F_WALLET = "F_WALLET",
    MENU_ITEM = "MENU_ITEM",
    PROMOMOTION = "PROMOTION"
}
export declare enum Enum_AppTheme {
    LIGHT = "light",
    DARK = "dark"
}
export type BasePayload = {
    user_id: string;
    email: string;
    user_type: Enum_UserType[];
    first_name: string;
    last_name: string;
    app_preferences: {
        theme: Enum_AppTheme;
    };
};
export type DriverPayload = BasePayload & {
    contact_email: string;
    contact_phone: string;
    vehicle: string;
    current_location: string;
    avatar: {
        url: string;
        key: string;
    };
    fWallet_id: string;
    driver_id: string;
    fWallet_balance: number;
    available_for_work: boolean;
};
export type RestaurantOwnerPayload = BasePayload & {
    owner_id: string;
    restaurant_id: string;
    address_id: string;
    owner_name: string;
    restaurant_name: string;
    contact_email: {
        title: string;
        is_default: boolean;
        email: string;
    }[];
    contact_phone: {
        number: string;
        is_default: boolean;
        title: string;
    }[];
    created_at: number;
    updated_at: number;
    avatar: {
        url: string;
        key: string;
    };
    images_gallery: string[];
    status: {
        is_open: boolean;
        is_active: boolean;
        is_accepted_orders: boolean;
    };
    promotions: string[];
    ratings: {
        average_rating: number;
        review_count: number;
    };
    specialize_in: string[];
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
};
export type CustomerPayload = BasePayload & {
    preferred_category: string;
    favorite_restaurants: string[];
    favorite_items: string[];
    avatar: {
        url: string;
        key: string;
    };
    address: AddressPopulate[];
    support_tickets: string[];
    cart_items: any;
};
export type FWalletPayload = BasePayload & {
    balance: number;
    fWallet_id: string;
};
export type Payload = DriverPayload | CustomerPayload | FWalletPayload | RestaurantOwnerPayload;
