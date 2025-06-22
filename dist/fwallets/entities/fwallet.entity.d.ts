import { User } from 'src/users/entities/user.entity';
export declare class FWallet {
    id: string;
    user_id: string;
    user: User;
    balance: number;
    first_name: string;
    last_name: string;
    is_verified: boolean;
    created_at: number;
    updated_at: number;
    generateId(): void;
    version: number;
}
