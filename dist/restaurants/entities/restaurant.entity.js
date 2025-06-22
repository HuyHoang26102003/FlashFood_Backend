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
exports.Restaurant = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const user_entity_1 = require("../../users/entities/user.entity");
const address_book_entity_1 = require("../../address_book/entities/address_book.entity");
const food_category_entity_1 = require("../../food_categories/entities/food_category.entity");
const admin_entity_1 = require("../../admin/entities/admin.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
const promotion_entity_1 = require("../../promotions/entities/promotion.entity");
const menu_item_entity_1 = require("../../menu_items/entities/menu_item.entity");
let Restaurant = class Restaurant {
    generateId() {
        this.id = `FF_RES_${(0, uuid_1.v4)()}`;
        this.created_at = Math.floor(Date.now() / 1000);
        this.updated_at = Math.floor(Date.now() / 1000);
        this.total_orders = 0;
        if (!this.address_id) {
            this.address_id = null;
        }
    }
};
exports.Restaurant = Restaurant;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar' }),
    __metadata("design:type", String)
], Restaurant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Restaurant.prototype, "owner_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'owner_id' }),
    __metadata("design:type", user_entity_1.User)
], Restaurant.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Restaurant.prototype, "owner_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Restaurant.prototype, "address_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => address_book_entity_1.AddressBook),
    (0, typeorm_1.JoinColumn)({ name: 'address_id' }),
    __metadata("design:type", address_book_entity_1.AddressBook)
], Restaurant.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Restaurant.prototype, "restaurant_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Restaurant.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Array)
], Restaurant.prototype, "contact_email", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Array)
], Restaurant.prototype, "contact_phone", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Restaurant.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Array)
], Restaurant.prototype, "images_gallery", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Object)
], Restaurant.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => promotion_entity_1.Promotion, promotion => promotion.restaurants, {
        eager: false
    }),
    (0, typeorm_1.JoinTable)({
        name: 'restaurant_promotions',
        joinColumn: { name: 'restaurant_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'promotion_id', referencedColumnName: 'id' }
    }),
    __metadata("design:type", Array)
], Restaurant.prototype, "promotions", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Restaurant.prototype, "ratings", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => food_category_entity_1.FoodCategory),
    (0, typeorm_1.JoinTable)({
        name: 'restaurant_specializations',
        joinColumn: { name: 'restaurant_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'food_category_id', referencedColumnName: 'id' }
    }),
    __metadata("design:type", Array)
], Restaurant.prototype, "specialize_in", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Object)
], Restaurant.prototype, "opening_hours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_at' }),
    __metadata("design:type", Number)
], Restaurant.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_at' }),
    __metadata("design:type", Number)
], Restaurant.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Restaurant.prototype, "total_orders", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => admin_entity_1.Admin, admin => admin.assigned_restaurants),
    __metadata("design:type", Array)
], Restaurant.prototype, "admins", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.Order, order => order.restaurant),
    __metadata("design:type", Array)
], Restaurant.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => menu_item_entity_1.MenuItem, menuItem => menuItem.restaurant),
    __metadata("design:type", Array)
], Restaurant.prototype, "menuItems", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Restaurant.prototype, "generateId", null);
exports.Restaurant = Restaurant = __decorate([
    (0, typeorm_1.Entity)('restaurants')
], Restaurant);
//# sourceMappingURL=restaurant.entity.js.map