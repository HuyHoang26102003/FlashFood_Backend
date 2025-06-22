import { Enum_UserType } from 'src/types/Payload';
import { ChatRoom } from './chat-room.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { CustomerCare } from 'src/customer_cares/entities/customer_care.entity';
export declare enum MessageType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    ORDER_INFO = "ORDER_INFO"
}
export declare class Message {
    id: string;
    roomId: string;
    chatRoom: ChatRoom;
    senderId: string;
    senderType: Enum_UserType;
    customerSender: Customer;
    driverSender: Driver;
    restaurantSender: Restaurant;
    customerCareSender: CustomerCare;
    content: string;
    messageType: MessageType;
    timestamp: Date;
    readBy: string[];
}
