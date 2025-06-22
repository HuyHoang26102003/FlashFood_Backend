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
exports.UpdateDriverProgressStageDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const mapped_types_1 = require("@nestjs/mapped-types");
const create_driver_progress_stage_dto_1 = require("./create-driver-progress-stage.dto");
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
class UpdateDriverProgressStageDto extends (0, mapped_types_1.PartialType)(create_driver_progress_stage_dto_1.CreateDriverProgressStageDto) {
}
exports.UpdateDriverProgressStageDto = UpdateDriverProgressStageDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => EventDto),
    __metadata("design:type", Array)
], UpdateDriverProgressStageDto.prototype, "events", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateDriverProgressStageDto.prototype, "transactions_processed", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateDriverProgressStageDto.prototype, "updated_at", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateDriverProgressStageDto.prototype, "version", void 0);
//# sourceMappingURL=update-driver-progress-stage.dto.js.map