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
exports.Transaction = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const user_entity_1 = require("../../users/entities/user.entity");
const fwallet_entity_1 = require("../../fwallets/entities/fwallet.entity");
let Transaction = class Transaction {
    generateId() {
        this.id = `FF_TRANSACTION_${(0, uuid_1.v4)()}`;
        const now = Math.floor(Date.now() / 1000);
        this.created_at = now;
        this.updated_at = now;
        if (!this.timestamp) {
            this.timestamp = now;
        }
    }
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Transaction.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Transaction.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Transaction.prototype, "fwallet_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fwallet_entity_1.FWallet),
    (0, typeorm_1.JoinColumn)({ name: 'fwallet_id' }),
    __metadata("design:type", fwallet_entity_1.FWallet)
], Transaction.prototype, "fwallet", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['DEPOSIT', 'WITHDRAW', 'PURCHASE', 'REFUND']
    }),
    __metadata("design:type", String)
], Transaction.prototype, "transaction_type", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Transaction.prototype, "balance_after", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['PENDING', 'CANCELLED', 'FAILED', 'COMPLETED'],
        default: 'PENDING'
    }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Transaction.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['MOMO', 'FWALLET']
    }),
    __metadata("design:type", String)
], Transaction.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Transaction.prototype, "destination", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['FWALLET', 'TEMPORARY_WALLET_BALANCE'],
        default: 'FWALLET'
    }),
    __metadata("design:type", String)
], Transaction.prototype, "destination_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "order_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "reference_order_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Transaction.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Transaction.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Transaction.prototype, "generateId", null);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)('transactions'),
    (0, typeorm_1.Unique)([
        'reference_order_id',
        'transaction_type',
        'source',
        'destination_type'
    ])
], Transaction);
//# sourceMappingURL=transaction.entity.js.map