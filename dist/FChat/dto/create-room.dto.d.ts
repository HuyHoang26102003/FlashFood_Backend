import { RoomType } from '../entities/chat-room.entity';
import { Enum_UserType } from 'src/types/Payload';
export declare class CreateRoomDto {
    type: RoomType;
    participants: {
        userId: string;
        userType: Enum_UserType;
    }[];
}
