"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannedAccountModule = void 0;
const common_1 = require("@nestjs/common");
const banned_account_service_1 = require("./banned-account.service");
const banned_account_controller_1 = require("./banned-account.controller");
let BannedAccountModule = class BannedAccountModule {
};
exports.BannedAccountModule = BannedAccountModule;
exports.BannedAccountModule = BannedAccountModule = __decorate([
    (0, common_1.Module)({
        controllers: [banned_account_controller_1.BannedAccountController],
        providers: [banned_account_service_1.BannedAccountService],
    })
], BannedAccountModule);
//# sourceMappingURL=banned-account.module.js.map