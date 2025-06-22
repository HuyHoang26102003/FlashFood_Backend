import { CreateFinanceRuleDto } from './create-finance_rule.dto';
declare const UpdateFinanceRuleDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateFinanceRuleDto>>;
export declare class UpdateFinanceRuleDto extends UpdateFinanceRuleDto_base {
    driver_fixed_wage?: {
        '0-1km': number;
        '1-2km': number;
        '2-3km': number;
        '4-5km': number;
        '>5km': string;
    };
    customer_care_hourly_wage?: number;
    app_service_fee?: number;
    restaurant_commission?: number;
    description?: string;
    updated_at?: number;
}
export {};
