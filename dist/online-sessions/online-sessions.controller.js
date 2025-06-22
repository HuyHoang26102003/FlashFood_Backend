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
exports.OnlineSessionsController = void 0;
const common_1 = require("@nestjs/common");
const online_sessions_service_1 = require("./online-sessions.service");
const create_online_session_dto_1 = require("./dto/create-online-session.dto");
const update_online_session_dto_1 = require("./dto/update-online-session.dto");
let OnlineSessionsController = class OnlineSessionsController {
    constructor(onlineSessionsService) {
        this.onlineSessionsService = onlineSessionsService;
    }
    create(createOnlineSessionDto) {
        return this.onlineSessionsService.create(createOnlineSessionDto);
    }
    findAll() {
        return this.onlineSessionsService.findAll();
    }
    async findByDriverId(driverId, limit, offset) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const offsetNum = offset ? parseInt(offset, 10) : 0;
        return this.onlineSessionsService.findByDriverId({
            driverId,
            limit: limitNum,
            offset: offsetNum
        });
    }
    async findByCustomerCareId(customerCareId, limit, offset) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const offsetNum = offset ? parseInt(offset, 10) : 0;
        return this.onlineSessionsService.findByCustomerCareId({
            customerCareId,
            limit: limitNum,
            offset: offsetNum
        });
    }
    findOne(id) {
        return this.onlineSessionsService.findOne(id);
    }
    update(id, updateOnlineSessionDto) {
        return this.onlineSessionsService.update(id, updateOnlineSessionDto);
    }
    endSession(id) {
        return this.onlineSessionsService.endSession(id);
    }
    remove(id) {
        return this.onlineSessionsService.remove(id);
    }
};
exports.OnlineSessionsController = OnlineSessionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_online_session_dto_1.CreateOnlineSessionDto]),
    __metadata("design:returntype", void 0)
], OnlineSessionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OnlineSessionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('/by-driver/:driverId'),
    __param(0, (0, common_1.Param)('driverId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OnlineSessionsController.prototype, "findByDriverId", null);
__decorate([
    (0, common_1.Get)('/by-customer-care/:customerCareId'),
    __param(0, (0, common_1.Param)('customerCareId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OnlineSessionsController.prototype, "findByCustomerCareId", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OnlineSessionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_online_session_dto_1.UpdateOnlineSessionDto]),
    __metadata("design:returntype", void 0)
], OnlineSessionsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/end-session'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OnlineSessionsController.prototype, "endSession", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OnlineSessionsController.prototype, "remove", null);
exports.OnlineSessionsController = OnlineSessionsController = __decorate([
    (0, common_1.Controller)('online-sessions'),
    __metadata("design:paramtypes", [online_sessions_service_1.OnlineSessionsService])
], OnlineSessionsController);
//# sourceMappingURL=online-sessions.controller.js.map