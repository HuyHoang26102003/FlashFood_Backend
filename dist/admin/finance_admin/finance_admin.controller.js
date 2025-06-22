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
exports.FinanceAdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("../admin.service");
const promotions_service_1 = require("../../promotions/promotions.service");
const create_admin_dto_1 = require("../dto/create-admin.dto");
const update_admin_dto_1 = require("../dto/update-admin.dto");
const create_promotion_dto_1 = require("../../promotions/dto/create-promotion.dto");
const update_promotion_dto_1 = require("../../promotions/dto/update-promotion.dto");
const admin_1 = require("../../utils/types/admin");
let FinanceAdminController = class FinanceAdminController {
    constructor(adminService, promotionsService) {
        this.adminService = adminService;
        this.promotionsService = promotionsService;
    }
    createFinanceAdmin(createAdminDto) {
        createAdminDto.role = admin_1.AdminRole.FINANCE_ADMIN;
        return this.adminService.create(createAdminDto);
    }
    findAllFinanceAdmins() {
        return this.adminService.findAll();
    }
    findAllPromotions() {
        return this.promotionsService.findAll();
    }
    findOneFinanceAdmin(id) {
        return this.adminService.findOne(id);
    }
    updateFinanceAdmin(id, updateAdminDto) {
        updateAdminDto.role = admin_1.AdminRole.FINANCE_ADMIN;
        return this.adminService.update(id, updateAdminDto);
    }
    removeFinanceAdmin(id) {
        return this.adminService.remove(id);
    }
    createPromotion(createPromotionDto) {
        return this.promotionsService.create(createPromotionDto);
    }
    findOnePromotion(id) {
        return this.promotionsService.findOne(id);
    }
    updatePromotion(id, updatePromotionDto) {
        return this.promotionsService.update(id, updatePromotionDto);
    }
    removePromotion(id) {
        return this.promotionsService.remove(id);
    }
};
exports.FinanceAdminController = FinanceAdminController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_dto_1.CreateAdminDto]),
    __metadata("design:returntype", void 0)
], FinanceAdminController.prototype, "createFinanceAdmin", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinanceAdminController.prototype, "findAllFinanceAdmins", null);
__decorate([
    (0, common_1.Get)('promotions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinanceAdminController.prototype, "findAllPromotions", null);
__decorate([
    (0, common_1.Get)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceAdminController.prototype, "findOneFinanceAdmin", null);
__decorate([
    (0, common_1.Patch)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_admin_dto_1.UpdateAdminDto]),
    __metadata("design:returntype", void 0)
], FinanceAdminController.prototype, "updateFinanceAdmin", null);
__decorate([
    (0, common_1.Delete)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceAdminController.prototype, "removeFinanceAdmin", null);
__decorate([
    (0, common_1.Post)('promotions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_promotion_dto_1.CreatePromotionDto]),
    __metadata("design:returntype", void 0)
], FinanceAdminController.prototype, "createPromotion", null);
__decorate([
    (0, common_1.Get)('promotions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceAdminController.prototype, "findOnePromotion", null);
__decorate([
    (0, common_1.Patch)('promotions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_promotion_dto_1.UpdatePromotionDto]),
    __metadata("design:returntype", void 0)
], FinanceAdminController.prototype, "updatePromotion", null);
__decorate([
    (0, common_1.Delete)('promotions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceAdminController.prototype, "removePromotion", null);
exports.FinanceAdminController = FinanceAdminController = __decorate([
    (0, common_1.Controller)('finance-admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        promotions_service_1.PromotionsService])
], FinanceAdminController);
//# sourceMappingURL=finance_admin.controller.js.map