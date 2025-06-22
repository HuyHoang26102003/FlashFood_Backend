import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    create(createNotificationDto: CreateNotificationDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/notification.entity").Notification>>;
    findAll(): Promise<import("../utils/createResponse").ApiResponse<import("./entities/notification.entity").Notification[]>>;
    findAllPaginated(page?: string, limit?: string): Promise<import("../utils/createResponse").ApiResponse<{
        totalPages: number;
        currentPage: number;
        totalItems: number;
        items: import("./entities/notification.entity").Notification[];
    }>>;
    findOne(id: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/notification.entity").Notification>>;
    update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/notification.entity").Notification>>;
    remove(id: string): Promise<import("../utils/createResponse").ApiResponse<null>>;
    broadcast(broadcastNotificationDto: BroadcastNotificationDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/notification.entity").Notification[]>>;
}
