"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
exports.createResponse = createResponse;
const common_1 = require("@nestjs/common");
const constants_1 = require("./constants");
function createResponse(status, data, message) {
    const statusInfo = constants_1.ResponseStatus[status];
    const response = {
        EC: statusInfo.code,
        EM: message || statusInfo.message,
        data
    };
    return response;
}
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const errorResponse = exception.getResponse();
        if (Array.isArray(errorResponse.message)) {
            const messages = errorResponse.message;
            const apiResponse = createResponse('InvalidFormatInput', messages, 'Please validate inputs with these errors');
            return response.status(200).json(apiResponse);
        }
        const message = typeof errorResponse === 'string'
            ? errorResponse
            : errorResponse.message || 'Bad request';
        const apiResponse = createResponse('ServerError', null, message);
        return response.status(200).json(apiResponse);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(common_1.BadRequestException)
], HttpExceptionFilter);
//# sourceMappingURL=createResponse.js.map