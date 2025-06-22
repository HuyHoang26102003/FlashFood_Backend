"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PenaltiesModule = void 0;
const common_1 = require("@nestjs/common");
const penalties_service_1 = require("./penalties.service");
const penalties_controller_1 = require("./penalties.controller");
const typeorm_1 = require("@nestjs/typeorm");
const penalty_entity_1 = require("./entities/penalty.entity");
const penalties_repository_1 = require("./penalties.repository");
const admin_repository_1 = require("../admin/admin.repository");
const admin_entity_1 = require("../admin/entities/admin.entity");
const penalty_rule_entity_1 = require("../penalty-rules/entities/penalty-rule.entity");
const penalty_rules_repository_1 = require("../penalty-rules/penalty-rules.repository");
const driver_entity_1 = require("../drivers/entities/driver.entity");
const drivers_repository_1 = require("../drivers/drivers.repository");
const order_entity_1 = require("../orders/entities/order.entity");
const orders_repository_1 = require("../orders/orders.repository");
const promotions_repository_1 = require("../promotions/promotions.repository");
const promotion_entity_1 = require("../promotions/entities/promotion.entity");
const user_entity_1 = require("../users/entities/user.entity");
const users_repository_1 = require("../users/users.repository");
let PenaltiesModule = class PenaltiesModule {
};
exports.PenaltiesModule = PenaltiesModule;
exports.PenaltiesModule = PenaltiesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                penalty_entity_1.Penalty,
                admin_entity_1.Admin,
                penalty_rule_entity_1.PenaltyRule,
                driver_entity_1.Driver,
                user_entity_1.User,
                order_entity_1.Order,
                promotion_entity_1.Promotion
            ])
        ],
        controllers: [penalties_controller_1.PenaltiesController],
        providers: [
            penalties_service_1.PenaltiesService,
            penalties_repository_1.PenaltiesRepository,
            admin_repository_1.AdminRepository,
            penalty_rules_repository_1.PenaltyRulesRepository,
            drivers_repository_1.DriversRepository,
            promotions_repository_1.PromotionsRepository,
            orders_repository_1.OrdersRepository,
            users_repository_1.UserRepository
        ]
    })
], PenaltiesModule);
//# sourceMappingURL=penalties.module.js.map