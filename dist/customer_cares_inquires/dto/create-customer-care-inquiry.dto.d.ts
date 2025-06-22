export declare class CreateCustomerCareInquiryDto {
    customer_id: string;
    subject: string;
    description: string;
    issue_type?: 'ACCOUNT' | 'PAYMENT' | 'PRODUCT' | 'DELIVERY' | 'REFUND' | 'TECHNICAL' | 'OTHER';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ESCALATE';
    order_id?: string;
    assigned_to?: string;
    assignee_type?: 'ADMIN' | 'CUSTOMER_CARE';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    resolution_type?: 'REFUND' | 'REPLACEMENT' | 'INVESTIGATING' | 'ACCOUNT_FIX' | 'TECHNICAL_SUPPORT' | 'OTHER';
    resolution_notes?: string;
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
}
