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
exports.Admin = void 0;
const typeorm_1 = require("typeorm");
const admin_1 = require("../../utils/types/admin");
const user_entity_1 = require("../../users/entities/user.entity");
const restaurant_entity_1 = require("../../restaurants/entities/restaurant.entity");
const driver_entity_1 = require("../../drivers/entities/driver.entity");
const customer_care_entity_1 = require("../../customer_cares/entities/customer_care.entity");
const penalty_entity_1 = require("../../penalties/entities/penalty.entity");
let Admin = class Admin {
};
exports.Admin = Admin;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar' }),
    __metadata("design:type", String)
], Admin.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Admin.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Admin.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: admin_1.AdminRole
    }),
    __metadata("design:type", String)
], Admin.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Admin.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true }),
    __metadata("design:type", Array)
], Admin.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => restaurant_entity_1.Restaurant, restaurant => restaurant.admins),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Admin.prototype, "assigned_restaurants", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => driver_entity_1.Driver, driver => driver.admins),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Admin.prototype, "assigned_drivers", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => customer_care_entity_1.CustomerCare, customerCare => customerCare.admins),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Admin.prototype, "assigned_customer_care", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => penalty_entity_1.Penalty, penalty => penalty.penaltied_by),
    __metadata("design:type", Array)
], Admin.prototype, "penalties_issued", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], Admin.prototype, "last_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Number)
], Admin.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Number)
], Admin.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Admin.prototype, "created_by_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Admin, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_id' }),
    __metadata("design:type", Admin)
], Admin.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Admin.prototype, "first_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Admin.prototype, "last_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: admin_1.AdminStatus,
        default: admin_1.AdminStatus.ACTIVE
    }),
    __metadata("design:type", String)
], Admin.prototype, "status", void 0);
exports.Admin = Admin = __decorate([
    (0, typeorm_1.Entity)('admins')
], Admin);
//# sourceMappingURL=admin.entity.js.map