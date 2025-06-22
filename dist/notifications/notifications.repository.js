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
exports.NotificationsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./entities/notification.entity");
let NotificationsRepository = class NotificationsRepository {
    constructor(notificationEntityRepository) {
        this.notificationEntityRepository = notificationEntityRepository;
    }
    async findById(id) {
        return await this.notificationEntityRepository.findOne({
            where: { id },
            relations: ['created_by']
        });
    }
    async findAll(options) {
        return await this.notificationEntityRepository.find({
            ...options,
            order: { created_at: 'DESC' },
            relations: options?.relations || ['created_by']
        });
    }
    async create(createNotificationDto) {
        const notification = this.notificationEntityRepository.create(createNotificationDto);
        return await this.notificationEntityRepository.save(notification);
    }
    async update(id, updateNotificationDto) {
        await this.notificationEntityRepository.update(id, updateNotificationDto);
        return await this.findById(id);
    }
    async remove(id) {
        const notification = await this.findById(id);
        if (notification) {
            await this.notificationEntityRepository.delete(id);
        }
        return notification;
    }
    async findAllPaginated(skip, limit) {
        return await this.notificationEntityRepository.findAndCount({
            skip,
            take: limit,
            relations: ['user']
        });
    }
};
exports.NotificationsRepository = NotificationsRepository;
exports.NotificationsRepository = NotificationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationsRepository);
//# sourceMappingURL=notifications.repository.js.map