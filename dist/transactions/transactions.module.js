"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsModule = void 0;
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("./transactions.service");
const transactions_controller_1 = require("./transactions.controller");
const typeorm_1 = require("@nestjs/typeorm");
const transaction_entity_1 = require("./entities/transaction.entity");
const orders_module_1 = require("../orders/orders.module");
const fwallets_module_1 = require("../fwallets/fwallets.module");
const users_module_1 = require("../users/users.module");
const transactions_repository_1 = require("./transactions.repository");
const fwallet_entity_1 = require("../fwallets/entities/fwallet.entity");
const fwallets_repository_1 = require("../fwallets/fwallets.repository");
let TransactionsModule = class TransactionsModule {
};
exports.TransactionsModule = TransactionsModule;
exports.TransactionsModule = TransactionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([transaction_entity_1.Transaction, fwallet_entity_1.FWallet]),
            (0, common_1.forwardRef)(() => orders_module_1.OrdersModule),
            fwallets_module_1.FwalletsModule,
            users_module_1.UsersModule
        ],
        controllers: [transactions_controller_1.TransactionsController],
        providers: [transactions_service_1.TransactionService, transactions_repository_1.TransactionsRepository, fwallets_repository_1.FWalletsRepository],
        exports: [transactions_service_1.TransactionService, transactions_repository_1.TransactionsRepository]
    })
], TransactionsModule);
//# sourceMappingURL=transactions.module.js.map