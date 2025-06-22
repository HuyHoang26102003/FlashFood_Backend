import { CreateCustomerCareInquiryDto } from './create-customer-care-inquiry.dto';
declare const UpdateCustomerCareInquiryDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateCustomerCareInquiryDto>>;
export declare class UpdateCustomerCareInquiryDto extends UpdateCustomerCareInquiryDto_base {
    assigned_customer_care_id?: string;
    subject?: string;
    description?: string;
    issue_type?: 'ACCOUNT' | 'PAYMENT' | 'PRODUCT' | 'DELIVERY' | 'REFUND' | 'TECHNICAL' | 'OTHER';
    status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ESCALATE';
    assigned_to?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    resolution_type?: 'REFUND' | 'REPLACEMENT' | 'INVESTIGATING' | 'ACCOUNT_FIX' | 'TECHNICAL_SUPPORT' | 'OTHER';
    resolved_at?: number;
    resolution_notes?: string;
    assignee_type?: 'ADMIN' | 'CUSTOMER_CARE';
    escalation_history?: Array<{
        customer_care_id: string;
        reason: string;
        timestamp: number;
        escalated_to: 'ADMIN' | 'CUSTOMER_CARE';
        escalated_to_id: string;
    }>;
    rejection_history?: Array<{
        customer_care_id: string;
        reason: string;
        timestamp: number;
    }>;
    transfer_history?: Array<{
        from_customer_care_id: string;
        to_customer_care_id: string;
        reason: string;
        timestamp: number;
    }>;
    escalation_count?: number;
    rejection_count?: number;
    transfer_count?: number;
    response_time?: number;
    resolution_time?: number;
    first_response_at?: number;
    last_response_at?: number;
}
export {};
