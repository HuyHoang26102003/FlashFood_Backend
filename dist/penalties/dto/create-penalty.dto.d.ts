export declare class CreatePenaltyDto {
    driver_id?: string;
    customer_care_id?: string;
    restaurant_id?: string;
    penaltied_by_id: string;
    rule_id: string;
    description: string;
    penalty_points: number;
    status: string;
    issued_at: number;
    expires_at?: number;
}
