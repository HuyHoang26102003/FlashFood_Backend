"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceRulesModule = void 0;
const common_1 = require("@nestjs/common");
const finance_rules_service_1 = require("./finance_rules.service");
const finance_rules_controller_1 = require("./finance_rules.controller");
const typeorm_1 = require("@nestjs/typeorm");
const finance_rule_entity_1 = require("./entities/finance_rule.entity");
const finance_rules_repository_1 = require("./finance_rules.repository");
const drivers_repository_1 = require("../drivers/drivers.repository");
const driver_entity_1 = require("../drivers/entities/driver.entity");
const admin_entity_1 = require("../admin/entities/admin.entity");
const admin_repository_1 = require("../admin/admin.repository");
const order_entity_1 = require("../orders/entities/order.entity");
const orders_repository_1 = require("../orders/orders.repository");
const promotion_entity_1 = require("../promotions/entities/promotion.entity");
const promotions_repository_1 = require("../promotions/promotions.repository");
const users_repository_1 = require("../users/users.repository");
const user_entity_1 = require("../users/entities/user.entity");
let FinanceRulesModule = class FinanceRulesModule {
};
exports.FinanceRulesModule = FinanceRulesModule;
exports.FinanceRulesModule = FinanceRulesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                finance_rule_entity_1.FinanceRule,
                driver_entity_1.Driver,
                admin_entity_1.Admin,
                order_entity_1.Order,
                user_entity_1.User,
                promotion_entity_1.Promotion
            ])
        ],
        controllers: [finance_rules_controller_1.FinanceRulesController],
        providers: [
            finance_rules_service_1.FinanceRulesService,
            finance_rules_repository_1.FinanceRulesRepository,
            drivers_repository_1.DriversRepository,
            orders_repository_1.OrdersRepository,
            promotions_repository_1.PromotionsRepository,
            admin_repository_1.AdminRepository,
            users_repository_1.UserRepository
        ]
    })
], FinanceRulesModule);
//# sourceMappingURL=finance_rules.module.js.map