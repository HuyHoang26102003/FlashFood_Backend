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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceRule = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const admin_entity_1 = require("../../admin/entities/admin.entity");
let FinanceRule = class FinanceRule {
    generateId() {
        this.id = `FF_FIN_${(0, uuid_1.v4)()}`;
        this.created_at = Math.floor(Date.now() / 1000);
    }
};
exports.FinanceRule = FinanceRule;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar' }),
    __metadata("design:type", String)
], FinanceRule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Object)
], FinanceRule.prototype, "driver_fixed_wage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], FinanceRule.prototype, "customer_care_hourly_wage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], FinanceRule.prototype, "app_service_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], FinanceRule.prototype, "restaurant_commission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], FinanceRule.prototype, "created_by_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_entity_1.Admin),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_id', referencedColumnName: 'id' }),
    __metadata("design:type", admin_entity_1.Admin)
], FinanceRule.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], FinanceRule.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], FinanceRule.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], FinanceRule.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinanceRule.prototype, "generateId", null);
exports.FinanceRule = FinanceRule = __decorate([
    (0, typeorm_1.Entity)('finance_rules')
], FinanceRule);
//# sourceMappingURL=finance_rule.entity.js.map