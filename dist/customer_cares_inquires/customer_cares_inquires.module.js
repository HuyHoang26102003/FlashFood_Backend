"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerCareInquiriesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const customer_cares_inquires_service_1 = require("./customer_cares_inquires.service");
const customer_cares_inquires_controller_1 = require("./customer_cares_inquires.controller");
const customer_care_inquiry_entity_1 = require("./entities/customer_care_inquiry.entity");
const customer_cares_inquires_repository_1 = require("./customer_cares_inquires.repository");
const customer_care_entity_1 = require("../customer_cares/entities/customer_care.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const redis_service_1 = require("../redis/redis.service");
let CustomerCareInquiriesModule = class CustomerCareInquiriesModule {
};
exports.CustomerCareInquiriesModule = CustomerCareInquiriesModule;
exports.CustomerCareInquiriesModule = CustomerCareInquiriesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([customer_care_inquiry_entity_1.CustomerCareInquiry, customer_care_entity_1.CustomerCare, order_entity_1.Order])
        ],
        controllers: [customer_cares_inquires_controller_1.CustomerCareInquiriesController],
        providers: [
            customer_cares_inquires_service_1.CustomerCareInquiriesService,
            redis_service_1.RedisService,
            customer_cares_inquires_repository_1.CustomerCareInquiriesRepository
        ],
        exports: [customer_cares_inquires_service_1.CustomerCareInquiriesService, customer_cares_inquires_repository_1.CustomerCareInquiriesRepository]
    })
], CustomerCareInquiriesModule);
//# sourceMappingURL=customer_cares_inquires.module.js.map