import { EntityManager, Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
export declare class TransactionsRepository {
    private repository;
    constructor(repository: Repository<Transaction>);
    create(createDto: CreateTransactionDto, manager?: EntityManager): Promise<Transaction>;
    findAll(): Promise<Transaction[]>;
    findById(id: string): Promise<Transaction>;
    findByCondition(condition: any): Promise<Transaction>;
    update(id: string, updateDto: UpdateTransactionDto): Promise<Transaction>;
    remove(id: string): Promise<boolean>;
    findAllPaginated(skip: number, limit: number): Promise<[Transaction[], number]>;
}
