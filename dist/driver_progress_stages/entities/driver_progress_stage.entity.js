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
exports.DriverProgressStage = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const driver_entity_1 = require("../../drivers/entities/driver.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
let DriverProgressStage = class DriverProgressStage {
    generateId() {
        this.id = `FF_DPS_${(0, uuid_1.v4)()}`;
        const now = Math.floor(Date.now() / 1000);
        this.created_at = now;
        this.updated_at = now;
    }
};
exports.DriverProgressStage = DriverProgressStage;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar' }),
    __metadata("design:type", String)
], DriverProgressStage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DriverProgressStage.prototype, "driver_id", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], DriverProgressStage.prototype, "total_earns", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => driver_entity_1.Driver, driver => driver.progress_stages),
    (0, typeorm_1.JoinColumn)({ name: 'driver_id' }),
    __metadata("design:type", driver_entity_1.Driver)
], DriverProgressStage.prototype, "driver", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => order_entity_1.Order, order => order.driver_progress_stages),
    (0, typeorm_1.JoinTable)({
        name: 'driver_progress_orders',
        joinColumn: {
            name: 'driver_progress_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'order_id',
            referencedColumnName: 'id'
        }
    }),
    __metadata("design:type", Array)
], DriverProgressStage.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false, default: 'unknown' }),
    __metadata("design:type", String)
], DriverProgressStage.prototype, "current_state", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DriverProgressStage.prototype, "previous_state", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Array)
], DriverProgressStage.prototype, "stages", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DriverProgressStage.prototype, "next_state", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], DriverProgressStage.prototype, "estimated_time_remaining", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], DriverProgressStage.prototype, "actual_time_spent", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], DriverProgressStage.prototype, "total_distance_travelled", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], DriverProgressStage.prototype, "total_tips", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Array)
], DriverProgressStage.prototype, "events", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DriverProgressStage.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DriverProgressStage.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], DriverProgressStage.prototype, "transactions_processed", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0
    }),
    __metadata("design:type", Number)
], DriverProgressStage.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DriverProgressStage.prototype, "generateId", null);
exports.DriverProgressStage = DriverProgressStage = __decorate([
    (0, typeorm_1.Entity)('driver_progress_stages'),
    (0, typeorm_1.Index)(['driver_id', 'current_state'])
], DriverProgressStage);
//# sourceMappingURL=driver_progress_stage.entity.js.map