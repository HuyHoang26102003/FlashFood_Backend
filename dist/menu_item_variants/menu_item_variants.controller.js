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
exports.MenuItemVariantsController = void 0;
const common_1 = require("@nestjs/common");
const menu_item_variants_service_1 = require("./menu_item_variants.service");
const create_menu_item_variant_dto_1 = require("./dto/create-menu_item_variant.dto");
const update_menu_item_variant_dto_1 = require("./dto/update-menu_item_variant.dto");
let MenuItemVariantsController = class MenuItemVariantsController {
    constructor(menuItemVariantsService) {
        this.menuItemVariantsService = menuItemVariantsService;
    }
    create(createMenuItemVariantDto) {
        return this.menuItemVariantsService.create(createMenuItemVariantDto);
    }
    findAll() {
        return this.menuItemVariantsService.findAll();
    }
    findAllPaginated(page = '1', limit = '10') {
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        return this.menuItemVariantsService.findAllPaginated(parsedPage, parsedLimit);
    }
    findOne(id) {
        return this.menuItemVariantsService.findOne(id);
    }
    update(id, updateMenuItemVariantDto) {
        return this.menuItemVariantsService.update(id, updateMenuItemVariantDto);
    }
    remove(id) {
        return this.menuItemVariantsService.remove(id);
    }
};
exports.MenuItemVariantsController = MenuItemVariantsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_menu_item_variant_dto_1.CreateMenuItemVariantDto]),
    __metadata("design:returntype", void 0)
], MenuItemVariantsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MenuItemVariantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('paginated'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MenuItemVariantsController.prototype, "findAllPaginated", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MenuItemVariantsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_menu_item_variant_dto_1.UpdateMenuItemVariantDto]),
    __metadata("design:returntype", void 0)
], MenuItemVariantsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MenuItemVariantsController.prototype, "remove", null);
exports.MenuItemVariantsController = MenuItemVariantsController = __decorate([
    (0, common_1.Controller)('menu-item-variants'),
    __metadata("design:paramtypes", [menu_item_variants_service_1.MenuItemVariantsService])
], MenuItemVariantsController);
//# sourceMappingURL=menu_item_variants.controller.js.map