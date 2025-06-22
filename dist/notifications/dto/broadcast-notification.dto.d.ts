import { TargetUser } from '../entities/notification.entity';
declare class Avatar {
    url: string;
    key: string;
}
declare class TargetContent {
    avatar: Avatar;
    title: string;
    desc: string;
    image?: Avatar;
    link?: string;
}
declare class Content {
    customer?: TargetContent;
    restaurant?: TargetContent;
    driver?: TargetContent;
    customer_care?: TargetContent;
}
export declare class BroadcastNotificationDto {
    target_user: TargetUser[];
    created_by_id: string;
    content: Content;
}
export {};
