import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
export declare class NotificationsRepository {
    private notificationEntityRepository;
    constructor(notificationEntityRepository: Repository<Notification>);
    findById(id: string): Promise<Notification>;
    findAll(options?: any): Promise<Notification[]>;
    create(createNotificationDto: any): Promise<any>;
    update(id: string, updateNotificationDto: any): Promise<Notification>;
    remove(id: string): Promise<Notification>;
    findAllPaginated(skip: number, limit: number): Promise<[Notification[], number]>;
}
