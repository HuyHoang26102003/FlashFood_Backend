import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { FoodCategory } from 'src/food_categories/entities/food_category.entity';
export declare enum PromotionStatus {
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    PENDING = "PENDING",
    CANCELLED = "CANCELLED"
}
export declare enum DiscountType {
    PERCENTAGE = "PERCENTAGE",
    FIXED = "FIXED",
    BOGO = "BOGO"
}
export declare class Promotion {
    id: string;
    name: string;
    description: string;
    start_date: number;
    end_date: number;
    discount_type: DiscountType;
    discount_value: number;
    promotion_cost_price: number;
    minimum_order_value: number;
    avatar: {
        url: string;
        key: string;
    };
    status: PromotionStatus;
    food_category_ids: string[];
    bogo_details: {
        buy_quantity: number;
        get_quantity: number;
        max_redemptions?: number;
    };
    created_at: Date;
    updated_at: Date;
    restaurants: Restaurant[];
    food_categories: FoodCategory[];
}
