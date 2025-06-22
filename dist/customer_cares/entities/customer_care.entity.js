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
exports.CustomerCare = void 0;
const admin_entity_1 = require("../../admin/entities/admin.entity");
const customer_care_inquiry_entity_1 = require("../../customer_cares_inquires/entities/customer_care_inquiry.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
let CustomerCare = class CustomerCare {
    generateId() {
        this.id = `FF_CC_${(0, uuid_1.v4)()}`;
        const now = Math.floor(Date.now() / 1000);
        this.created_at = now;
        this.updated_at = now;
        this.active_point = 0;
        this.active_workload = 0;
    }
};
exports.CustomerCare = CustomerCare;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], CustomerCare.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], CustomerCare.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Array)
], CustomerCare.prototype, "contact_email", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Array)
], CustomerCare.prototype, "contact_phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomerCare.prototype, "first_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomerCare.prototype, "last_name", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => customer_care_inquiry_entity_1.CustomerCareInquiry, inquiry => inquiry.assigned_customer_care),
    __metadata("design:type", Array)
], CustomerCare.prototype, "assigned_tickets", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: () => 'EXTRACT(EPOCH FROM NOW())' }),
    __metadata("design:type", Number)
], CustomerCare.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: () => 'EXTRACT(EPOCH FROM NOW())' }),
    __metadata("design:type", Number)
], CustomerCare.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'bigint',
        default: () => 'EXTRACT(EPOCH FROM NOW())'
    }),
    __metadata("design:type", Number)
], CustomerCare.prototype, "last_login", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], CustomerCare.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CustomerCare.prototype, "available_for_work", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CustomerCare.prototype, "is_assigned", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], CustomerCare.prototype, "active_point", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], CustomerCare.prototype, "active_workload", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => admin_entity_1.Admin, admin => admin.assigned_customer_care),
    __metadata("design:type", Array)
], CustomerCare.prototype, "admins", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomerCare.prototype, "generateId", null);
exports.CustomerCare = CustomerCare = __decorate([
    (0, typeorm_1.Entity)('customer_cares')
], CustomerCare);
//# sourceMappingURL=customer_care.entity.js.map