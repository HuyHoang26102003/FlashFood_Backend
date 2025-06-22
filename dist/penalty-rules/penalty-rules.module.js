"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PenaltyRulesModule = void 0;
const common_1 = require("@nestjs/common");
const penalty_rules_service_1 = require("./penalty-rules.service");
const penalty_rules_controller_1 = require("./penalty-rules.controller");
const typeorm_1 = require("@nestjs/typeorm");
const penalty_entity_1 = require("../penalties/entities/penalty.entity");
const penalty_rules_repository_1 = require("./penalty-rules.repository");
const penalty_rule_entity_1 = require("./entities/penalty-rule.entity");
let PenaltyRulesModule = class PenaltyRulesModule {
};
exports.PenaltyRulesModule = PenaltyRulesModule;
exports.PenaltyRulesModule = PenaltyRulesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([penalty_entity_1.Penalty, penalty_rule_entity_1.PenaltyRule])],
        controllers: [penalty_rules_controller_1.PenaltyRulesController],
        providers: [penalty_rules_service_1.PenaltyRulesService, penalty_rules_repository_1.PenaltyRulesRepository]
    })
], PenaltyRulesModule);
//# sourceMappingURL=penalty-rules.module.js.map