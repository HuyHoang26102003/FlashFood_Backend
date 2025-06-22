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
exports.PermissionGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const admin_service_1 = require("../admin.service");
const createResponse_1 = require("../../utils/createResponse");
const permissions_decorator_1 = require("../decorators/permissions.decorator");
let PermissionGuard = class PermissionGuard {
    constructor(reflector, jwtService, adminService) {
        this.reflector = reflector;
        this.jwtService = jwtService;
        this.adminService = adminService;
    }
    async canActivate(context) {
        const requiredPermissions = this.reflector.get(permissions_decorator_1.PERMISSIONS_KEY, context.getHandler());
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        if (!request) {
            return false;
        }
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
            const adminId = payload.id;
            if (!adminId) {
                request.response = (0, createResponse_1.createResponse)('Forbidden', null, 'Invalid token: No admin ID found');
                return false;
            }
            const adminResponse = await this.adminService.findOne(adminId);
            if (adminResponse.EC !== 0 || !adminResponse.data) {
                request.response = (0, createResponse_1.createResponse)('NotFound', null, 'Admin not found');
                return false;
            }
            const admin = adminResponse.data;
            const adminPermissions = admin.permissions || [];
            const hasPermission = requiredPermissions.every(permission => adminPermissions.includes(permission));
            if (!hasPermission) {
                request.response = (0, createResponse_1.createResponse)('Forbidden', null, `Permission denied: Required permissions - ${requiredPermissions.join(', ')}`);
                return false;
            }
            request.admin = admin;
            return true;
        }
        catch (error) {
            console.log('PermissionGuard error:', error);
            request.response = (0, createResponse_1.createResponse)('ServerError', null, error.message || 'Invalid token or insufficient permissions');
            return false;
        }
    }
};
exports.PermissionGuard = PermissionGuard;
exports.PermissionGuard = PermissionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        jwt_1.JwtService,
        admin_service_1.AdminService])
], PermissionGuard);
//# sourceMappingURL=permission.guard.js.map