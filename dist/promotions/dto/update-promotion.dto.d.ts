import { CreatePromotionDto } from './create-promotion.dto';
import { DiscountType, PromotionStatus } from '../entities/promotion.entity';
declare const UpdatePromotionDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreatePromotionDto>>;
export declare class UpdatePromotionDto extends UpdatePromotionDto_base {
    name?: string;
    description?: string;
    start_date?: number;
    end_date?: number;
    avatar?: {
        url: string;
        key: string;
    };
    discount_type?: DiscountType;
    discount_value?: number;
    promotion_cost_price?: number;
    minimum_order_value?: number;
    status?: PromotionStatus;
    food_category_ids?: string[];
    bogo_details?: {
        buy_quantity: number;
        get_quantity: number;
        max_redemptions?: number;
    };
}
export {};
