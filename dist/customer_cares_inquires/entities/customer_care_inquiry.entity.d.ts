import { Customer } from 'src/customers/entities/customer.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { CustomerCare } from 'src/customer_cares/entities/customer_care.entity';
import { Order } from 'src/orders/entities/order.entity';
export declare class CustomerCareInquiry {
    id: string;
    customer_id: string;
    customer: Customer;
    assigned_admin_id: string;
    assigned_admin: Admin;
    assigned_customer_care_id: string;
    assigned_customer_care: CustomerCare;
    assignee_type: 'ADMIN' | 'CUSTOMER_CARE';
    subject: string;
    description: string;
    issue_type: 'ACCOUNT' | 'PAYMENT' | 'PRODUCT' | 'DELIVERY' | 'REFUND' | 'TECHNICAL' | 'OTHER';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ESCALATE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    resolution_type: 'REFUND' | 'REPLACEMENT' | 'INVESTIGATING' | 'ACCOUNT_FIX' | 'TECHNICAL_SUPPORT' | 'OTHER';
    escalation_history: Array<{
        customer_care_id: string;
        reason: string;
        timestamp: number;
        escalated_to: 'ADMIN' | 'CUSTOMER_CARE';
        escalated_to_id: string;
    }>;
    rejection_history: Array<{
        customer_care_id: string;
        reason: string;
        timestamp: number;
    }>;
    transfer_history: Array<{
        from_customer_care_id: string;
        to_customer_care_id: string;
        reason: string;
        timestamp: number;
    }>;
    escalation_count: number;
    rejection_count: number;
    transfer_count: number;
    response_time: number;
    resolution_time: number;
    order_id: string;
    order: Order;
    resolution_notes: string;
    created_at: number;
    updated_at: number;
    resolved_at: number;
    first_response_at: number;
    last_response_at: number;
    generateId(): void;
}
