export declare class CreateTransactionDto {
    user_id: string;
    version: number;
    fwallet_id: string;
    transaction_type: 'DEPOSIT' | 'WITHDRAW' | 'PURCHASE' | 'REFUND';
    amount: number;
    balance_after: number;
    status: 'PENDING' | 'CANCELLED' | 'FAILED' | 'COMPLETED';
    source: 'MOMO' | 'FWALLET';
    destination: string;
    destination_type: 'FWALLET' | 'TEMPORARY_WALLET_BALANCE';
    order_id?: string;
    reference_order_id?: string;
}
