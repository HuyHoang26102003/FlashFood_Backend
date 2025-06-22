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
exports.UpdateCustomerCareInquiryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_customer_care_inquiry_dto_1 = require("./create-customer-care-inquiry.dto");
const class_validator_1 = require("class-validator");
class UpdateCustomerCareInquiryDto extends (0, mapped_types_1.PartialType)(create_customer_care_inquiry_dto_1.CreateCustomerCareInquiryDto) {
}
exports.UpdateCustomerCareInquiryDto = UpdateCustomerCareInquiryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCustomerCareInquiryDto.prototype, "assigned_customer_care_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerCareInquiryDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerCareInquiryDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)([
        'ACCOUNT',
        'PAYMENT',
        'PRODUCT',
        'DELIVERY',
        'REFUND',
        'TECHNICAL',
        'OTHER'
    ]),
    __metadata("design:type", String)
], UpdateCustomerCareInquiryDto.prototype, "issue_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATE']),
    __metadata("design:type", String)
], UpdateCustomerCareInquiryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerCareInquiryDto.prototype, "assigned_to", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    __metadata("design:type", String)
], UpdateCustomerCareInquiryDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)([
        'REFUND',
        'REPLACEMENT',
        'INVESTIGATING',
        'ACCOUNT_FIX',
        'TECHNICAL_SUPPORT',
        'OTHER'
    ]),
    __metadata("design:type", String)
], UpdateCustomerCareInquiryDto.prototype, "resolution_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCustomerCareInquiryDto.prototype, "resolved_at", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerCareInquiryDto.prototype, "resolution_notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['ADMIN', 'CUSTOMER_CARE']),
    __metadata("design:type", String)
], UpdateCustomerCareInquiryDto.prototype, "assignee_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateCustomerCareInquiryDto.prototype, "escalation_history", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateCustomerCareInquiryDto.prototype, "rejection_history", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateCustomerCareInquiryDto.prototype, "transfer_history", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCustomerCareInquiryDto.prototype, "escalation_count", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCustomerCareInquiryDto.prototype, "rejection_count", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCustomerCareInquiryDto.prototype, "transfer_count", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCustomerCareInquiryDto.prototype, "response_time", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCustomerCareInquiryDto.prototype, "resolution_time", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCustomerCareInquiryDto.prototype, "first_response_at", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCustomerCareInquiryDto.prototype, "last_response_at", void 0);
//# sourceMappingURL=update-customer-care-inquiry.dto.js.map