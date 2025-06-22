import { Repository } from 'typeorm';
import { PenaltyRule } from './entities/penalty-rule.entity';
import { PenaltyRulesRepository } from './penalty-rules.repository';
import { CreatePenaltyRuleDto } from './dto/create-penalty-rule.dto';
import { UpdatePenaltyRuleDto } from './dto/update-penalty-rule.dto';
import { ApiResponse } from 'src/utils/createResponse';
export declare class PenaltyRulesService {
    private readonly penaltyRulesRepository;
    private penaltyRuleEntityRepository;
    private readonly logger;
    constructor(penaltyRulesRepository: PenaltyRulesRepository, penaltyRuleEntityRepository: Repository<PenaltyRule>);
    create(createPenaltyRuleDto: CreatePenaltyRuleDto): Promise<ApiResponse<PenaltyRule>>;
    findAll(): Promise<ApiResponse<PenaltyRule[]>>;
    findOne(id: string): Promise<ApiResponse<PenaltyRule>>;
    update(id: string, updatePenaltyRuleDto: UpdatePenaltyRuleDto): Promise<ApiResponse<PenaltyRule>>;
    remove(id: string): Promise<ApiResponse<null>>;
    findAllPaginated(page?: number, limit?: number): Promise<ApiResponse<any>>;
    private handleRuleResponse;
    private handleError;
}
