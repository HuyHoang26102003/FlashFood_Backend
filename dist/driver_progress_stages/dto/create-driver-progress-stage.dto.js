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
exports.CreateDriverProgressStageDto = exports.StageDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const order_entity_1 = require("../../orders/entities/order.entity");
class LocationDto {
}
class WeatherDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], WeatherDto.prototype, "temperature", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WeatherDto.prototype, "condition", void 0);
class StageDetailsDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LocationDto),
    __metadata("design:type", LocationDto)
], StageDetailsDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StageDetailsDto.prototype, "estimated_time", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StageDetailsDto.prototype, "actual_time", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StageDetailsDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StageDetailsDto.prototype, "tip", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => WeatherDto),
    __metadata("design:type", WeatherDto)
], StageDetailsDto.prototype, "weather", void 0);
class StageDto {
}
exports.StageDto = StageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StageDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['pending', 'completed', 'in_progress', 'failed']),
    __metadata("design:type", String)
], StageDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => StageDetailsDto),
    __metadata("design:type", StageDetailsDto)
], StageDto.prototype, "details", void 0);
class EventDetailsDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", Object)
], EventDetailsDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EventDetailsDto.prototype, "notes", void 0);
class EventDto {
}
__decorate([
    (0, class_validator_1.IsEnum)(['driver_start', 'pickup_complete', 'delivery_complete']),
    __metadata("design:type", String)
], EventDto.prototype, "event_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => EventDetailsDto),
    __metadata("design:type", EventDetailsDto)
], EventDto.prototype, "event_details", void 0);
class CreateDriverProgressStageDto {
}
exports.CreateDriverProgressStageDto = CreateDriverProgressStageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDriverProgressStageDto.prototype, "driver_id", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => order_entity_1.Order),
    __metadata("design:type", Array)
], CreateDriverProgressStageDto.prototype, "orders", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDriverProgressStageDto.prototype, "current_state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateDriverProgressStageDto.prototype, "total_earns", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => StageDto),
    __metadata("design:type", Array)
], CreateDriverProgressStageDto.prototype, "stages", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => EventDto),
    __metadata("design:type", Array)
], CreateDriverProgressStageDto.prototype, "events", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDriverProgressStageDto.prototype, "previous_state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDriverProgressStageDto.prototype, "next_state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateDriverProgressStageDto.prototype, "estimated_time_remaining", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateDriverProgressStageDto.prototype, "actual_time_spent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateDriverProgressStageDto.prototype, "total_distance_travelled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateDriverProgressStageDto.prototype, "total_tips", void 0);
//# sourceMappingURL=create-driver-progress-stage.dto.js.map