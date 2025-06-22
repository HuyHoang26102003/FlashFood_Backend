import { Repository } from 'typeorm';
import { FinanceRule } from './entities/finance_rule.entity';
import { FinanceRulesRepository } from './finance_rules.repository';
import { CreateFinanceRuleDto } from './dto/create-finance_rule.dto';
import { UpdateFinanceRuleDto } from './dto/update-finance_rule.dto';
import { ApiResponse } from 'src/utils/createResponse';
import { AdminRepository } from 'src/admin/admin.repository';
export declare class FinanceRulesService {
    private readonly financeRulesRepository;
    private readonly adminRepository;
    private financeRuleEntityRepository;
    private readonly logger;
    constructor(financeRulesRepository: FinanceRulesRepository, adminRepository: AdminRepository, financeRuleEntityRepository: Repository<FinanceRule>);
    create(createFinanceRuleDto: CreateFinanceRuleDto): Promise<ApiResponse<FinanceRule>>;
    findAll(): Promise<ApiResponse<FinanceRule[]>>;
    findOne(id: string): Promise<ApiResponse<FinanceRule>>;
    findOneLatest(): Promise<ApiResponse<FinanceRule>>;
    update(id: string, updateFinanceRuleDto: UpdateFinanceRuleDto): Promise<ApiResponse<FinanceRule>>;
    remove(id: string): Promise<ApiResponse<null>>;
    findAllPaginated(page?: number, limit?: number): Promise<ApiResponse<any>>;
    private handleFinanceRuleResponse;
    private handleError;
}
