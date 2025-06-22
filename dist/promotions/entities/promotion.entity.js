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
exports.Promotion = exports.DiscountType = exports.PromotionStatus = void 0;
const typeorm_1 = require("typeorm");
const restaurant_entity_1 = require("../../restaurants/entities/restaurant.entity");
const food_category_entity_1 = require("../../food_categories/entities/food_category.entity");
var PromotionStatus;
(function (PromotionStatus) {
    PromotionStatus["ACTIVE"] = "ACTIVE";
    PromotionStatus["EXPIRED"] = "EXPIRED";
    PromotionStatus["PENDING"] = "PENDING";
    PromotionStatus["CANCELLED"] = "CANCELLED";
})(PromotionStatus || (exports.PromotionStatus = PromotionStatus = {}));
var DiscountType;
(function (DiscountType) {
    DiscountType["PERCENTAGE"] = "PERCENTAGE";
    DiscountType["FIXED"] = "FIXED";
    DiscountType["BOGO"] = "BOGO";
})(DiscountType || (exports.DiscountType = DiscountType = {}));
let Promotion = class Promotion {
};
exports.Promotion = Promotion;
__decorate([
    (0, typeorm_1.Column)({ primary: true }),
    __metadata("design:type", String)
], Promotion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Promotion.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Promotion.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Promotion.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Promotion.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DiscountType
    }),
    __metadata("design:type", String)
], Promotion.prototype, "discount_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Promotion.prototype, "discount_value", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Promotion.prototype, "promotion_cost_price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Promotion.prototype, "minimum_order_value", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Promotion.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PromotionStatus,
        default: PromotionStatus.PENDING
    }),
    __metadata("design:type", String)
], Promotion.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, default: [] }),
    __metadata("design:type", Array)
], Promotion.prototype, "food_category_ids", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Promotion.prototype, "bogo_details", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Promotion.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Promotion.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => restaurant_entity_1.Restaurant, restaurant => restaurant.promotions),
    __metadata("design:type", Array)
], Promotion.prototype, "restaurants", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => food_category_entity_1.FoodCategory),
    (0, typeorm_1.JoinTable)({
        name: 'promotion_food_categories',
        joinColumn: { name: 'promotion_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'food_category_id', referencedColumnName: 'id' }
    }),
    __metadata("design:type", Array)
], Promotion.prototype, "food_categories", void 0);
exports.Promotion = Promotion = __decorate([
    (0, typeorm_1.Entity)('promotions')
], Promotion);
//# sourceMappingURL=promotion.entity.js.map