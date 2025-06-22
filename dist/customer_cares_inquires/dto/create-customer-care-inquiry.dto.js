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
exports.CreateCustomerCareInquiryDto = void 0;
const class_validator_1 = require("class-validator");
class CreateCustomerCareInquiryDto {
    constructor() {
        this.issue_type = 'OTHER';
        this.assignee_type = 'CUSTOMER_CARE';
    }
}
exports.CreateCustomerCareInquiryDto = CreateCustomerCareInquiryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerCareInquiryDto.prototype, "customer_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerCareInquiryDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerCareInquiryDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)([
        'ACCOUNT',
        'PAYMENT',
        'PRODUCT',
        'DELIVERY',
        'REFUND',
        'TECHNICAL',
        'OTHER'
    ]),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerCareInquiryDto.prototype, "issue_type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATE']),
    __metadata("design:type", String)
], CreateCustomerCareInquiryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerCareInquiryDto.prototype, "order_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerCareInquiryDto.prototype, "assigned_to", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['ADMIN', 'CUSTOMER_CARE']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerCareInquiryDto.prototype, "assignee_type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerCareInquiryDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsEnum)([
        'REFUND',
        'REPLACEMENT',
        'INVESTIGATING',
        'ACCOUNT_FIX',
        'TECHNICAL_SUPPORT',
        'OTHER'
    ]),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerCareInquiryDto.prototype, "resolution_type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerCareInquiryDto.prototype, "resolution_notes", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateCustomerCareInquiryDto.prototype, "escalation_history", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateCustomerCareInquiryDto.prototype, "rejection_history", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateCustomerCareInquiryDto.prototype, "transfer_history", void 0);
//# sourceMappingURL=create-customer-care-inquiry.dto.js.map