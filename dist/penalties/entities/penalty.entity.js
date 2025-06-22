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
exports.Penalty = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const driver_entity_1 = require("../../drivers/entities/driver.entity");
const customer_care_entity_1 = require("../../customer_cares/entities/customer_care.entity");
const restaurant_entity_1 = require("../../restaurants/entities/restaurant.entity");
const admin_entity_1 = require("../../admin/entities/admin.entity");
const penalty_rule_entity_1 = require("../../penalty-rules/entities/penalty-rule.entity");
let Penalty = class Penalty {
    generateId() {
        this.id = `FF_PEN_${(0, uuid_1.v4)()}`;
        this.created_at = Math.floor(Date.now() / 1000);
        this.issued_at = Math.floor(Date.now() / 1000);
    }
};
exports.Penalty = Penalty;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar' }),
    __metadata("design:type", String)
], Penalty.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Penalty.prototype, "driver_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => driver_entity_1.Driver, driver => driver.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'driver_id' }),
    __metadata("design:type", driver_entity_1.Driver)
], Penalty.prototype, "driver", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Penalty.prototype, "customer_care_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_care_entity_1.CustomerCare, cc => cc.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_care_id' }),
    __metadata("design:type", customer_care_entity_1.CustomerCare)
], Penalty.prototype, "customer_care", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Penalty.prototype, "restaurant_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_entity_1.Restaurant, restaurant => restaurant.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'restaurant_id' }),
    __metadata("design:type", restaurant_entity_1.Restaurant)
], Penalty.prototype, "restaurant", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Penalty.prototype, "penaltied_by_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_entity_1.Admin, admin => admin.id, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'penaltied_by_id' }),
    __metadata("design:type", admin_entity_1.Admin)
], Penalty.prototype, "penaltied_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Penalty.prototype, "rule_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => penalty_rule_entity_1.PenaltyRule, rule => rule.id, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'rule_id' }),
    __metadata("design:type", penalty_rule_entity_1.PenaltyRule)
], Penalty.prototype, "rule", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Penalty.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Penalty.prototype, "penalty_points", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Penalty.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Penalty.prototype, "issued_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], Penalty.prototype, "expires_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Penalty.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Penalty.prototype, "generateId", null);
exports.Penalty = Penalty = __decorate([
    (0, typeorm_1.Entity)('penalties')
], Penalty);
//# sourceMappingURL=penalty.entity.js.map