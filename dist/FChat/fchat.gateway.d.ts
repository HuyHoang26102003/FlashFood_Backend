import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FchatService } from './fchat.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Enum_UserType } from 'src/types/Payload';
import { MessageType } from './entities/message.entity';
import { RedisService } from 'src/redis/redis.service';
export declare class FchatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly fchatService;
    private readonly jwtService;
    private readonly usersService;
    private eventEmitter;
    private readonly redisService;
    server: Server;
    private userSockets;
    private activeChats;
    constructor(fchatService: FchatService, jwtService: JwtService, usersService: UsersService, eventEmitter: EventEmitter2, redisService: RedisService);
    afterInit(): void;
    private validateToken;
    handleConnection(client: Socket): Promise<void>;
    handleStartChat(client: Socket, data: {
        withUserId: string;
        type: 'SUPPORT' | 'ORDER';
        orderId?: string;
    }): Promise<{
        chatId: string;
        dbRoomId: any;
        type: "SUPPORT" | "ORDER";
    }>;
    handleMessage(client: Socket, data: {
        roomId: string;
        content: string;
        type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'ORDER_INFO';
    }): Promise<{
        id: string;
        roomId: string;
        senderId: string;
        senderType: Enum_UserType;
        content: string;
        messageType: MessageType;
        timestamp: string;
        readBy: string[];
        senderDetails: any;
    }>;
    private isValidChatId;
    handleGetChatHistoryEvent(data: {
        chatId: string;
        messages: any[];
    }): any[];
    handleGetChatHistory(client: Socket, data: {
        roomId: string;
    }): Promise<{
        roomId: string;
        messages: any;
    }>;
    handleGetAllChats(client: Socket): Promise<{
        ongoing: any;
        awaiting: any;
    }>;
    private formatContact;
    private formatPhone;
    private isValidChatCombination;
    private getChatId;
    private getSocketRoomIdFromDbRoom;
    handleDisconnect(client: Socket): void;
    private getUserType;
    handleRequestCustomerCare(client: Socket, data: {
        type: 'SUPPORT' | 'ORDER';
    }): Promise<void>;
    private findOptimalCustomerCare;
}
