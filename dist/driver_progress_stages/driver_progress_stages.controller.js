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
exports.DriverProgressStagesController = void 0;
const common_1 = require("@nestjs/common");
const driver_progress_stages_service_1 = require("./driver_progress_stages.service");
const create_driver_progress_stage_dto_1 = require("./dto/create-driver-progress-stage.dto");
const update_driver_progress_stage_dto_1 = require("./dto/update-driver-progress-stage.dto");
let DriverProgressStagesController = class DriverProgressStagesController {
    constructor(driverProgressStagesService) {
        this.driverProgressStagesService = driverProgressStagesService;
    }
    create(createDto) {
        return this.driverProgressStagesService.create(createDto);
    }
    findAll() {
        return this.driverProgressStagesService.findAll();
    }
    findById(id) {
        return this.driverProgressStagesService.findById(id);
    }
    getActiveStageByDriver(driverId) {
        return this.driverProgressStagesService.getActiveStageByDriver(driverId);
    }
    update(id, updateDto) {
        return this.driverProgressStagesService.updateStage(id, updateDto);
    }
    remove(id) {
        return this.driverProgressStagesService.remove(id);
    }
};
exports.DriverProgressStagesController = DriverProgressStagesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_driver_progress_stage_dto_1.CreateDriverProgressStageDto]),
    __metadata("design:returntype", void 0)
], DriverProgressStagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DriverProgressStagesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DriverProgressStagesController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('driver/:driverId'),
    __param(0, (0, common_1.Param)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DriverProgressStagesController.prototype, "getActiveStageByDriver", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_driver_progress_stage_dto_1.UpdateDriverProgressStageDto]),
    __metadata("design:returntype", void 0)
], DriverProgressStagesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DriverProgressStagesController.prototype, "remove", null);
exports.DriverProgressStagesController = DriverProgressStagesController = __decorate([
    (0, common_1.Controller)('driver-progress-stages'),
    __metadata("design:paramtypes", [driver_progress_stages_service_1.DriverProgressStagesService])
], DriverProgressStagesController);
//# sourceMappingURL=driver_progress_stages.controller.js.map