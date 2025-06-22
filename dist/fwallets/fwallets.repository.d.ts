import { Repository, EntityManager, UpdateResult } from 'typeorm';
import { FWallet } from './entities/fwallet.entity';
import { CreateFWalletDto } from './dto/create-fwallet.dto';
import { UpdateFwalletDto } from './dto/update-fwallet.dto';
import { Transaction } from 'src/transactions/entities/transaction.entity';
export declare class FWalletsRepository {
    private repository;
    private transactionRepository;
    constructor(repository: Repository<FWallet>, transactionRepository: Repository<Transaction>);
    create(createDto: CreateFWalletDto, manager?: EntityManager): Promise<FWallet>;
    findAll(manager?: EntityManager): Promise<FWallet[]>;
    findBySearchQuery(query: string, manager?: EntityManager): Promise<FWallet[]>;
    findById(id: string, manager?: EntityManager): Promise<FWallet>;
    findByUserId(userId: string, manager?: EntityManager): Promise<FWallet>;
    findByCondition(condition: any, manager?: EntityManager): Promise<FWallet>;
    update(id: string, updateDto: UpdateFwalletDto, manager?: EntityManager): Promise<UpdateResult>;
    delete(id: string, manager?: EntityManager): Promise<boolean>;
    findHistoryTransaction(fWalletId: string, manager?: EntityManager): Promise<Transaction[]>;
    findAllPaginated(skip: number, limit: number): Promise<[FWallet[], number]>;
}
