import { Admin } from 'src/admin/entities/admin.entity';
export declare enum TargetUser {
    DRIVER = "DRIVER",
    RESTAURANT = "RESTAURANT",
    CUSTOMER = "CUSTOMER",
    CUSTOMER_CARE = "CUSTOMER_CARE"
}
export declare class Notification {
    id: string;
    avatar: {
        url: string;
        key: string;
    };
    title: string;
    desc: string;
    image: string;
    link: string;
    target_user: TargetUser[];
    created_by_id: string;
    created_by: Admin;
    is_read: boolean;
    target_user_id: string;
    created_at: number;
    updated_at: number;
    generateId(): void;
}
