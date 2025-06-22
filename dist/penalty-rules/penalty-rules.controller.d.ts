import { PenaltyRulesService } from './penalty-rules.service';
import { CreatePenaltyRuleDto } from './dto/create-penalty-rule.dto';
import { UpdatePenaltyRuleDto } from './dto/update-penalty-rule.dto';
export declare class PenaltyRulesController {
    private readonly penaltyRulesService;
    constructor(penaltyRulesService: PenaltyRulesService);
    create(createPenaltyRuleDto: CreatePenaltyRuleDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/penalty-rule.entity").PenaltyRule>>;
    findAll(): Promise<import("../utils/createResponse").ApiResponse<import("./entities/penalty-rule.entity").PenaltyRule[]>>;
    findAllPaginated(page?: string, limit?: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
    findOne(id: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/penalty-rule.entity").PenaltyRule>>;
    update(id: string, updatePenaltyRuleDto: UpdatePenaltyRuleDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/penalty-rule.entity").PenaltyRule>>;
    remove(id: string): Promise<import("../utils/createResponse").ApiResponse<null>>;
}
