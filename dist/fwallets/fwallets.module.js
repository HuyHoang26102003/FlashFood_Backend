"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FwalletsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const fwallet_entity_1 = require("./entities/fwallet.entity");
const fwallets_service_1 = require("./fwallets.service");
const fwallets_controller_1 = require("./fwallets.controller");
const fwallets_repository_1 = require("./fwallets.repository");
const transactions_repository_1 = require("../transactions/transactions.repository");
const transaction_entity_1 = require("../transactions/entities/transaction.entity");
let FwalletsModule = class FwalletsModule {
};
exports.FwalletsModule = FwalletsModule;
exports.FwalletsModule = FwalletsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([fwallet_entity_1.FWallet, transaction_entity_1.Transaction])],
        controllers: [fwallets_controller_1.FWalletController],
        providers: [fwallets_service_1.FWalletService, fwallets_repository_1.FWalletsRepository, transactions_repository_1.TransactionsRepository],
        exports: [fwallets_service_1.FWalletService]
    })
], FwalletsModule);
//# sourceMappingURL=fwallets.module.js.map