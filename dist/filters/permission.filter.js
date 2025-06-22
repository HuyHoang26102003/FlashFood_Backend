"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionFilter = void 0;
const common_1 = require("@nestjs/common");
const createResponse_1 = require("../utils/createResponse");
let PermissionFilter = class PermissionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        if (!response || !request) {
            return;
        }
        console.error('Exception caught in PermissionFilter:', exception);
        if (response.headersSent) {
            return;
        }
        if (request.response &&
            request.response.EC !== undefined) {
            const apiResponse = request.response;
            return response.status(common_1.HttpStatus.OK).json(apiResponse);
        }
        const errorResponse = (0, createResponse_1.createResponse)('ServerError', null, exception.message || 'An unexpected error occurred');
        return response.status(common_1.HttpStatus.OK).json(errorResponse);
    }
};
exports.PermissionFilter = PermissionFilter;
exports.PermissionFilter = PermissionFilter = __decorate([
    (0, common_1.Catch)(),
    (0, common_1.Injectable)()
], PermissionFilter);
//# sourceMappingURL=permission.filter.js.map