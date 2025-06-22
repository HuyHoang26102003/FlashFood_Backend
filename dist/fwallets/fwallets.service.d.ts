import { CreateFWalletDto } from './dto/create-fwallet.dto';
import { UpdateFwalletDto } from './dto/update-fwallet.dto';
import { FWalletsRepository } from './fwallets.repository';
import { ApiResponse } from 'src/utils/createResponse';
import { FWallet } from './entities/fwallet.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
export declare class FWalletService {
    private readonly fWalletsRepository;
    constructor(fWalletsRepository: FWalletsRepository);
    create(createFWalletDto: CreateFWalletDto): Promise<ApiResponse<FWallet>>;
    findAll(): Promise<ApiResponse<FWallet[]>>;
    findBySearchQuery(query: string): Promise<ApiResponse<FWallet[]>>;
    findFWalletById(id: string): Promise<ApiResponse<FWallet>>;
    findOne(conditions: object): Promise<ApiResponse<FWallet>>;
    update(id: string, updateFWalletDto: UpdateFwalletDto): Promise<ApiResponse<any>>;
    remove(id: string): Promise<ApiResponse<null>>;
    findHistoryTransaction(fWalletId: string): Promise<ApiResponse<Transaction[]>>;
    findAllPaginated(page?: number, limit?: number): Promise<ApiResponse<{
        totalPages: number;
        currentPage: number;
        totalItems: number;
        items: FWallet[];
    }>>;
}
