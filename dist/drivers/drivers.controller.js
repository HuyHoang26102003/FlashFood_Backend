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
exports.DriversController = void 0;
const common_1 = require("@nestjs/common");
const drivers_service_1 = require("./drivers.service");
const create_driver_dto_1 = require("./dto/create-driver.dto");
const update_driver_dto_1 = require("./dto/update-driver.dto");
const online_sessions_service_1 = require("../online-sessions/online-sessions.service");
const createResponse_1 = require("../utils/createResponse");
const driver_availability_dto_1 = require("./dto/driver-availability.dto");
let DriversController = class DriversController {
    constructor(driversService, onlineSessionsService) {
        this.driversService = driversService;
        this.onlineSessionsService = onlineSessionsService;
    }
    create(createDriverDto) {
        return this.driversService.create(createDriverDto);
    }
    clearRedis() {
        return this.driversService.clearRedis();
    }
    findAll() {
        return this.driversService.findAll();
    }
    findAllPaginated(page = '1', limit = '10') {
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        return this.driversService.findAllPaginated(parsedPage, parsedLimit);
    }
    async findOnlineSessionByDriverId(driverId, limit, offset) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const offsetNum = offset ? parseInt(offset, 10) : 0;
        const response = await this.onlineSessionsService.findByDriverId({
            driverId,
            limit: limitNum,
            offset: offsetNum
        });
        const { EC, data } = response;
        if (EC === 0) {
            const groupedData = data.reduce((acc, curr) => {
                const startDate = new Date(parseInt(`${curr.start_time}`) * 1000);
                const date = startDate.toISOString().split('T')[0];
                let endTime = curr.end_time;
                if (!endTime || isNaN(endTime)) {
                    const endOfDay = new Date(startDate);
                    endOfDay.setHours(23, 59, 59, 999);
                    endTime = Math.floor(endOfDay.getTime() / 1000);
                }
                const onlineTime = (parseInt(`${endTime}`) - parseInt(`${curr.start_time}`)) * 1000;
                let group = acc.find(item => item.date === date);
                if (!group) {
                    group = { date: date, items: [], total_online_hours: 0 };
                    acc.push(group);
                }
                group.items.push(curr);
                group.total_online_hours += onlineTime;
                return acc;
            }, []);
            console.log('check grouped data', groupedData);
            const result = groupedData.map(group => ({
                date: group.date,
                items: group.items,
                total_milisec: group.total_online_hours,
                total_hours: this.driversService.formatTime(group.total_online_hours)
            }));
            return (0, createResponse_1.createResponse)('OK', result, null);
        }
    }
    async findAllDpsByDriverId(driverId, limit, offset) {
        const limitNum = limit ? parseInt(limit, 10) : 5;
        const offsetNum = offset ? parseInt(offset, 10) : 0;
        const stages = await this.driversService.getAllDriverProgressStages({
            driverId,
            offset: offsetNum,
            limit: limitNum
        });
        return stages;
    }
    getAllOrders(id) {
        return this.driversService.getAllOrders(id);
    }
    findDriverById(id) {
        return this.driversService.findDriverById(id);
    }
    async getDriverRatingsReviews(id) {
        return this.driversService.getDriverRatingsReviews(id);
    }
    findOne(field, value) {
        return this.driversService.findOne({ [field]: value });
    }
    async updateDriverVehicle(updateVehicleDto, driverId) {
        return await this.driversService.updateVehicle(driverId, updateVehicleDto);
    }
    update(id, updateDriverDto) {
        return this.driversService.update(id, updateDriverDto);
    }
    toggleAvailability(id, toggleDto) {
        return this.driversService.toggleAvailability(id, toggleDto);
    }
    remove(id) {
        return this.driversService.remove(id);
    }
};
exports.DriversController = DriversController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_driver_dto_1.CreateDriverDto]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('clear-redis'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DriversController.prototype, "clearRedis", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('paginated'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "findAllPaginated", null);
__decorate([
    (0, common_1.Get)('/online-session/:driver'),
    __param(0, (0, common_1.Param)('driver')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DriversController.prototype, "findOnlineSessionByDriverId", null);
__decorate([
    (0, common_1.Get)('/driver-progress-stages/:driver'),
    __param(0, (0, common_1.Param)('driver')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DriversController.prototype, "findAllDpsByDriverId", null);
__decorate([
    (0, common_1.Get)('/orders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "findDriverById", null);
__decorate([
    (0, common_1.Get)(':id/ratings-reviews'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DriversController.prototype, "getDriverRatingsReviews", null);
__decorate([
    (0, common_1.Get)(':field/:value'),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Param)('value')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('vehicle/:driverId'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_driver_dto_1.UpdateVehicleDto, String]),
    __metadata("design:returntype", Promise)
], DriversController.prototype, "updateDriverVehicle", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_driver_dto_1.UpdateDriverDto]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/availability'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, driver_availability_dto_1.ToggleDriverAvailabilityDto]),
    __metadata("design:returntype", Promise)
], DriversController.prototype, "toggleAvailability", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "remove", null);
exports.DriversController = DriversController = __decorate([
    (0, common_1.Controller)('drivers'),
    __metadata("design:paramtypes", [drivers_service_1.DriversService,
        online_sessions_service_1.OnlineSessionsService])
], DriversController);
//# sourceMappingURL=drivers.controller.js.map