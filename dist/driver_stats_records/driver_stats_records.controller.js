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
exports.DriverStatsController = void 0;
const common_1 = require("@nestjs/common");
const driver_stats_records_service_1 = require("./driver_stats_records.service");
let DriverStatsController = class DriverStatsController {
    constructor(driverStatsService) {
        this.driverStatsService = driverStatsService;
    }
    async getStats(driverId, startDate, endDate, aggregate) {
        const start = Math.floor(new Date(startDate).getTime() / 1000);
        const end = Math.floor(new Date(endDate).getTime() / 1000);
        const isAggregate = aggregate === 'true';
        return this.driverStatsService.getStatsForDriver(driverId, start, end, isAggregate);
    }
};
exports.DriverStatsController = DriverStatsController;
__decorate([
    (0, common_1.Get)(':driverId'),
    __param(0, (0, common_1.Param)('driverId')),
    __param(1, (0, common_1.Query)('start_date')),
    __param(2, (0, common_1.Query)('end_date')),
    __param(3, (0, common_1.Query)('aggregate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], DriverStatsController.prototype, "getStats", null);
exports.DriverStatsController = DriverStatsController = __decorate([
    (0, common_1.Controller)('driver-stats'),
    __metadata("design:paramtypes", [driver_stats_records_service_1.DriverStatsService])
], DriverStatsController);
//# sourceMappingURL=driver_stats_records.controller.js.map