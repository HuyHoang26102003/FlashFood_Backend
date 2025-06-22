import { User } from 'src/users/entities/user.entity';
import { FWallet } from 'src/fwallets/entities/fwallet.entity';
export declare class Transaction {
    id: string;
    user_id: string;
    user: User;
    fwallet_id: string;
    fwallet: FWallet;
    transaction_type: 'DEPOSIT' | 'WITHDRAW' | 'PURCHASE' | 'REFUND';
    amount: number;
    balance_after: number;
    status: 'PENDING' | 'CANCELLED' | 'FAILED' | 'COMPLETED';
    timestamp: number;
    source: 'MOMO' | 'FWALLET';
    destination: string;
    destination_type: 'FWALLET' | 'TEMPORARY_WALLET_BALANCE';
    order_id: string;
    reference_order_id: string;
    created_at: number;
    updated_at: number;
    generateId(): void;
}
