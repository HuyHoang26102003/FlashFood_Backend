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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./entities/notification.entity");
const notifications_repository_1 = require("./notifications.repository");
const createResponse_1 = require("../utils/createResponse");
const admin_repository_1 = require("../admin/admin.repository");
let NotificationsService = class NotificationsService {
    constructor(notificationsRepository, adminRepository, notificationEntityRepository) {
        this.notificationsRepository = notificationsRepository;
        this.adminRepository = adminRepository;
        this.notificationEntityRepository = notificationEntityRepository;
    }
    async create(createNotificationDto) {
        try {
            const admin = await this.adminRepository.findById(createNotificationDto.created_by_id);
            if (!admin) {
                return (0, createResponse_1.createResponse)('NotFound', null, `Admin with ID ${createNotificationDto.created_by_id} not found`);
            }
            const newNotification = await this.notificationsRepository.create(createNotificationDto);
            return (0, createResponse_1.createResponse)('OK', newNotification, 'Notification created successfully');
        }
        catch (error) {
            return this.handleError('Error creating notification:', error);
        }
    }
    async findAll() {
        try {
            const notifications = await this.notificationsRepository.findAll();
            return (0, createResponse_1.createResponse)('OK', notifications, 'Fetched all notifications');
        }
        catch (error) {
            return this.handleError('Error fetching notifications:', error);
        }
    }
    async findOne(id) {
        try {
            const notification = await this.notificationsRepository.findById(id);
            return this.handleNotificationResponse(notification);
        }
        catch (error) {
            return this.handleError('Error fetching notification:', error);
        }
    }
    async update(id, updateNotificationDto) {
        try {
            const notification = await this.notificationsRepository.findById(id);
            if (!notification) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Notification not found');
            }
            const updatedNotification = await this.notificationsRepository.update(id, updateNotificationDto);
            return (0, createResponse_1.createResponse)('OK', updatedNotification, 'Notification updated successfully');
        }
        catch (error) {
            return this.handleError('Error updating notification:', error);
        }
    }
    async remove(id) {
        try {
            const deletedNotification = await this.notificationsRepository.remove(id);
            if (!deletedNotification) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Notification not found');
            }
            return (0, createResponse_1.createResponse)('OK', null, 'Notification deleted successfully');
        }
        catch (error) {
            return this.handleError('Error deleting notification:', error);
        }
    }
    handleNotificationResponse(notification) {
        if (!notification) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'Notification not found');
        }
        return (0, createResponse_1.createResponse)('OK', notification, 'Notification retrieved successfully');
    }
    handleError(message, error) {
        console.error(message, error);
        return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while processing your request');
    }
    async broadcast(broadcastNotificationDto) {
        try {
            const admin = await this.adminRepository.findById(broadcastNotificationDto.created_by_id);
            if (!admin) {
                return (0, createResponse_1.createResponse)('NotFound', null, `Admin with ID ${broadcastNotificationDto.created_by_id} not found`);
            }
            const notifications = [];
            const { target_user, content, created_by_id } = broadcastNotificationDto;
            for (const target of target_user) {
                const targetContent = content[target.toLowerCase()];
                if (!targetContent) {
                    return (0, createResponse_1.createResponse)('MissingInput', null, `Missing content for target_user: ${target}`);
                }
                const notificationData = {
                    avatar: targetContent.avatar,
                    title: targetContent.title,
                    desc: targetContent.desc,
                    image: targetContent.image || null,
                    link: targetContent.link || null,
                    target_user: [target],
                    created_by_id,
                    target_user_id: null
                };
                const newNotification = await this.notificationsRepository.create(notificationData);
                notifications.push(newNotification);
            }
            return (0, createResponse_1.createResponse)('OK', notifications, 'Broadcast notifications created successfully');
        }
        catch (error) {
            return this.handleError('Error broadcasting notifications:', error);
        }
    }
    async findAllPaginated(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [notifications, total] = await this.notificationsRepository.findAllPaginated(skip, limit);
            const totalPages = Math.ceil(total / limit);
            return (0, createResponse_1.createResponse)('OK', {
                totalPages,
                currentPage: page,
                totalItems: total,
                items: notifications
            }, 'Fetched paginated notifications');
        }
        catch (error) {
            console.error('Error fetching paginated notifications:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching paginated notifications');
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [notifications_repository_1.NotificationsRepository,
        admin_repository_1.AdminRepository,
        typeorm_2.Repository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map