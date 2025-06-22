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
exports.UpdatePermissionsDto = exports.UpdateAdminDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_admin_dto_1 = require("./create-admin.dto");
const class_validator_1 = require("class-validator");
const admin_1 = require("../../utils/types/admin");
class UpdateAdminDto extends (0, mapped_types_1.PartialType)(create_admin_dto_1.CreateAdminDto) {
}
exports.UpdateAdminDto = UpdateAdminDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(admin_1.AdminRole),
    __metadata("design:type", String)
], UpdateAdminDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(admin_1.AdminPermission, { each: true }),
    __metadata("design:type", Array)
], UpdateAdminDto.prototype, "permissions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateAdminDto.prototype, "assigned_restaurants", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateAdminDto.prototype, "assigned_drivers", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateAdminDto.prototype, "avatar", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateAdminDto.prototype, "assigned_customer_care", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(admin_1.AdminStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAdminDto.prototype, "status", void 0);
class UpdatePermissionsDto {
}
exports.UpdatePermissionsDto = UpdatePermissionsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(admin_1.AdminPermission, { each: true }),
    __metadata("design:type", Array)
], UpdatePermissionsDto.prototype, "permissions", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePermissionsDto.prototype, "requesterId", void 0);
//# sourceMappingURL=update-admin.dto.js.map