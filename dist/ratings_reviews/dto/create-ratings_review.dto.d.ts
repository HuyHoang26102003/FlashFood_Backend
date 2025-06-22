export declare class CreateRatingsReviewDto {
    rr_reviewer_driver_id?: string;
    rr_reviewer_customer_id?: string;
    rr_reviewer_restaurant_id?: string;
    reviewer_type: string;
    rr_recipient_driver_id?: string;
    rr_recipient_customer_id?: string;
    rr_recipient_restaurant_id?: string;
    recipient_type: string;
    order_id: string;
    food_rating: number;
    delivery_rating: number;
    food_review?: string;
    delivery_review?: string;
    images?: Array<{
        url: string;
        key: string;
    }>;
}
