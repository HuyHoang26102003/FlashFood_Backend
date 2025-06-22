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
exports.RatingsReview = void 0;
const customer_entity_1 = require("../../customers/entities/customer.entity");
const driver_entity_1 = require("../../drivers/entities/driver.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
const restaurant_entity_1 = require("../../restaurants/entities/restaurant.entity");
const uuid_1 = require("uuid");
const typeorm_1 = require("typeorm");
const customer_care_entity_1 = require("../../customer_cares/entities/customer_care.entity");
let RatingsReview = class RatingsReview {
    generateId() {
        this.id = `FF_RR_${(0, uuid_1.v4)()}`;
        const now = Math.floor(Date.now() / 1000);
        this.created_at = now;
        this.updated_at = now;
    }
};
exports.RatingsReview = RatingsReview;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar' }),
    __metadata("design:type", String)
], RatingsReview.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RatingsReview.prototype, "rr_reviewer_driver_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RatingsReview.prototype, "rr_reviewer_customer_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RatingsReview.prototype, "rr_reviewer_restaurant_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RatingsReview.prototype, "rr_reviewer_customercare_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => driver_entity_1.Driver),
    (0, typeorm_1.JoinColumn)({ name: 'rr_reviewer_driver_id' }),
    __metadata("design:type", driver_entity_1.Driver)
], RatingsReview.prototype, "reviewer_driver", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer),
    (0, typeorm_1.JoinColumn)({ name: 'rr_reviewer_customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], RatingsReview.prototype, "reviewer_customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_entity_1.Restaurant),
    (0, typeorm_1.JoinColumn)({ name: 'rr_reviewer_restaurant_id' }),
    __metadata("design:type", restaurant_entity_1.Restaurant)
], RatingsReview.prototype, "reviewer_restaurant", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_care_entity_1.CustomerCare),
    (0, typeorm_1.JoinColumn)({ name: 'rr_reviewer_customercare_id' }),
    __metadata("design:type", customer_care_entity_1.CustomerCare)
], RatingsReview.prototype, "reviewer_customercare", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['driver', 'customer', 'customerCare', 'restaurant']
    }),
    __metadata("design:type", String)
], RatingsReview.prototype, "reviewer_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RatingsReview.prototype, "rr_recipient_driver_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RatingsReview.prototype, "rr_recipient_customer_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RatingsReview.prototype, "rr_recipient_restaurant_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RatingsReview.prototype, "rr_recipient_customercare_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => driver_entity_1.Driver),
    (0, typeorm_1.JoinColumn)({ name: 'rr_recipient_driver_id' }),
    __metadata("design:type", driver_entity_1.Driver)
], RatingsReview.prototype, "recipient_driver", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer),
    (0, typeorm_1.JoinColumn)({ name: 'rr_recipient_customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], RatingsReview.prototype, "recipient_customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_entity_1.Restaurant),
    (0, typeorm_1.JoinColumn)({ name: 'rr_recipient_restaurant_id' }),
    __metadata("design:type", restaurant_entity_1.Restaurant)
], RatingsReview.prototype, "recipient_restaurant", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_care_entity_1.CustomerCare),
    (0, typeorm_1.JoinColumn)({ name: 'rr_recipient_customercare_id' }),
    __metadata("design:type", customer_care_entity_1.CustomerCare)
], RatingsReview.prototype, "recipient_customercare", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['driver', 'customer', 'customerCare', 'restaurant']
    }),
    __metadata("design:type", String)
], RatingsReview.prototype, "recipient_type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RatingsReview.prototype, "order_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_entity_1.Order, order => order.ratings_reviews),
    (0, typeorm_1.JoinColumn)({ name: 'order_id' }),
    __metadata("design:type", order_entity_1.Order)
], RatingsReview.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], RatingsReview.prototype, "food_rating", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], RatingsReview.prototype, "delivery_rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RatingsReview.prototype, "food_review", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RatingsReview.prototype, "delivery_review", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], RatingsReview.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], RatingsReview.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], RatingsReview.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RatingsReview.prototype, "generateId", null);
exports.RatingsReview = RatingsReview = __decorate([
    (0, typeorm_1.Entity)('ratings_reviews')
], RatingsReview);
//# sourceMappingURL=ratings_review.entity.js.map