import { MessageType } from '../entities/message.entity';
export declare class CreateMessageDto {
    roomId: string;
    senderId: string;
    messageType: MessageType;
    content: string;
}
