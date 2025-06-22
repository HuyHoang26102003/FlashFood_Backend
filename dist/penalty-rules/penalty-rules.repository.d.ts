import { Repository } from 'typeorm';
import { PenaltyRule } from './entities/penalty-rule.entity';
export declare class PenaltyRulesRepository {
    private penaltyRuleEntityRepository;
    constructor(penaltyRuleEntityRepository: Repository<PenaltyRule>);
    findById(id: string): Promise<PenaltyRule>;
    findByViolationType(violationType: string): Promise<PenaltyRule>;
    create(createPenaltyRuleDto: any): Promise<any>;
    update(id: string, updatePenaltyRuleDto: any): Promise<PenaltyRule>;
    remove(id: string): Promise<PenaltyRule>;
    findAllPaginated(skip: number, limit: number): Promise<[PenaltyRule[], number]>;
}
