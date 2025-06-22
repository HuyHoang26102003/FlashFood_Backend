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
exports.BannedAccountController = void 0;
const common_1 = require("@nestjs/common");
const banned_account_service_1 = require("./banned-account.service");
const create_banned_account_dto_1 = require("./dto/create-banned-account.dto");
const update_banned_account_dto_1 = require("./dto/update-banned-account.dto");
let BannedAccountController = class BannedAccountController {
    constructor(bannedAccountService) {
        this.bannedAccountService = bannedAccountService;
    }
    create(createBannedAccountDto) {
        return this.bannedAccountService.create(createBannedAccountDto);
    }
    findAll() {
        return this.bannedAccountService.findAll();
    }
    findOne(id) {
        return this.bannedAccountService.findOne(+id);
    }
    update(id, updateBannedAccountDto) {
        return this.bannedAccountService.update(+id, updateBannedAccountDto);
    }
    remove(id) {
        return this.bannedAccountService.remove(+id);
    }
};
exports.BannedAccountController = BannedAccountController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_banned_account_dto_1.CreateBannedAccountDto]),
    __metadata("design:returntype", void 0)
], BannedAccountController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BannedAccountController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BannedAccountController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_banned_account_dto_1.UpdateBannedAccountDto]),
    __metadata("design:returntype", void 0)
], BannedAccountController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BannedAccountController.prototype, "remove", null);
exports.BannedAccountController = BannedAccountController = __decorate([
    (0, common_1.Controller)('banned-account'),
    __metadata("design:paramtypes", [banned_account_service_1.BannedAccountService])
], BannedAccountController);
//# sourceMappingURL=banned-account.controller.js.map