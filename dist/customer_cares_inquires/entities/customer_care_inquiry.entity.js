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
exports.CustomerCareInquiry = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const admin_entity_1 = require("../../admin/entities/admin.entity");
const customer_care_entity_1 = require("../../customer_cares/entities/customer_care.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
let CustomerCareInquiry = class CustomerCareInquiry {
    generateId() {
        this.id = `FF_INQ_${(0, uuid_1.v4)()}`;
        const now = Math.floor(Date.now() / 1000);
        this.created_at = now;
        this.updated_at = now;
    }
};
exports.CustomerCareInquiry = CustomerCareInquiry;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar' }),
    __metadata("design:type", String)
], CustomerCareInquiry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CustomerCareInquiry.prototype, "customer_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], CustomerCareInquiry.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomerCareInquiry.prototype, "assigned_admin_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_entity_1.Admin, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_admin_id', referencedColumnName: 'id' }),
    __metadata("design:type", admin_entity_1.Admin)
], CustomerCareInquiry.prototype, "assigned_admin", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomerCareInquiry.prototype, "assigned_customer_care_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_care_entity_1.CustomerCare, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_customer_care_id', referencedColumnName: 'id' }),
    __metadata("design:type", customer_care_entity_1.CustomerCare)
], CustomerCareInquiry.prototype, "assigned_customer_care", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['ADMIN', 'CUSTOMER_CARE'],
        default: 'CUSTOMER_CARE'
    }),
    __metadata("design:type", String)
], CustomerCareInquiry.prototype, "assignee_type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CustomerCareInquiry.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CustomerCareInquiry.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [
            'ACCOUNT',
            'PAYMENT',
            'PRODUCT',
            'DELIVERY',
            'REFUND',
            'TECHNICAL',
            'OTHER'
        ],
        default: 'OTHER'
    }),
    __metadata("design:type", String)
], CustomerCareInquiry.prototype, "issue_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATE'],
        default: 'OPEN'
    }),
    __metadata("design:type", String)
], CustomerCareInquiry.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM'
    }),
    __metadata("design:type", String)
], CustomerCareInquiry.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [
            'REFUND',
            'REPLACEMENT',
            'INVESTIGATING',
            'ACCOUNT_FIX',
            'TECHNICAL_SUPPORT',
            'OTHER'
        ],
        nullable: true
    }),
    __metadata("design:type", String)
], CustomerCareInquiry.prototype, "resolution_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], CustomerCareInquiry.prototype, "escalation_history", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], CustomerCareInquiry.prototype, "rejection_history", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], CustomerCareInquiry.prototype, "transfer_history", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CustomerCareInquiry.prototype, "escalation_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CustomerCareInquiry.prototype, "rejection_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CustomerCareInquiry.prototype, "transfer_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CustomerCareInquiry.prototype, "response_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CustomerCareInquiry.prototype, "resolution_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomerCareInquiry.prototype, "order_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_entity_1.Order, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'order_id', referencedColumnName: 'id' }),
    __metadata("design:type", order_entity_1.Order)
], CustomerCareInquiry.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CustomerCareInquiry.prototype, "resolution_notes", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CustomerCareInquiry.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CustomerCareInquiry.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CustomerCareInquiry.prototype, "resolved_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CustomerCareInquiry.prototype, "first_response_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CustomerCareInquiry.prototype, "last_response_at", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomerCareInquiry.prototype, "generateId", null);
exports.CustomerCareInquiry = CustomerCareInquiry = __decorate([
    (0, typeorm_1.Entity)('customer_care_inquiries')
], CustomerCareInquiry);
//# sourceMappingURL=customer_care_inquiry.entity.js.map