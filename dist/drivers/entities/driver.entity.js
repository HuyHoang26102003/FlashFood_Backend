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
exports.Driver = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const user_entity_1 = require("../../users/entities/user.entity");
const admin_entity_1 = require("../../admin/entities/admin.entity");
const driver_progress_stage_entity_1 = require("../../driver_progress_stages/entities/driver_progress_stage.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
let Driver = class Driver {
    generateId() {
        this.id = `FF_DRI_${(0, uuid_1.v4)()}`;
        this.created_at = Math.floor(Date.now() / 1000);
        this.updated_at = Math.floor(Date.now() / 1000);
        this.last_login = Math.floor(Date.now() / 1000);
        if (this.available_for_work === undefined)
            this.available_for_work = false;
        if (this.is_on_delivery === undefined)
            this.is_on_delivery = false;
        if (this.active_points === undefined)
            this.active_points = 0;
        if (this.vehicle_info && !this.vehicle) {
            this.vehicle = {
                license_plate: this.vehicle_info.license_plate,
                model: this.vehicle_info.model,
                color: this.vehicle_info.color,
                type: this.vehicle_info.type,
                owner: '',
                brand: '',
                year: new Date().getFullYear()
            };
        }
        if (this.location && !this.current_location) {
            this.current_location = this.location;
        }
        if (this.status) {
            this.available_for_work = this.status.is_available || false;
        }
    }
};
exports.Driver = Driver;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar' }),
    __metadata("design:type", String)
], Driver.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Driver.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Driver.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Driver.prototype, "first_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Driver.prototype, "last_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Driver.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Driver.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Driver.prototype, "license_number", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Driver.prototype, "license_image", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Driver.prototype, "identity_card_number", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Driver.prototype, "identity_card_image", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Driver.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Array)
], Driver.prototype, "contact_email", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Array)
], Driver.prototype, "contact_phone", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Driver.prototype, "vehicle", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Driver.prototype, "vehicle_info", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Driver.prototype, "current_location", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Driver.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => order_entity_1.Order, order => order.drivers),
    (0, typeorm_1.JoinTable)({
        name: 'driver_current_orders',
        joinColumn: { name: 'driver_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'order_id', referencedColumnName: 'id' }
    }),
    __metadata("design:type", Array)
], Driver.prototype, "current_orders", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Driver.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Driver.prototype, "available_for_work", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Driver.prototype, "is_on_delivery", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Driver.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Driver.prototype, "active_points", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_at' }),
    __metadata("design:type", Number)
], Driver.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_at' }),
    __metadata("design:type", Number)
], Driver.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_login', nullable: true }),
    __metadata("design:type", Number)
], Driver.prototype, "last_login", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => admin_entity_1.Admin, admin => admin.assigned_drivers),
    __metadata("design:type", Array)
], Driver.prototype, "admins", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => driver_progress_stage_entity_1.DriverProgressStage, progressStage => progressStage.driver),
    __metadata("design:type", Array)
], Driver.prototype, "progress_stages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.Order, order => order.driver),
    __metadata("design:type", Array)
], Driver.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Driver.prototype, "generateId", null);
exports.Driver = Driver = __decorate([
    (0, typeorm_1.Entity)('drivers')
], Driver);
//# sourceMappingURL=driver.entity.js.map