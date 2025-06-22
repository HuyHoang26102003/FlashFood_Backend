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
var PenaltyRulesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PenaltyRulesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const penalty_rule_entity_1 = require("./entities/penalty-rule.entity");
const penalty_rules_repository_1 = require("./penalty-rules.repository");
const createResponse_1 = require("../utils/createResponse");
let PenaltyRulesService = PenaltyRulesService_1 = class PenaltyRulesService {
    constructor(penaltyRulesRepository, penaltyRuleEntityRepository) {
        this.penaltyRulesRepository = penaltyRulesRepository;
        this.penaltyRuleEntityRepository = penaltyRuleEntityRepository;
        this.logger = new common_1.Logger(PenaltyRulesService_1.name);
    }
    async create(createPenaltyRuleDto) {
        try {
            const existingRule = await this.penaltyRulesRepository.findByViolationType(createPenaltyRuleDto.violation_type);
            if (existingRule) {
                return (0, createResponse_1.createResponse)('DuplicatedRecord', null, 'Penalty rule with this violation type already exists');
            }
            const newRule = await this.penaltyRulesRepository.create(createPenaltyRuleDto);
            return (0, createResponse_1.createResponse)('OK', newRule, 'Penalty rule created successfully');
        }
        catch (error) {
            return this.handleError('Error creating penalty rule:', error);
        }
    }
    async findAll() {
        try {
            const rules = await this.penaltyRuleEntityRepository.find();
            return (0, createResponse_1.createResponse)('OK', rules, 'Fetched all penalty rules');
        }
        catch (error) {
            return this.handleError('Error fetching penalty rules:', error);
        }
    }
    async findOne(id) {
        try {
            const rule = await this.penaltyRulesRepository.findById(id);
            return this.handleRuleResponse(rule);
        }
        catch (error) {
            return this.handleError('Error fetching penalty rule:', error);
        }
    }
    async update(id, updatePenaltyRuleDto) {
        try {
            const rule = await this.penaltyRulesRepository.findById(id);
            if (!rule) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Penalty rule not found');
            }
            const updatedRule = await this.penaltyRulesRepository.update(id, updatePenaltyRuleDto);
            return (0, createResponse_1.createResponse)('OK', updatedRule, 'Penalty rule updated successfully');
        }
        catch (error) {
            return this.handleError('Error updating penalty rule:', error);
        }
    }
    async remove(id) {
        try {
            const deletedRule = await this.penaltyRulesRepository.remove(id);
            if (!deletedRule) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Penalty rule not found');
            }
            return (0, createResponse_1.createResponse)('OK', null, 'Penalty rule deleted successfully');
        }
        catch (error) {
            return this.handleError('Error deleting penalty rule:', error);
        }
    }
    async findAllPaginated(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [items, total] = await this.penaltyRulesRepository.findAllPaginated(skip, limit);
            const totalPages = Math.ceil(total / limit);
            return (0, createResponse_1.createResponse)('OK', {
                totalPages,
                currentPage: page,
                totalItems: total,
                items
            });
        }
        catch (error) {
            this.logger.error(`Error fetching paginated penalty rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return (0, createResponse_1.createResponse)('ServerError', null);
        }
    }
    handleRuleResponse(rule) {
        if (!rule) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'Penalty rule not found');
        }
        return (0, createResponse_1.createResponse)('OK', rule, 'Penalty rule retrieved successfully');
    }
    handleError(message, error) {
        console.error(message, error);
        return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while processing your request');
    }
};
exports.PenaltyRulesService = PenaltyRulesService;
exports.PenaltyRulesService = PenaltyRulesService = PenaltyRulesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(penalty_rule_entity_1.PenaltyRule)),
    __metadata("design:paramtypes", [penalty_rules_repository_1.PenaltyRulesRepository,
        typeorm_2.Repository])
], PenaltyRulesService);
//# sourceMappingURL=penalty-rules.service.js.map