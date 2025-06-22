export declare enum DiscountType {
    FIXED = "FIXED",
    PERCENTAGE = "PERCENTAGE"
}
export declare class DiscountDto {
    discount_type: DiscountType;
    discount_value: number;
    start_date: number;
    end_date: number;
}
