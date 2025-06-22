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
exports.PenaltiesController = void 0;
const common_1 = require("@nestjs/common");
const penalties_service_1 = require("./penalties.service");
const create_penalty_dto_1 = require("./dto/create-penalty.dto");
const update_penalty_dto_1 = require("./dto/update-penalty.dto");
let PenaltiesController = class PenaltiesController {
    constructor(penaltiesService) {
        this.penaltiesService = penaltiesService;
    }
    create(createPenaltyDto) {
        return this.penaltiesService.create(createPenaltyDto);
    }
    findAll() {
        return this.penaltiesService.findAll();
    }
    findAllPaginated(page = '1', limit = '10') {
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        return this.penaltiesService.findAllPaginated(parsedPage, parsedLimit);
    }
    async findByDriverId(driverId, limit, offset) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const offsetNum = offset ? parseInt(offset, 10) : 0;
        return this.penaltiesService.findByDriverId({
            driverId,
            limit: limitNum,
            offset: offsetNum
        });
    }
    async findByCustomerCareId(customerCareId, limit, offset) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const offsetNum = offset ? parseInt(offset, 10) : 0;
        return this.penaltiesService.findByCustomerCareId({
            customerCareId,
            limit: limitNum,
            offset: offsetNum
        });
    }
    async findByRestaurantId(restaurantId, limit, offset) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const offsetNum = offset ? parseInt(offset, 10) : 0;
        return this.penaltiesService.findByRestaurantId({
            restaurantId,
            limit: limitNum,
            offset: offsetNum
        });
    }
    async findByAdminId(adminId, limit, offset) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const offsetNum = offset ? parseInt(offset, 10) : 0;
        return this.penaltiesService.findByAdminId({
            adminId,
            limit: limitNum,
            offset: offsetNum
        });
    }
    findOne(id) {
        return this.penaltiesService.findOne(id);
    }
    update(id, updatePenaltyDto) {
        return this.penaltiesService.update(id, updatePenaltyDto);
    }
    updateStatus(id, status) {
        return this.penaltiesService.updateStatus(id, status);
    }
    remove(id) {
        return this.penaltiesService.remove(id);
    }
};
exports.PenaltiesController = PenaltiesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_penalty_dto_1.CreatePenaltyDto]),
    __metadata("design:returntype", void 0)
], PenaltiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PenaltiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('paginated'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PenaltiesController.prototype, "findAllPaginated", null);
__decorate([
    (0, common_1.Get)('/by-driver/:driverId'),
    __param(0, (0, common_1.Param)('driverId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PenaltiesController.prototype, "findByDriverId", null);
__decorate([
    (0, common_1.Get)('/by-customer-care/:customerCareId'),
    __param(0, (0, common_1.Param)('customerCareId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PenaltiesController.prototype, "findByCustomerCareId", null);
__decorate([
    (0, common_1.Get)('/by-restaurant/:restaurantId'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PenaltiesController.prototype, "findByRestaurantId", null);
__decorate([
    (0, common_1.Get)('/by-admin/:adminId'),
    __param(0, (0, common_1.Param)('adminId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PenaltiesController.prototype, "findByAdminId", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PenaltiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_penalty_dto_1.UpdatePenaltyDto]),
    __metadata("design:returntype", void 0)
], PenaltiesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PenaltiesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PenaltiesController.prototype, "remove", null);
exports.PenaltiesController = PenaltiesController = __decorate([
    (0, common_1.Controller)('penalties'),
    __metadata("design:paramtypes", [penalties_service_1.PenaltiesService])
], PenaltiesController);
//# sourceMappingURL=penalties.controller.js.map