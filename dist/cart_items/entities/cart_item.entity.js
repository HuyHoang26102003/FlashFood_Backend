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
exports.CartItem = void 0;
const customer_entity_1 = require("../../customers/entities/customer.entity");
const menu_item_entity_1 = require("../../menu_items/entities/menu_item.entity");
const restaurant_entity_1 = require("../../restaurants/entities/restaurant.entity");
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
let CartItem = class CartItem {
    generateId() {
        this.id = `FF_CART_ITEM_${(0, uuid_1.v4)()}`;
        const now = Math.floor(Date.now() / 1000);
        this.created_at = now;
        this.updated_at = now;
    }
};
exports.CartItem = CartItem;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], CartItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_cart_item_customer_id'),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CartItem.prototype, "customer_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CartItem.prototype, "item_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CartItem.prototype, "restaurant_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], CartItem.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => menu_item_entity_1.MenuItem),
    (0, typeorm_1.JoinColumn)({ name: 'item_id' }),
    __metadata("design:type", menu_item_entity_1.MenuItem)
], CartItem.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_entity_1.Restaurant),
    (0, typeorm_1.JoinColumn)({ name: 'restaurant_id' }),
    __metadata("design:type", restaurant_entity_1.Restaurant)
], CartItem.prototype, "restaurant", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Array)
], CartItem.prototype, "variants", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CartItem.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CartItem.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ nullable: true }),
    __metadata("design:type", Number)
], CartItem.prototype, "deleted_at", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CartItem.prototype, "generateId", null);
exports.CartItem = CartItem = __decorate([
    (0, typeorm_1.Entity)('cart_items')
], CartItem);
//# sourceMappingURL=cart_item.entity.js.map