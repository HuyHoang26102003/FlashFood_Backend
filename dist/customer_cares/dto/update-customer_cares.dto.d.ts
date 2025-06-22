import { CreateCustomerCareDto } from './create-customer_cares.dto';
import { CustomerCareInquiry } from 'src/customer_cares_inquires/entities/customer_care_inquiry.entity';
declare const UpdateCustomerCareDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateCustomerCareDto>>;
export declare class UpdateCustomerCareDto extends UpdateCustomerCareDto_base {
    _id: string;
    first_name: string;
    last_name: string;
    contact_email: {
        title: string;
        is_default: boolean;
        email: string;
    }[];
    contact_phone: {
        title: string;
        number: string;
        is_default: boolean;
    }[];
    assigned_tickets?: CustomerCareInquiry[];
    created_at: number;
    updated_at: number;
    last_login: number;
    avatar: {
        key: string;
        url: string;
    };
    available_for_work: boolean;
    is_assigned: boolean;
}
export {};
