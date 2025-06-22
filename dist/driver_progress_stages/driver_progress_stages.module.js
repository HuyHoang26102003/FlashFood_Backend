"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverProgressStagesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const driver_progress_stages_service_1 = require("./driver_progress_stages.service");
const driver_progress_stages_controller_1 = require("./driver_progress_stages.controller");
const driver_progress_stage_entity_1 = require("./entities/driver_progress_stage.entity");
const driver_progress_stages_repository_1 = require("./driver_progress_stages.repository");
const drivers_repository_1 = require("../drivers/drivers.repository");
const drivers_module_1 = require("../drivers/drivers.module");
const driver_entity_1 = require("../drivers/entities/driver.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const orders_repository_1 = require("../orders/orders.repository");
const promotions_repository_1 = require("../promotions/promotions.repository");
const promotion_entity_1 = require("../promotions/entities/promotion.entity");
let DriverProgressStagesModule = class DriverProgressStagesModule {
};
exports.DriverProgressStagesModule = DriverProgressStagesModule;
exports.DriverProgressStagesModule = DriverProgressStagesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([driver_progress_stage_entity_1.DriverProgressStage, driver_entity_1.Driver, order_entity_1.Order, promotion_entity_1.Promotion]),
            (0, common_1.forwardRef)(() => drivers_module_1.DriversModule)
        ],
        controllers: [driver_progress_stages_controller_1.DriverProgressStagesController],
        providers: [
            driver_progress_stages_service_1.DriverProgressStagesService,
            driver_progress_stages_repository_1.DriverProgressStagesRepository,
            drivers_repository_1.DriversRepository,
            promotions_repository_1.PromotionsRepository,
            orders_repository_1.OrdersRepository
        ],
        exports: [driver_progress_stages_service_1.DriverProgressStagesService, driver_progress_stages_repository_1.DriverProgressStagesRepository]
    })
], DriverProgressStagesModule);
//# sourceMappingURL=driver_progress_stages.module.js.map