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
exports.OnlineSession = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const driver_entity_1 = require("../../drivers/entities/driver.entity");
const customer_care_entity_1 = require("../../customer_cares/entities/customer_care.entity");
let OnlineSession = class OnlineSession {
    generateId() {
        this.id = `FF_ONS_${(0, uuid_1.v4)()}`;
        this.start_time = Math.floor(Date.now() / 1000);
    }
};
exports.OnlineSession = OnlineSession;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar' }),
    __metadata("design:type", String)
], OnlineSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], OnlineSession.prototype, "driver_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => driver_entity_1.Driver, driver => driver.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'driver_id' }),
    __metadata("design:type", driver_entity_1.Driver)
], OnlineSession.prototype, "driver", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], OnlineSession.prototype, "customer_care_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_care_entity_1.CustomerCare, cc => cc.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_care_id' }),
    __metadata("design:type", customer_care_entity_1.CustomerCare)
], OnlineSession.prototype, "customer_care", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], OnlineSession.prototype, "start_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], OnlineSession.prototype, "end_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], OnlineSession.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OnlineSession.prototype, "generateId", null);
exports.OnlineSession = OnlineSession = __decorate([
    (0, typeorm_1.Entity)('online_sessions')
], OnlineSession);
//# sourceMappingURL=online-session.entity.js.map