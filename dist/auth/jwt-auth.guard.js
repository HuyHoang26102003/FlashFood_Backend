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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const createResponse_1 = require("../utils/createResponse");
let JwtAuthGuard = class JwtAuthGuard {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers['authorization'];
        if (!authorization) {
            request.response = (0, createResponse_1.createResponse)('Forbidden', null, 'No authorization token provided');
            return false;
        }
        const token = authorization.replace('Bearer ', '').trim();
        if (!token) {
            request.response = (0, createResponse_1.createResponse)('Forbidden', null, 'Invalid token format');
            return false;
        }
        try {
            const payload = this.jwtService.verify(token);
            const userId = payload.id;
            if (!userId) {
                request.response = (0, createResponse_1.createResponse)('Forbidden', null, 'Invalid token: No user ID found');
                return false;
            }
            request.user = payload;
            return true;
        }
        catch (error) {
            console.log('JwtAuthGuard error:', error);
            request.response = (0, createResponse_1.createResponse)('ServerError', null, error.message || 'Invalid token or insufficient permissions');
            return false;
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map