import { Driver } from 'src/drivers/entities/driver.entity';
import { CustomerCare } from 'src/customer_cares/entities/customer_care.entity';
export declare class OnlineSession {
    id: string;
    driver_id: string;
    driver: Driver;
    customer_care_id: string;
    customer_care: CustomerCare;
    start_time: number;
    end_time: number;
    is_active: boolean;
    generateId(): void;
}
