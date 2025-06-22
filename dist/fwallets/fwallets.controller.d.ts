import { FWalletService } from './fwallets.service';
import { CreateFWalletDto } from './dto/create-fwallet.dto';
import { UpdateFwalletDto } from './dto/update-fwallet.dto';
export declare class FWalletController {
    private readonly fWalletService;
    constructor(fWalletService: FWalletService);
    create(createFWalletDto: CreateFWalletDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/fwallet.entity").FWallet>>;
    findAll(): Promise<import("../utils/createResponse").ApiResponse<import("./entities/fwallet.entity").FWallet[]>>;
    findHistoryTransaction(fwalletId: string): Promise<import("../utils/createResponse").ApiResponse<import("../transactions/entities/transaction.entity").Transaction[]>>;
    searchByQuery(query: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/fwallet.entity").FWallet[]>>;
    findAllPaginated(page?: string, limit?: string): Promise<import("../utils/createResponse").ApiResponse<{
        totalPages: number;
        currentPage: number;
        totalItems: number;
        items: import("./entities/fwallet.entity").FWallet[];
    }>>;
    findFWalletById(id: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/fwallet.entity").FWallet>>;
    findOne(field: string, value: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/fwallet.entity").FWallet>>;
    update(id: string, updateFWalletDto: UpdateFwalletDto): Promise<import("../utils/createResponse").ApiResponse<any>>;
    remove(id: string): Promise<import("../utils/createResponse").ApiResponse<null>>;
}
