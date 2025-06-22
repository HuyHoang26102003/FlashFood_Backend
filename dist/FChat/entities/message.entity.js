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
exports.Message = exports.MessageType = void 0;
const typeorm_1 = require("typeorm");
const Payload_1 = require("../../types/Payload");
const chat_room_entity_1 = require("./chat-room.entity");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const driver_entity_1 = require("../../drivers/entities/driver.entity");
const restaurant_entity_1 = require("../../restaurants/entities/restaurant.entity");
const customer_care_entity_1 = require("../../customer_cares/entities/customer_care.entity");
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "TEXT";
    MessageType["IMAGE"] = "IMAGE";
    MessageType["VIDEO"] = "VIDEO";
    MessageType["ORDER_INFO"] = "ORDER_INFO";
})(MessageType || (exports.MessageType = MessageType = {}));
let Message = class Message {
};
exports.Message = Message;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Message.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'room_id' }),
    __metadata("design:type", String)
], Message.prototype, "roomId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chat_room_entity_1.ChatRoom, chatRoom => chatRoom.messages),
    (0, typeorm_1.JoinColumn)({ name: 'room_id' }),
    __metadata("design:type", chat_room_entity_1.ChatRoom)
], Message.prototype, "chatRoom", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sender_id' }),
    __metadata("design:type", String)
], Message.prototype, "senderId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'sender_type',
        type: 'enum',
        enum: Payload_1.Enum_UserType
    }),
    __metadata("design:type", String)
], Message.prototype, "senderType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'sender_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], Message.prototype, "customerSender", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => driver_entity_1.Driver, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'sender_id' }),
    __metadata("design:type", driver_entity_1.Driver)
], Message.prototype, "driverSender", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_entity_1.Restaurant, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'sender_id' }),
    __metadata("design:type", restaurant_entity_1.Restaurant)
], Message.prototype, "restaurantSender", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_care_entity_1.CustomerCare, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'sender_id' }),
    __metadata("design:type", customer_care_entity_1.CustomerCare)
], Message.prototype, "customerCareSender", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Message.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'message_type',
        type: 'enum',
        enum: MessageType,
        default: MessageType.TEXT
    }),
    __metadata("design:type", String)
], Message.prototype, "messageType", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Message.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { name: 'read_by', array: true, default: [] }),
    __metadata("design:type", Array)
], Message.prototype, "readBy", void 0);
exports.Message = Message = __decorate([
    (0, typeorm_1.Entity)('messages')
], Message);
//# sourceMappingURL=message.entity.js.map