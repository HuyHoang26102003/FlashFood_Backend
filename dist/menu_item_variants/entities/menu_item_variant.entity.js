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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuItemVariant = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const menu_item_entity_1 = require("../../menu_items/entities/menu_item.entity");
let MenuItemVariant = class MenuItemVariant {
    generateId() {
        this.id = `FF_MENU_ITEM_VARIANT_${(0, uuid_1.v4)()}`;
        this.created_at = Math.floor(Date.now() / 1000);
        this.updated_at = Math.floor(Date.now() / 1000);
    }
};
exports.MenuItemVariant = MenuItemVariant;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], MenuItemVariant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MenuItemVariant.prototype, "menu_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => menu_item_entity_1.MenuItem, menuItem => menuItem.variants),
    (0, typeorm_1.JoinColumn)({ name: 'menu_id' }),
    __metadata("design:type", menu_item_entity_1.MenuItem)
], MenuItemVariant.prototype, "menu_item", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MenuItemVariant.prototype, "variant", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MenuItemVariant.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], MenuItemVariant.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], MenuItemVariant.prototype, "availability", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, default: [] }),
    __metadata("design:type", Array)
], MenuItemVariant.prototype, "default_restaurant_notes", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric'),
    __metadata("design:type", Number)
], MenuItemVariant.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { nullable: true }),
    __metadata("design:type", Number)
], MenuItemVariant.prototype, "discount_rate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_at' }),
    __metadata("design:type", Number)
], MenuItemVariant.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_at' }),
    __metadata("design:type", Number)
], MenuItemVariant.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MenuItemVariant.prototype, "generateId", null);
exports.MenuItemVariant = MenuItemVariant = __decorate([
    (0, typeorm_1.Entity)('menu_item_variants')
], MenuItemVariant);
//# sourceMappingURL=menu_item_variant.entity.js.map