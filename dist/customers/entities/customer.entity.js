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
exports.Customer = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const user_entity_1 = require("../../users/entities/user.entity");
const address_book_entity_1 = require("../../address_book/entities/address_book.entity");
const restaurant_entity_1 = require("../../restaurants/entities/restaurant.entity");
const food_category_entity_1 = require("../../food_categories/entities/food_category.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
let Customer = class Customer {
    generateId() {
        this.id = `FF_CUS_${(0, uuid_1.v4)()}`;
        this.created_at = Math.floor(Date.now() / 1000);
        this.updated_at = Math.floor(Date.now() / 1000);
        this.last_login = Math.floor(Date.now() / 1000);
    }
};
exports.Customer = Customer;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Customer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Customer.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Customer.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Customer.prototype, "first_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Customer.prototype, "last_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Customer.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => address_book_entity_1.AddressBook),
    (0, typeorm_1.JoinTable)({
        name: 'customer_addresses',
        joinColumn: {
            name: 'customer_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'address_id',
            referencedColumnName: 'id'
        }
    }),
    __metadata("design:type", Array)
], Customer.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => food_category_entity_1.FoodCategory),
    (0, typeorm_1.JoinTable)({
        name: 'customer_preferred_categories',
        joinColumn: {
            name: 'customer_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'category_id',
            referencedColumnName: 'id'
        }
    }),
    __metadata("design:type", Array)
], Customer.prototype, "preferred_category", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => restaurant_entity_1.Restaurant),
    (0, typeorm_1.JoinTable)({
        name: 'customer_favorite_restaurants',
        joinColumn: {
            name: 'customer_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'restaurant_id',
            referencedColumnName: 'id'
        }
    }),
    __metadata("design:type", Array)
], Customer.prototype, "favorite_restaurants", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, nullable: true }),
    __metadata("design:type", Array)
], Customer.prototype, "favorite_items", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, nullable: true }),
    __metadata("design:type", Array)
], Customer.prototype, "support_tickets", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Customer.prototype, "app_preferences", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Array)
], Customer.prototype, "restaurant_history", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_at' }),
    __metadata("design:type", Number)
], Customer.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_at' }),
    __metadata("design:type", Number)
], Customer.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_login', nullable: true }),
    __metadata("design:type", Number)
], Customer.prototype, "last_login", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.Order, order => order.customer),
    __metadata("design:type", Array)
], Customer.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Customer.prototype, "generateId", null);
exports.Customer = Customer = __decorate([
    (0, typeorm_1.Entity)('customers')
], Customer);
//# sourceMappingURL=customer.entity.js.map