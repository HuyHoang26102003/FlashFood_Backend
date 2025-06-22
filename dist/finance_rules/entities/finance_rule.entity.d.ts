import { Admin } from 'src/admin/entities/admin.entity';
export declare class FinanceRule {
    id: string;
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
    created_by: Admin;
    description: string;
    created_at: number;
    updated_at: number;
    generateId(): void;
}
