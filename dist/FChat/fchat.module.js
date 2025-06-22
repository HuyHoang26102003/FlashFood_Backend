"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FchatModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const fchat_gateway_1 = require("./fchat.gateway");
const fchat_service_1 = require("./fchat.service");
const message_entity_1 = require("./entities/message.entity");
const chat_room_entity_1 = require("./entities/chat-room.entity");
const user_entity_1 = require("../users/entities/user.entity");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const users_repository_1 = require("../users/users.repository");
const customer_entity_1 = require("../customers/entities/customer.entity");
const driver_entity_1 = require("../drivers/entities/driver.entity");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const customer_care_entity_1 = require("../customer_cares/entities/customer_care.entity");
const redis_service_1 = require("../redis/redis.service");
let FchatModule = class FchatModule {
};
exports.FchatModule = FchatModule;
exports.FchatModule = FchatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                message_entity_1.Message,
                chat_room_entity_1.ChatRoom,
                user_entity_1.User,
                customer_entity_1.Customer,
                driver_entity_1.Driver,
                restaurant_entity_1.Restaurant,
                customer_care_entity_1.CustomerCare
            ])
        ],
        providers: [
            fchat_gateway_1.FchatGateway,
            fchat_service_1.FchatService,
            jwt_1.JwtService,
            users_service_1.UsersService,
            redis_service_1.RedisService,
            users_repository_1.UserRepository
        ],
        exports: [fchat_service_1.FchatService]
    })
], FchatModule);
//# sourceMappingURL=fchat.module.js.map