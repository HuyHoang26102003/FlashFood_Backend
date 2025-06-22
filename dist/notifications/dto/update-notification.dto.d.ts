import { CreateNotificationDto } from './create-notification.dto';
import { TargetUser } from '../entities/notification.entity';
declare const UpdateNotificationDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateNotificationDto>>;
export declare class UpdateNotificationDto extends UpdateNotificationDto_base {
    avatar?: {
        url: string;
        key: string;
    };
    title?: string;
    desc?: string;
    image?: string;
    link?: string;
    target_user?: TargetUser[];
    target_user_id?: string;
    is_read?: boolean;
}
export {};
