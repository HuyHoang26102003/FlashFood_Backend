import { Message } from './message.entity';
import { Enum_UserType } from 'src/types/Payload';
import { Customer } from 'src/customers/entities/customer.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { CustomerCare } from 'src/customer_cares/entities/customer_care.entity';
export declare enum RoomType {
    SUPPORT = "SUPPORT",
    ORDER = "ORDER",
    ADMIN = "ADMIN"
}
export declare class ChatRoom {
    id: string;
    type: RoomType;
    participants: {
        userId: string;
        userType: Enum_UserType;
        customer?: Customer;
        driver?: Driver;
        restaurant?: Restaurant;
        customerCare?: CustomerCare;
    }[];
    relatedId: string;
    createdAt: Date;
    lastActivity: Date;
    messages: Message[];
}
