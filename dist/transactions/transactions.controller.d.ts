import { TransactionService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionService);
    create(createTransactionDto: CreateTransactionDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/transaction.entity").Transaction>>;
    findAll(): Promise<import("../utils/createResponse").ApiResponse<import("./entities/transaction.entity").Transaction[]>>;
    findAllPaginated(page?: string, limit?: string): Promise<import("../utils/createResponse").ApiResponse<{
        totalPages: number;
        currentPage: number;
        totalItems: number;
        items: import("./entities/transaction.entity").Transaction[];
    }>>;
    findTransactionById(id: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/transaction.entity").Transaction>>;
    findOne(field: string, value: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/transaction.entity").Transaction>>;
    update(id: string, updateTransactionDto: UpdateTransactionDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/transaction.entity").Transaction>>;
    remove(id: string): Promise<import("../utils/createResponse").ApiResponse<null>>;
}
