import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsRepository } from './notifications.repository';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ApiResponse } from 'src/utils/createResponse';
import { AdminRepository } from 'src/admin/admin.repository';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
export declare class NotificationsService {
    private readonly notificationsRepository;
    private readonly adminRepository;
    private notificationEntityRepository;
    constructor(notificationsRepository: NotificationsRepository, adminRepository: AdminRepository, notificationEntityRepository: Repository<Notification>);
    create(createNotificationDto: CreateNotificationDto): Promise<ApiResponse<Notification>>;
    findAll(): Promise<ApiResponse<Notification[]>>;
    findOne(id: string): Promise<ApiResponse<Notification>>;
    update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<ApiResponse<Notification>>;
    remove(id: string): Promise<ApiResponse<null>>;
    private handleNotificationResponse;
    private handleError;
    broadcast(broadcastNotificationDto: BroadcastNotificationDto): Promise<ApiResponse<Notification[]>>;
    findAllPaginated(page?: number, limit?: number): Promise<ApiResponse<{
        totalPages: number;
        currentPage: number;
        totalItems: number;
        items: Notification[];
    }>>;
}
