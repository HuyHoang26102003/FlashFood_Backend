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
exports.ToggleCustomerFavoriteRestaurantDto = exports.UpdateCustomerFavoriteRestaurantDto = exports.UpdateCustomerPreferredCategoryDto = exports.UpdateCustomerDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const Payload_1 = require("../../types/Payload");
const mapped_types_1 = require("@nestjs/mapped-types");
const create_customer_dto_1 = require("./create-customer.dto");
class Avatar {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Avatar.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Avatar.prototype, "key", void 0);
class AppPreferences {
}
__decorate([
    (0, class_validator_1.IsEnum)(Payload_1.Enum_AppTheme),
    __metadata("design:type", String)
], AppPreferences.prototype, "theme", void 0);
class RestaurantHistory {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RestaurantHistory.prototype, "restaurant_id", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RestaurantHistory.prototype, "count", void 0);
class UpdateCustomerDto extends (0, mapped_types_1.PartialType)(create_customer_dto_1.CreateCustomerDto) {
}
exports.UpdateCustomerDto = UpdateCustomerDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCustomerDto.prototype, "last_login", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "user_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "first_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerDto.prototype, "last_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateCustomerDto.prototype, "address_ids", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Avatar),
    __metadata("design:type", Avatar)
], UpdateCustomerDto.prototype, "avatar", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateCustomerDto.prototype, "preferred_category_ids", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateCustomerDto.prototype, "favorite_restaurant_ids", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateCustomerDto.prototype, "favorite_items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateCustomerDto.prototype, "support_tickets", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AppPreferences),
    __metadata("design:type", AppPreferences)
], UpdateCustomerDto.prototype, "app_preferences", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RestaurantHistory),
    __metadata("design:type", Array)
], UpdateCustomerDto.prototype, "restaurant_history", void 0);
class UpdateCustomerPreferredCategoryDto extends UpdateCustomerDto {
}
exports.UpdateCustomerPreferredCategoryDto = UpdateCustomerPreferredCategoryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerPreferredCategoryDto.prototype, "preferred_category", void 0);
class UpdateCustomerFavoriteRestaurantDto extends UpdateCustomerDto {
}
exports.UpdateCustomerFavoriteRestaurantDto = UpdateCustomerFavoriteRestaurantDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomerFavoriteRestaurantDto.prototype, "favorite_restaurant", void 0);
class ToggleCustomerFavoriteRestaurantDto extends UpdateCustomerDto {
}
exports.ToggleCustomerFavoriteRestaurantDto = ToggleCustomerFavoriteRestaurantDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ToggleCustomerFavoriteRestaurantDto.prototype, "favorite_restaurant", void 0);
//# sourceMappingURL=update-customer.dto.js.map