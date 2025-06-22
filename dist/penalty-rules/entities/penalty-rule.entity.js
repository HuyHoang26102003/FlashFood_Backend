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
exports.PenaltyRule = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
let PenaltyRule = class PenaltyRule {
    generateId() {
        this.id = `FF_PRULE_${(0, uuid_1.v4)()}`;
        this.created_at = Math.floor(Date.now() / 1000);
        this.updated_at = Math.floor(Date.now() / 1000);
    }
};
exports.PenaltyRule = PenaltyRule;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar' }),
    __metadata("design:type", String)
], PenaltyRule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', unique: true }),
    __metadata("design:type", String)
], PenaltyRule.prototype, "violation_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PenaltyRule.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PenaltyRule.prototype, "default_penalty_points", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], PenaltyRule.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], PenaltyRule.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PenaltyRule.prototype, "generateId", null);
exports.PenaltyRule = PenaltyRule = __decorate([
    (0, typeorm_1.Entity)('penalty_rules')
], PenaltyRule);
//# sourceMappingURL=penalty-rule.entity.js.map