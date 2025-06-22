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
exports.Order = exports.OrderCancellationReason = exports.OrderStatus = exports.OrderTrackingInfo = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const driver_progress_stage_entity_1 = require("../../driver_progress_stages/entities/driver_progress_stage.entity");
const driver_entity_1 = require("../../drivers/entities/driver.entity");
const restaurant_entity_1 = require("../../restaurants/entities/restaurant.entity");
const address_book_entity_1 = require("../../address_book/entities/address_book.entity");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const ratings_review_entity_1 = require("../../ratings_reviews/entities/ratings_review.entity");
const promotion_entity_1 = require("../../promotions/entities/promotion.entity");
var OrderTrackingInfo;
(function (OrderTrackingInfo) {
    OrderTrackingInfo["ORDER_PLACED"] = "ORDER_PLACED";
    OrderTrackingInfo["ORDER_RECEIVED"] = "ORDER_RECEIVED";
    OrderTrackingInfo["PREPARING"] = "PREPARING";
    OrderTrackingInfo["IN_PROGRESS"] = "IN_PROGRESS";
    OrderTrackingInfo["RESTAURANT_PICKUP"] = "RESTAURANT_PICKUP";
    OrderTrackingInfo["DISPATCHED"] = "DISPATCHED";
    OrderTrackingInfo["EN_ROUTE"] = "EN_ROUTE";
    OrderTrackingInfo["OUT_FOR_DELIVERY"] = "OUT_FOR_DELIVERY";
    OrderTrackingInfo["DELIVERY_FAILED"] = "DELIVERY_FAILED";
    OrderTrackingInfo["DELIVERED"] = "DELIVERED";
    OrderTrackingInfo["CANCELLED"] = "CANCELLED";
    OrderTrackingInfo["RETURNED"] = "RETURNED";
})(OrderTrackingInfo || (exports.OrderTrackingInfo = OrderTrackingInfo = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["RESTAURANT_ACCEPTED"] = "RESTAURANT_ACCEPTED";
    OrderStatus["PREPARING"] = "PREPARING";
    OrderStatus["IN_PROGRESS"] = "IN_PROGRESS";
    OrderStatus["READY_FOR_PICKUP"] = "READY_FOR_PICKUP";
    OrderStatus["RESTAURANT_PICKUP"] = "RESTAURANT_PICKUP";
    OrderStatus["DISPATCHED"] = "DISPATCHED";
    OrderStatus["EN_ROUTE"] = "EN_ROUTE";
    OrderStatus["OUT_FOR_DELIVERY"] = "OUT_FOR_DELIVERY";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["RETURNED"] = "RETURNED";
    OrderStatus["DELIVERY_FAILED"] = "DELIVERY_FAILED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var OrderCancellationReason;
(function (OrderCancellationReason) {
    OrderCancellationReason["CUSTOMER_CANCELLED"] = "CUSTOMER_CANCELLED";
    OrderCancellationReason["RESTAURANT_CANCELLED"] = "RESTAURANT_CANCELLED";
    OrderCancellationReason["DRIVER_CANCELLED"] = "DRIVER_CANCELLED";
    OrderCancellationReason["OUT_OF_STOCK"] = "OUT_OF_STOCK";
    OrderCancellationReason["RESTAURANT_CLOSED"] = "RESTAURANT_CLOSED";
    OrderCancellationReason["DRIVER_UNAVAILABLE"] = "DRIVER_UNAVAILABLE";
    OrderCancellationReason["CUSTOMER_UNAVAILABLE"] = "CUSTOMER_UNAVAILABLE";
    OrderCancellationReason["OTHER"] = "OTHER";
})(OrderCancellationReason || (exports.OrderCancellationReason = OrderCancellationReason = {}));
let Order = class Order {
    generateId() {
        this.id = `FF_ORDER_${(0, uuid_1.v4)()}`;
        this.created_at = Math.floor(Date.now() / 1000);
        this.updated_at = Math.floor(Date.now() / 1000);
    }
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar' }),
    __metadata("design:type", String)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Order.prototype, "customer_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, customer => customer.orders),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], Order.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Order.prototype, "restaurant_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_entity_1.Restaurant, restaurant => restaurant.orders),
    (0, typeorm_1.JoinColumn)({ name: 'restaurant_id' }),
    __metadata("design:type", restaurant_entity_1.Restaurant)
], Order.prototype, "restaurant", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "driver_id", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "distance", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal' }),
    __metadata("design:type", Number)
], Order.prototype, "driver_wage", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => driver_entity_1.Driver, driver => driver.orders),
    (0, typeorm_1.JoinColumn)({ name: 'driver_id' }),
    __metadata("design:type", driver_entity_1.Driver)
], Order.prototype, "driver", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING
    }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal'),
    __metadata("design:type", Number)
], Order.prototype, "total_amount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal'),
    __metadata("design:type", Number)
], Order.prototype, "delivery_fee", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal'),
    __metadata("design:type", Number)
], Order.prototype, "service_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['PENDING', 'PAID', 'FAILED'],
        default: 'PENDING'
    }),
    __metadata("design:type", String)
], Order.prototype, "payment_status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['COD', 'FWallet'],
        default: 'FWallet'
    }),
    __metadata("design:type", String)
], Order.prototype, "payment_method", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Order.prototype, "customer_location", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => address_book_entity_1.AddressBook, address => address.customer_orders),
    (0, typeorm_1.JoinColumn)({ name: 'customer_location' }),
    __metadata("design:type", address_book_entity_1.AddressBook)
], Order.prototype, "customerAddress", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Order.prototype, "restaurant_location", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => address_book_entity_1.AddressBook, address => address.restaurant_orders),
    (0, typeorm_1.JoinColumn)({ name: 'restaurant_location' }),
    __metadata("design:type", address_book_entity_1.AddressBook)
], Order.prototype, "restaurantAddress", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Array)
], Order.prototype, "order_items", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "customer_note", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "restaurant_note", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Order.prototype, "order_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Order.prototype, "delivery_time", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: OrderTrackingInfo,
        default: OrderTrackingInfo.ORDER_PLACED
    }),
    __metadata("design:type", String)
], Order.prototype, "tracking_info", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Order.prototype, "driver_tips", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Order.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Order.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => driver_progress_stage_entity_1.DriverProgressStage, driverProgressStage => driverProgressStage.orders),
    __metadata("design:type", Array)
], Order.prototype, "driver_progress_stages", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => driver_entity_1.Driver, driver => driver.current_orders),
    __metadata("design:type", Array)
], Order.prototype, "drivers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ratings_review_entity_1.RatingsReview, ratingReview => ratingReview.order),
    __metadata("design:type", Array)
], Order.prototype, "ratings_reviews", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => promotion_entity_1.Promotion, promotion => promotion.restaurants, {
        nullable: true
    }),
    (0, typeorm_1.JoinTable)({
        name: 'order_promotions',
        joinColumn: {
            name: 'order_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'promotion_id',
            referencedColumnName: 'id'
        }
    }),
    __metadata("design:type", Array)
], Order.prototype, "promotions_applied", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "cancelled_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "cancelled_by_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: OrderCancellationReason,
        nullable: true
    }),
    __metadata("design:type", String)
], Order.prototype, "cancellation_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "cancellation_title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "cancellation_description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "cancelled_at", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0
    }),
    __metadata("design:type", Number)
], Order.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Order.prototype, "generateId", null);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)('orders')
], Order);
//# sourceMappingURL=order.entity.js.map