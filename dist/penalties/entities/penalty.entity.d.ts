import { Driver } from 'src/drivers/entities/driver.entity';
import { CustomerCare } from 'src/customer_cares/entities/customer_care.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { PenaltyRule } from '../../penalty-rules/entities/penalty-rule.entity';
export declare class Penalty {
    id: string;
    driver_id: string;
    driver: Driver;
    customer_care_id: string;
    customer_care: CustomerCare;
    restaurant_id: string;
    restaurant: Restaurant;
    penaltied_by_id: string;
    penaltied_by: Admin;
    rule_id: string;
    rule: PenaltyRule;
    description: string;
    penalty_points: number;
    status: string;
    issued_at: number;
    expires_at: number;
    created_at: number;
    generateId(): void;
}
