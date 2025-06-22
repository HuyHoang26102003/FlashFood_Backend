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
var FinanceRulesRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceRulesRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const finance_rule_entity_1 = require("./entities/finance_rule.entity");
let FinanceRulesRepository = FinanceRulesRepository_1 = class FinanceRulesRepository {
    constructor(financeRuleEntityRepository) {
        this.financeRuleEntityRepository = financeRuleEntityRepository;
        this.logger = new common_1.Logger(FinanceRulesRepository_1.name);
    }
    async findById(id) {
        try {
            return await this.financeRuleEntityRepository.findOne({
                where: { id }
            });
        }
        catch (error) {
            this.logger.error(`Error finding finance rule by id: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async findAll(query = {}) {
        try {
            return await this.financeRuleEntityRepository
                .createQueryBuilder('FinanceRule')
                .leftJoinAndSelect('FinanceRule.created_by', 'created_by')
                .select([
                'FinanceRule.id',
                'FinanceRule.driver_fixed_wage',
                'FinanceRule.customer_care_hourly_wage',
                'FinanceRule.app_service_fee',
                'FinanceRule.restaurant_commission',
                'FinanceRule.created_by_id',
                'FinanceRule.description',
                'FinanceRule.created_at',
                'FinanceRule.updated_at',
                'created_by.id',
                'created_by.user_id',
                'created_by.role',
                'created_by.avatar',
                'created_by.permissions',
                'created_by.last_active',
                'created_by.created_at',
                'created_by.updated_at',
                'created_by.first_name',
                'created_by.last_name',
                'created_by.status'
            ])
                .where(query)
                .orderBy('FinanceRule.created_at', 'DESC')
                .getMany();
        }
        catch (error) {
            throw error;
        }
    }
    async create(createFinanceRuleDto) {
        try {
            const financeRule = this.financeRuleEntityRepository.create(createFinanceRuleDto);
            return await this.financeRuleEntityRepository.save(financeRule);
        }
        catch (error) {
            this.logger.error(`Error creating finance rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async update(id, updateFinanceRuleDto) {
        try {
            await this.financeRuleEntityRepository.update(id, {
                ...updateFinanceRuleDto,
                updated_at: Math.floor(Date.now() / 1000)
            });
            return await this.findById(id);
        }
        catch (error) {
            this.logger.error(`Error updating finance rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async remove(id) {
        try {
            const financeRule = await this.findById(id);
            if (financeRule) {
                await this.financeRuleEntityRepository.delete(id);
            }
            return financeRule;
        }
        catch (error) {
            this.logger.error(`Error removing finance rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async findAllPaginated(skip, limit) {
        try {
            return await this.financeRuleEntityRepository.findAndCount({
                skip,
                take: limit,
                order: { created_at: 'DESC' }
            });
        }
        catch (error) {
            this.logger.error(`Error finding paginated finance rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
};
exports.FinanceRulesRepository = FinanceRulesRepository;
exports.FinanceRulesRepository = FinanceRulesRepository = FinanceRulesRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(finance_rule_entity_1.FinanceRule)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FinanceRulesRepository);
//# sourceMappingURL=finance_rules.repository.js.map