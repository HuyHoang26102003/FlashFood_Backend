export declare class CreateMenuItemVariantDto {
    menu_id: string;
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
}
export declare class MenuItemVariantDto {
    price: number;
    description?: string;
    variant?: string;
}
