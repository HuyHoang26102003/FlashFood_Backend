import { Repository } from 'typeorm';
import { FinanceRule } from './entities/finance_rule.entity';
export declare class FinanceRulesRepository {
    private financeRuleEntityRepository;
    private readonly logger;
    constructor(financeRuleEntityRepository: Repository<FinanceRule>);
    findById(id: string): Promise<FinanceRule | null>;
    findAll(query?: Record<string, any>): Promise<FinanceRule[]>;
    create(createFinanceRuleDto: Partial<FinanceRule>): Promise<FinanceRule>;
    update(id: string, updateFinanceRuleDto: Partial<FinanceRule>): Promise<FinanceRule | null>;
    remove(id: string): Promise<FinanceRule | null>;
    findAllPaginated(skip: number, limit: number): Promise<[FinanceRule[], number]>;
}
