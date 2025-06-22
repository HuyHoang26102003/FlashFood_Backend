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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerCareInquiriesController = void 0;
const common_1 = require("@nestjs/common");
const customer_cares_inquires_service_1 = require("./customer_cares_inquires.service");
const create_customer_care_inquiry_dto_1 = require("./dto/create-customer-care-inquiry.dto");
const update_customer_care_inquiry_dto_1 = require("./dto/update-customer-care-inquiry.dto");
let CustomerCareInquiriesController = class CustomerCareInquiriesController {
    constructor(service) {
        this.service = service;
    }
    create(createDto) {
        return this.service.create(createDto);
    }
    findAll() {
        return this.service.findAll();
    }
    findAllPaginated(page = '1', limit = '10') {
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        return this.service.findAllPaginated(parsedPage, parsedLimit);
    }
    findAllInquiriesByCCId(ccId) {
        return this.service.findAllInquiriesByCCId(ccId);
    }
    findAllInquiriesByCustomerId(customerId) {
        return this.service.findAllInquiriesByCustomerId(customerId);
    }
    findAllEscalatedInquiries() {
        return this.service.findAllEscalatedInquiries();
    }
    findOne(id) {
        return this.service.findById(id);
    }
    update(id, updateDto) {
        return this.service.update(id, updateDto);
    }
    remove(id) {
        return this.service.remove(id);
    }
    escalateInquiry(id, data) {
        return this.service.escalateInquiry(id, data.customerCareId, data.reason, data.escalatedTo, data.escalatedToId);
    }
    rejectInquiry(id, data) {
        return this.service.rejectInquiry(id, data.customerCareId, data.reason);
    }
    transferInquiry(id, data) {
        return this.service.transferInquiry(id, data.fromCustomerCareId, data.toCustomerCareId, data.reason);
    }
    recordResponse(id) {
        return this.service.recordResponse(id);
    }
    resolveInquiry(id, data) {
        return this.service.resolveInquiry(id, data.resolutionType, data.resolutionNotes);
    }
};
exports.CustomerCareInquiriesController = CustomerCareInquiriesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_care_inquiry_dto_1.CreateCustomerCareInquiryDto]),
    __metadata("design:returntype", void 0)
], CustomerCareInquiriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomerCareInquiriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('paginated'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CustomerCareInquiriesController.prototype, "findAllPaginated", null);
__decorate([
    (0, common_1.Get)('customer-care/:ccId'),
    __param(0, (0, common_1.Param)('ccId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerCareInquiriesController.prototype, "findAllInquiriesByCCId", null);
__decorate([
    (0, common_1.Get)('customer/:customerId'),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerCareInquiriesController.prototype, "findAllInquiriesByCustomerId", null);
__decorate([
    (0, common_1.Get)('escalated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomerCareInquiriesController.prototype, "findAllEscalatedInquiries", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerCareInquiriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_customer_care_inquiry_dto_1.UpdateCustomerCareInquiryDto]),
    __metadata("design:returntype", void 0)
], CustomerCareInquiriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerCareInquiriesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/escalate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CustomerCareInquiriesController.prototype, "escalateInquiry", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CustomerCareInquiriesController.prototype, "rejectInquiry", null);
__decorate([
    (0, common_1.Post)(':id/transfer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CustomerCareInquiriesController.prototype, "transferInquiry", null);
__decorate([
    (0, common_1.Post)(':id/record-response'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerCareInquiriesController.prototype, "recordResponse", null);
__decorate([
    (0, common_1.Post)(':id/resolve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CustomerCareInquiriesController.prototype, "resolveInquiry", null);
exports.CustomerCareInquiriesController = CustomerCareInquiriesController = __decorate([
    (0, common_1.Controller)('customer-care-inquiries'),
    __metadata("design:paramtypes", [customer_cares_inquires_service_1.CustomerCareInquiriesService])
], CustomerCareInquiriesController);
//# sourceMappingURL=customer_cares_inquires.controller.js.map