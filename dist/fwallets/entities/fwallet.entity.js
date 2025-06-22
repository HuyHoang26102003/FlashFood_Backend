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
exports.FWallet = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const user_entity_1 = require("../../users/entities/user.entity");
let FWallet = class FWallet {
    generateId() {
        this.id = `F_WALLET_${(0, uuid_1.v4)()}`;
        this.created_at = Math.floor(Date.now() / 1000);
        this.updated_at = Math.floor(Date.now() / 1000);
    }
};
exports.FWallet = FWallet;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar' }),
    __metadata("design:type", String)
], FWallet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_fwallet_user_id'),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FWallet.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.fwallets),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], FWallet.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], FWallet.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FWallet.prototype, "first_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FWallet.prototype, "last_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], FWallet.prototype, "is_verified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: () => 'EXTRACT(EPOCH FROM NOW())' }),
    __metadata("design:type", Number)
], FWallet.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: () => 'EXTRACT(EPOCH FROM NOW())' }),
    __metadata("design:type", Number)
], FWallet.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FWallet.prototype, "generateId", null);
__decorate([
    (0, typeorm_1.VersionColumn)(),
    __metadata("design:type", Number)
], FWallet.prototype, "version", void 0);
exports.FWallet = FWallet = __decorate([
    (0, typeorm_1.Entity)('fwallets')
], FWallet);
//# sourceMappingURL=fwallet.entity.js.map