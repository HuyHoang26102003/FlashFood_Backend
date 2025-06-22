"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PenaltyRulesRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const penalty_rule_entity_1 = require("./entities/penalty-rule.entity");
let PenaltyRulesRepository = class PenaltyRulesRepository {
    constructor(penaltyRuleEntityRepository) {
        this.penaltyRuleEntityRepository = penaltyRuleEntityRepository;
    }
    async findById(id) {
        return await this.penaltyRuleEntityRepository.findOne({ where: { id } });
    }
    async findByViolationType(violationType) {
        return await this.penaltyRuleEntityRepository.findOne({
            where: { violation_type: violationType }
        });
    }
    async create(createPenaltyRuleDto) {
        const rule = this.penaltyRuleEntityRepository.create(createPenaltyRuleDto);
        return await this.penaltyRuleEntityRepository.save(rule);
    }
    async update(id, updatePenaltyRuleDto) {
        await this.penaltyRuleEntityRepository.update(id, updatePenaltyRuleDto);
        return await this.findById(id);
    }
    async remove(id) {
        const rule = await this.findById(id);
        if (rule) {
            await this.penaltyRuleEntityRepository.delete(id);
        }
        return rule;
    }
    async findAllPaginated(skip, limit) {
        return this.penaltyRuleEntityRepository.findAndCount({
            skip,
            take: limit
        });
    }
};
exports.PenaltyRulesRepository = PenaltyRulesRepository;
exports.PenaltyRulesRepository = PenaltyRulesRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(penalty_rule_entity_1.PenaltyRule)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PenaltyRulesRepository);
//# sourceMappingURL=penalty-rules.repository.js.map