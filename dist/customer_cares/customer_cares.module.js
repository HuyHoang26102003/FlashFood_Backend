"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerCaresModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const customer_cares_service_1 = require("./customer_cares.service");
const customer_care_entity_1 = require("./entities/customer_care.entity");
const customer_cares_repository_1 = require("./customer_cares.repository");
const customer_cares_inquires_repository_1 = require("../customer_cares_inquires/customer_cares_inquires.repository");
const customer_care_inquiry_entity_1 = require("../customer_cares_inquires/entities/customer_care_inquiry.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const orders_repository_1 = require("../orders/orders.repository");
const promotion_entity_1 = require("../promotions/entities/promotion.entity");
const redis_service_1 = require("../redis/redis.service");
const customer_cares_controller_1 = require("./customer_cares.controller");
const customer_cares_controller_fake_1 = require("./customer_cares.controller.fake");
const customer_cares_gateway_1 = require("./customer_cares.gateway");
let CustomerCaresModule = class CustomerCaresModule {
};
exports.CustomerCaresModule = CustomerCaresModule;
exports.CustomerCaresModule = CustomerCaresModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                customer_care_entity_1.CustomerCare,
                customer_care_inquiry_entity_1.CustomerCareInquiry,
                order_entity_1.Order,
                promotion_entity_1.Promotion
            ])
        ],
        controllers: [customer_cares_controller_1.CustomerCaresController, customer_cares_controller_fake_1.CustomerCaresControllerFake],
        providers: [
            redis_service_1.RedisService,
            customer_cares_service_1.CustomerCareService,
            customer_cares_repository_1.CustomerCaresRepository,
            orders_repository_1.OrdersRepository,
            customer_cares_inquires_repository_1.CustomerCareInquiriesRepository,
            customer_cares_gateway_1.CustomerCaresGateway
        ],
        exports: [customer_cares_service_1.CustomerCareService, customer_cares_repository_1.CustomerCaresRepository]
    })
], CustomerCaresModule);
//# sourceMappingURL=customer_cares.module.js.map