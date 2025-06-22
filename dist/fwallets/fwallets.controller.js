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
exports.FWalletController = void 0;
const common_1 = require("@nestjs/common");
const fwallets_service_1 = require("./fwallets.service");
const create_fwallet_dto_1 = require("./dto/create-fwallet.dto");
const update_fwallet_dto_1 = require("./dto/update-fwallet.dto");
let FWalletController = class FWalletController {
    constructor(fWalletService) {
        this.fWalletService = fWalletService;
    }
    create(createFWalletDto) {
        return this.fWalletService.create(createFWalletDto);
    }
    findAll() {
        return this.fWalletService.findAll();
    }
    findHistoryTransaction(fwalletId) {
        return this.fWalletService.findHistoryTransaction(fwalletId);
    }
    searchByQuery(query) {
        return this.fWalletService.findBySearchQuery(query);
    }
    findAllPaginated(page = '1', limit = '10') {
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        return this.fWalletService.findAllPaginated(parsedPage, parsedLimit);
    }
    findFWalletById(id) {
        return this.fWalletService.findFWalletById(id);
    }
    findOne(field, value) {
        return this.fWalletService.findOne({ [field]: value });
    }
    update(id, updateFWalletDto) {
        return this.fWalletService.update(id, updateFWalletDto);
    }
    remove(id) {
        return this.fWalletService.remove(id);
    }
};
exports.FWalletController = FWalletController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_fwallet_dto_1.CreateFWalletDto]),
    __metadata("design:returntype", void 0)
], FWalletController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FWalletController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('history/:fwalletId'),
    __param(0, (0, common_1.Param)('fwalletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FWalletController.prototype, "findHistoryTransaction", null);
__decorate([
    (0, common_1.Get)('search/:query'),
    __param(0, (0, common_1.Param)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FWalletController.prototype, "searchByQuery", null);
__decorate([
    (0, common_1.Get)('paginated'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FWalletController.prototype, "findAllPaginated", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FWalletController.prototype, "findFWalletById", null);
__decorate([
    (0, common_1.Get)(':field/:value'),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Param)('value')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FWalletController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_fwallet_dto_1.UpdateFwalletDto]),
    __metadata("design:returntype", void 0)
], FWalletController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FWalletController.prototype, "remove", null);
exports.FWalletController = FWalletController = __decorate([
    (0, common_1.Controller)('fwallets'),
    __metadata("design:paramtypes", [fwallets_service_1.FWalletService])
], FWalletController);
//# sourceMappingURL=fwallets.controller.js.map