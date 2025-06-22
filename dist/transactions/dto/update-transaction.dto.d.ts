import { CreateTransactionDto } from './create-transaction.dto';
declare const UpdateTransactionDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateTransactionDto>>;
export declare class UpdateTransactionDto extends UpdateTransactionDto_base {
    transaction_type?: 'DEPOSIT' | 'WITHDRAW' | 'PURCHASE' | 'REFUND';
    amount?: number;
    balance_after?: number;
    status?: 'PENDING' | 'CANCELLED' | 'FAILED' | 'COMPLETED';
    source?: 'MOMO' | 'FWALLET';
    destination?: string;
    updated_at?: number;
}
export {};
