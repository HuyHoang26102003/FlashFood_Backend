import { Admin } from 'src/admin/entities/admin.entity';
import { CustomerCareInquiry } from 'src/customer_cares_inquires/entities/customer_care_inquiry.entity';
import { User } from 'src/users/entities/user.entity';
export declare class CustomerCare {
    id: string;
    user_id: User;
    contact_email: Array<{
        title: string;
        is_default: boolean;
        email: string;
    }>;
    contact_phone: Array<{
        title: string;
        number: string;
        is_default: boolean;
    }>;
    first_name: string;
    last_name: string;
    assigned_tickets: CustomerCareInquiry[];
    created_at: number;
    updated_at: number;
    last_login: number;
    avatar: {
        key: string;
        url: string;
    };
    available_for_work: boolean;
    is_assigned: boolean;
    active_point: number;
    active_workload: number;
    admins: Admin[];
    generateId(): void;
}
