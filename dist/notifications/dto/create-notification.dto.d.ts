import { TargetUser } from '../entities/notification.entity';
export declare class CreateNotificationDto {
    avatar: {
        url: string;
        key: string;
    };
    title: string;
    desc: string;
    image?: string;
    link?: string;
    target_user: TargetUser[];
    created_by_id: string;
    target_user_id?: string;
}
