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
exports.FAQ = exports.FAQTargetUser = exports.FAQType = exports.FAQStatus = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
var FAQStatus;
(function (FAQStatus) {
    FAQStatus["ACTIVE"] = "ACTIVE";
    FAQStatus["DRAFT"] = "DRAFT";
    FAQStatus["ARCHIVED"] = "ARCHIVED";
})(FAQStatus || (exports.FAQStatus = FAQStatus = {}));
var FAQType;
(function (FAQType) {
    FAQType["GENERAL"] = "GENERAL";
    FAQType["ACCOUNT"] = "ACCOUNT";
    FAQType["PAYMENT"] = "PAYMENT";
    FAQType["SERVICE"] = "SERVICE";
})(FAQType || (exports.FAQType = FAQType = {}));
var FAQTargetUser;
(function (FAQTargetUser) {
    FAQTargetUser["DRIVER"] = "DRIVER";
    FAQTargetUser["RESTAURANT"] = "RESTAURANT";
    FAQTargetUser["CUSTOMER"] = "CUSTOMER";
    FAQTargetUser["CUSTOMER_CARE"] = "CUSTOMER_CARE";
})(FAQTargetUser || (exports.FAQTargetUser = FAQTargetUser = {}));
let FAQ = class FAQ {
    generateId() {
        this.id = `FF_FAQ_${(0, uuid_1.v4)()}`;
        this.created_at = Math.floor(Date.now() / 1000);
    }
};
exports.FAQ = FAQ;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar' }),
    __metadata("design:type", String)
], FAQ.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FAQ.prototype, "question", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], FAQ.prototype, "answer", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FAQType,
        default: FAQType.GENERAL
    }),
    __metadata("design:type", String)
], FAQ.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FAQStatus,
        default: FAQStatus.DRAFT
    }),
    __metadata("design:type", String)
], FAQ.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FAQTargetUser,
        array: true,
        default: []
    }),
    __metadata("design:type", Array)
], FAQ.prototype, "target_user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], FAQ.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], FAQ.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FAQ.prototype, "generateId", null);
exports.FAQ = FAQ = __decorate([
    (0, typeorm_1.Entity)('faqs')
], FAQ);
//# sourceMappingURL=faq.entity.js.map