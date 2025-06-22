export declare class CreateFinanceRuleDto {
    driver_fixed_wage: {
        '0-1km': number;
        '1-2km': number;
        '2-3km': number;
        '4-5km': number;
        '>5km': string;
    };
    customer_care_hourly_wage: number;
    app_service_fee: number;
    restaurant_commission: number;
    created_by_id: string;
    description?: string;
    updated_at?: number;
}
