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
exports.FinanceRulesController = void 0;
const common_1 = require("@nestjs/common");
const finance_rules_service_1 = require("./finance_rules.service");
const create_finance_rule_dto_1 = require("./dto/create-finance_rule.dto");
const update_finance_rule_dto_1 = require("./dto/update-finance_rule.dto");
let FinanceRulesController = class FinanceRulesController {
    constructor(financeRulesService) {
        this.financeRulesService = financeRulesService;
    }
    create(createFinanceRuleDto) {
        return this.financeRulesService.create(createFinanceRuleDto);
    }
    findAll() {
        return this.financeRulesService.findAll();
    }
    findAllPaginated(page = '1', limit = '10') {
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        return this.financeRulesService.findAllPaginated(parsedPage, parsedLimit);
    }
    findOne(id) {
        return this.financeRulesService.findOne(id);
    }
    update(id, updateFinanceRuleDto) {
        return this.financeRulesService.update(id, updateFinanceRuleDto);
    }
    remove(id) {
        return this.financeRulesService.remove(id);
    }
};
exports.FinanceRulesController = FinanceRulesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_finance_rule_dto_1.CreateFinanceRuleDto]),
    __metadata("design:returntype", void 0)
], FinanceRulesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinanceRulesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('paginated'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinanceRulesController.prototype, "findAllPaginated", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceRulesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_finance_rule_dto_1.UpdateFinanceRuleDto]),
    __metadata("design:returntype", void 0)
], FinanceRulesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceRulesController.prototype, "remove", null);
exports.FinanceRulesController = FinanceRulesController = __decorate([
    (0, common_1.Controller)('finance-rules'),
    __metadata("design:paramtypes", [finance_rules_service_1.FinanceRulesService])
], FinanceRulesController);
//# sourceMappingURL=finance_rules.controller.js.map