"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnlineSessionsModule = void 0;
const common_1 = require("@nestjs/common");
const online_sessions_service_1 = require("./online-sessions.service");
const online_sessions_controller_1 = require("./online-sessions.controller");
const typeorm_1 = require("@nestjs/typeorm");
const online_session_entity_1 = require("./entities/online-session.entity");
const online_session_repository_1 = require("./online-session.repository");
let OnlineSessionsModule = class OnlineSessionsModule {
};
exports.OnlineSessionsModule = OnlineSessionsModule;
exports.OnlineSessionsModule = OnlineSessionsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([online_session_entity_1.OnlineSession])],
        controllers: [online_sessions_controller_1.OnlineSessionsController],
        providers: [online_sessions_service_1.OnlineSessionsService, online_session_repository_1.OnlineSessionsRepository]
    })
], OnlineSessionsModule);
//# sourceMappingURL=online-sessions.module.js.map