import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { ApiResponse } from 'src/utils/createResponse';
import { FWalletsRepository } from 'src/fwallets/fwallets.repository';
import { TransactionsRepository } from './transactions.repository';
import { DataSource, EntityManager } from 'typeorm';
import { OrdersService } from 'src/orders/orders.service';
export declare class TransactionService {
    private readonly transactionsRepository;
    private readonly fWalletsRepository;
    private readonly dataSource;
    private readonly ordersService;
    constructor(transactionsRepository: TransactionsRepository, fWalletsRepository: FWalletsRepository, dataSource: DataSource, ordersService: OrdersService);
    private handleError;
    create(createTransactionDto: CreateTransactionDto, manager?: EntityManager): Promise<ApiResponse<Transaction>>;
    private processTransaction;
    private handleSourceWalletTransaction;
    private handleDestinationWalletTransaction;
    findAll(): Promise<ApiResponse<Transaction[]>>;
    findTransactionById(id: string): Promise<ApiResponse<Transaction>>;
    findOne(conditions: object): Promise<ApiResponse<Transaction>>;
    update(id: string, updateTransactionDto: UpdateTransactionDto): Promise<ApiResponse<Transaction>>;
    remove(id: string): Promise<ApiResponse<null>>;
    findAllPaginated(page?: number, limit?: number): Promise<ApiResponse<{
        totalPages: number;
        currentPage: number;
        totalItems: number;
        items: Transaction[];
    }>>;
    private handleTransactionResponse;
    updateTransactionStatus(transactionId: string, newStatus: 'PENDING' | 'CANCELLED' | 'FAILED' | 'COMPLETED', orderId?: string, manager?: EntityManager): Promise<ApiResponse<Transaction>>;
}
