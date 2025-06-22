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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const upload_service_1 = require("./upload.service");
const multer_1 = require("multer");
const restaurants_service_1 = require("../restaurants/restaurants.service");
const drivers_service_1 = require("../drivers/drivers.service");
const customers_service_1 = require("../customers/customers.service");
const Payload_1 = require("../types/Payload");
const createResponse_1 = require("../utils/createResponse");
const menu_items_service_1 = require("../menu_items/menu_items.service");
const admin_service_1 = require("../admin/admin.service");
const promotions_service_1 = require("../promotions/promotions.service");
let UploadController = class UploadController {
    constructor(restaurantService, uploadService, driverService, adminService, promotionService, customerService, menuItemService) {
        this.restaurantService = restaurantService;
        this.uploadService = uploadService;
        this.driverService = driverService;
        this.adminService = adminService;
        this.promotionService = promotionService;
        this.customerService = customerService;
        this.menuItemService = menuItemService;
    }
    async uploadAvatar(file, userType, entityId) {
        if (!file) {
            return (0, createResponse_1.createResponse)('MissingInput', null, 'No file uploaded');
        }
        console.log('cehck go this');
        console.log('cehck faile', file);
        const uploadResult = await this.uploadService.uploadImage(file);
        let updatedEntity;
        switch (userType) {
            case Payload_1.Enum_AvatarType.RESTAURANT_OWNER:
                updatedEntity = await this.restaurantService.updateEntityAvatar(uploadResult, entityId);
                break;
            case Payload_1.Enum_AvatarType.DRIVER:
                updatedEntity = await this.driverService.updateEntityAvatar(uploadResult, entityId);
                break;
            case Payload_1.Enum_AvatarType.ADMIN:
                updatedEntity = await this.adminService.updateEntityAvatar(uploadResult, entityId);
                break;
            case Payload_1.Enum_AvatarType.PROMOMOTION:
                updatedEntity = await this.promotionService.updateEntityAvatar(uploadResult, entityId);
                break;
            case Payload_1.Enum_AvatarType.CUSTOMER:
                updatedEntity = await this.customerService.updateEntityAvatar(uploadResult, entityId);
                break;
            case Payload_1.Enum_AvatarType.MENU_ITEM:
                updatedEntity = await this.menuItemService.updateEntityAvatar(uploadResult, entityId);
                break;
            default:
                return (0, createResponse_1.createResponse)('InvalidFormatInput', null, 'Invalid user type');
        }
        return updatedEntity;
    }
    async uploadGalleries(files, userType, entityId) {
        if (!files || files.length === 0) {
            return (0, createResponse_1.createResponse)('MissingInput', null, 'No files uploaded');
        }
        try {
            const uploadPromises = files.map(file => this.uploadService.uploadImage(file));
            const uploadResults = await Promise.all(uploadPromises);
            const formattedResults = uploadResults.map(result => ({
                key: result.public_id,
                url: result.url
            }));
            let updatedEntity;
            switch (userType) {
                case Payload_1.Enum_AvatarType.RESTAURANT_OWNER:
                    updatedEntity = await this.restaurantService.updateImageGalleries(formattedResults, entityId);
                    break;
                case Payload_1.Enum_AvatarType.DRIVER:
                    updatedEntity = await this.driverService.updateVehicleImages(formattedResults, entityId);
                    break;
                default:
                    return (0, createResponse_1.createResponse)('InvalidFormatInput', null, 'Invalid user type');
            }
            if (updatedEntity &&
                'status' in updatedEntity &&
                updatedEntity.status === 'NotFound') {
                return updatedEntity;
            }
            return (0, createResponse_1.createResponse)('OK', updatedEntity, 'Galleries uploaded successfully');
        }
        catch (error) {
            console.error('Error uploading galleries:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to upload galleries');
        }
    }
    async uploadImage(file) {
        if (!file) {
            return (0, createResponse_1.createResponse)('MissingInput', null, 'No file uploaded');
        }
        const uploadResult = await this.uploadService.uploadImage(file);
        return (0, createResponse_1.createResponse)('OK', uploadResult, 'Image uploaded successfully');
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)()
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('userType')),
    __param(2, (0, common_1.Body)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Post)('galleries'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, {
        storage: (0, multer_1.memoryStorage)()
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)('userType')),
    __param(2, (0, common_1.Body)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String, String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadGalleries", null);
__decorate([
    (0, common_1.Post)('image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)()
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadImage", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('upload'),
    __param(0, (0, common_1.Inject)(restaurants_service_1.RestaurantsService)),
    __metadata("design:paramtypes", [restaurants_service_1.RestaurantsService,
        upload_service_1.UploadService,
        drivers_service_1.DriversService,
        admin_service_1.AdminService,
        promotions_service_1.PromotionsService,
        customers_service_1.CustomersService,
        menu_items_service_1.MenuItemsService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map