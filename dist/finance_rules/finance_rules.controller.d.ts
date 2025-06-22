import { FinanceRulesService } from './finance_rules.service';
import { CreateFinanceRuleDto } from './dto/create-finance_rule.dto';
import { UpdateFinanceRuleDto } from './dto/update-finance_rule.dto';
export declare class FinanceRulesController {
    private readonly financeRulesService;
    constructor(financeRulesService: FinanceRulesService);
    create(createFinanceRuleDto: CreateFinanceRuleDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/finance_rule.entity").FinanceRule>>;
    findAll(): Promise<import("../utils/createResponse").ApiResponse<import("./entities/finance_rule.entity").FinanceRule[]>>;
    findAllPaginated(page?: string, limit?: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
    findOne(id: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/finance_rule.entity").FinanceRule>>;
    update(id: string, updateFinanceRuleDto: UpdateFinanceRuleDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/finance_rule.entity").FinanceRule>>;
    remove(id: string): Promise<import("../utils/createResponse").ApiResponse<null>>;
}
