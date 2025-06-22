import { CustomerCareInquiry } from 'src/customer_cares_inquires/entities/customer_care_inquiry.entity';
import { User } from 'src/users/entities/user.entity';
export declare class CreateCustomerCareDto {
    readonly user_id: User;
    readonly contact_email?: {
        title: string;
        is_default: boolean;
        email: string;
    }[];
    readonly contact_phone?: {
        title: string;
        number: string;
        is_default: boolean;
    }[];
    readonly first_name?: string;
    readonly last_name?: string;
    readonly assigned_tickets?: CustomerCareInquiry[];
    readonly created_at?: number;
    readonly updated_at?: number;
    readonly last_login?: number;
    readonly avatar?: {
        key: string;
        url: string;
    };
    readonly available_for_work?: boolean;
    readonly is_assigned?: boolean;
}
export declare class createCustomerCareSignup extends CreateCustomerCareDto {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone: string;
}
