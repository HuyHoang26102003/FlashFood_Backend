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
exports.UpdateTransactionDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_transaction_dto_1 = require("./create-transaction.dto");
const class_validator_1 = require("class-validator");
class UpdateTransactionDto extends (0, mapped_types_1.PartialType)(create_transaction_dto_1.CreateTransactionDto) {
}
exports.UpdateTransactionDto = UpdateTransactionDto;
__decorate([
    (0, class_validator_1.IsEnum)(['DEPOSIT', 'WITHDRAW', 'PURCHASE', 'REFUND']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "transaction_type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateTransactionDto.prototype, "balance_after", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['PENDING', 'CANCELLED', 'FAILED', 'COMPLETED']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['MOMO', 'FWALLET']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "source", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "destination", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateTransactionDto.prototype, "updated_at", void 0);
//# sourceMappingURL=update-transaction.dto.js.map