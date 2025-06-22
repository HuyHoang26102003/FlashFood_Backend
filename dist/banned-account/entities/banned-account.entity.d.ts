export declare class BannedAccount {
    id: string;
    entity_type: 'Customer' | 'CustomerCare' | 'Driver' | 'Restaurant';
    entity_id: string;
    banned_by: string;
    reason: string;
    banned_at: number;
    generateId(): void;
}
