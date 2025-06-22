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
var FinanceRulesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceRulesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const finance_rule_entity_1 = require("./entities/finance_rule.entity");
const finance_rules_repository_1 = require("./finance_rules.repository");
const createResponse_1 = require("../utils/createResponse");
const admin_repository_1 = require("../admin/admin.repository");
let FinanceRulesService = FinanceRulesService_1 = class FinanceRulesService {
    constructor(financeRulesRepository, adminRepository, financeRuleEntityRepository) {
        this.financeRulesRepository = financeRulesRepository;
        this.adminRepository = adminRepository;
        this.financeRuleEntityRepository = financeRuleEntityRepository;
        this.logger = new common_1.Logger(FinanceRulesService_1.name);
    }
    async create(createFinanceRuleDto) {
        try {
            const admin = await this.adminRepository.findById(createFinanceRuleDto.created_by_id);
            if (!admin) {
                return (0, createResponse_1.createResponse)('NotFound', null, `Admin with ID ${createFinanceRuleDto.created_by_id} not found`);
            }
            const newFinanceRule = await this.financeRulesRepository.create(createFinanceRuleDto);
            return (0, createResponse_1.createResponse)('OK', newFinanceRule, 'Finance rule created successfully');
        }
        catch (error) {
            return this.handleError('Error creating finance rule:', error);
        }
    }
    async findAll() {
        try {
            const financeRules = await this.financeRulesRepository.findAll();
            return (0, createResponse_1.createResponse)('OK', financeRules, 'Fetched all finance rules');
        }
        catch (error) {
            return this.handleError('Error fetching finance rules:', error);
        }
    }
    async findOne(id) {
        try {
            const financeRule = await this.financeRulesRepository.findById(id);
            return this.handleFinanceRuleResponse(financeRule);
        }
        catch (error) {
            return this.handleError('Error fetching finance rule:', error);
        }
    }
    async findOneLatest() {
        try {
            const latestFinanceRule = await this.financeRuleEntityRepository
                .createQueryBuilder('financeRule')
                .orderBy('financeRule.created_at', 'DESC')
                .getOne();
            return this.handleFinanceRuleResponse(latestFinanceRule);
        }
        catch (error) {
            return this.handleError('Error fetching latest finance rule:', error);
        }
    }
    async update(id, updateFinanceRuleDto) {
        try {
            const financeRule = await this.financeRulesRepository.findById(id);
            if (!financeRule) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Finance rule not found');
            }
            const updatedFinanceRule = await this.financeRulesRepository.update(id, updateFinanceRuleDto);
            return (0, createResponse_1.createResponse)('OK', updatedFinanceRule, 'Finance rule updated successfully');
        }
        catch (error) {
            return this.handleError('Error updating finance rule:', error);
        }
    }
    async remove(id) {
        try {
            const deletedFinanceRule = await this.financeRulesRepository.remove(id);
            if (!deletedFinanceRule) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Finance rule not found');
            }
            return (0, createResponse_1.createResponse)('OK', null, 'Finance rule deleted successfully');
        }
        catch (error) {
            return this.handleError('Error deleting finance rule:', error);
        }
    }
    async findAllPaginated(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [items, total] = await this.financeRulesRepository.findAllPaginated(skip, limit);
            const totalPages = Math.ceil(total / limit);
            return (0, createResponse_1.createResponse)('OK', {
                totalPages,
                currentPage: page,
                totalItems: total,
                items
            });
        }
        catch (error) {
            this.logger.error(`Error fetching paginated finance rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return (0, createResponse_1.createResponse)('ServerError', null);
        }
    }
    handleFinanceRuleResponse(financeRule) {
        if (!financeRule) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'Finance rule not found');
        }
        return (0, createResponse_1.createResponse)('OK', financeRule, 'Finance rule retrieved successfully');
    }
    handleError(message, error) {
        console.error(message, error);
        return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while processing your request');
    }
};
exports.FinanceRulesService = FinanceRulesService;
exports.FinanceRulesService = FinanceRulesService = FinanceRulesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(finance_rule_entity_1.FinanceRule)),
    __metadata("design:paramtypes", [finance_rules_repository_1.FinanceRulesRepository,
        admin_repository_1.AdminRepository,
        typeorm_2.Repository])
], FinanceRulesService);
//# sourceMappingURL=finance_rules.service.js.map