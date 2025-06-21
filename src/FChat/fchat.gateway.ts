import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  WsException
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FchatService } from './fchat.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Enum_UserType } from 'src/types/Payload';
import { RoomType } from './entities/chat-room.entity';
import { MessageType } from './entities/message.entity';
import { RedisService } from 'src/redis/redis.service';
import { ChatbotService, ChatbotResponse } from './chatbot.service';
import { SupportChatService, SupportSession } from './support-chat.service';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: ['*', 'http://localhost:3000', 'http://localhost:1310'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Authorization', 'auth', 'Content-Type']
  },
  transports: ['websocket', 'polling']
})
export class FchatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Socket>();
  private activeChats = new Map<
    string,
    {
      participants: string[];
      type: 'SUPPORT' | 'ORDER' | 'ADMIN';
      orderId?: string;
      dbRoomId: string;
    }
  >();

  constructor(
    private readonly fchatService: FchatService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
    private readonly chatbotService: ChatbotService,
    private readonly supportChatService: SupportChatService
  ) {}

  afterInit() {
    console.log('Chat Gateway initialized!');
    // Initialize support sessions from Redis
    this.supportChatService.initializeFromRedis();
  }

  private async validateToken(client: Socket): Promise<any> {
    try {
      let authHeader = client.handshake.headers.auth as string;
      console.log(
        'check anything heẻể?? ',
        client.handshake.auth,
        client.handshake.headers,
        client.handshake
      );
      if (!authHeader && client.handshake.auth && client.handshake.auth) {
        authHeader = client.handshake.auth.token;
      }

      console.log('check auth', authHeader);
      if (!authHeader?.startsWith('Bearer ')) {
        client.disconnect();
        return null;
      }

      const token = authHeader.slice(7);
      if (!token) {
        client.disconnect();
        return null;
      }

      const decoded = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET
      });

      return decoded;
    } catch (error: any) {
      console.error('Token validation error:', error);
      client.disconnect();
      return null;
    }
  }

  @SubscribeMessage('connect')
  async handleConnection(@ConnectedSocket() client: Socket) {
    const userData = await this.validateToken(client);
    if (!userData) return;
    console.log('check connect');
    client.data.user = userData;
    this.userSockets.set(userData.id, client);
    await client.join(`user_${userData.id}`);
  }

  @SubscribeMessage('startChat')
  async handleStartChat(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      withUserId: string;
      type: 'SUPPORT' | 'ORDER';
      orderId?: string;
    }
  ) {
    try {
      const recipientType = await this.getUserType(data.withUserId);
      const userData = await this.validateToken(client);
      if (!userData) {
        throw new WsException('Unauthorized');
      }

      let user_type;
      switch (userData.logged_in_as) {
        case Enum_UserType.CUSTOMER:
          user_type = Enum_UserType.CUSTOMER;
          break;
        case Enum_UserType.CUSTOMER_CARE_REPRESENTATIVE:
          user_type = Enum_UserType.CUSTOMER_CARE_REPRESENTATIVE;
          break;
        case Enum_UserType.DRIVER:
          user_type = Enum_UserType.DRIVER;
          break;
        case Enum_UserType.RESTAURANT_OWNER:
          user_type = Enum_UserType.RESTAURANT_OWNER;
          break;
        case Enum_UserType.ADMIN:
          user_type = Enum_UserType.ADMIN;
          break;
        default:
          user_type = Enum_UserType.CUSTOMER;
          break;
      }

      if (!this.isValidChatCombination(user_type, data.type, recipientType)) {
        client.emit('error', { message: 'Unauthorized chat type' });
        return;
      }

      const socketRoomId = this.getChatId(
        userData.id,
        data.withUserId,
        data.type
      );

      const cacheKey = `active_chat:${socketRoomId}`;
      const cachedRoom = await this.redisService.get(cacheKey);
      if (cachedRoom) {
        console.log(`Fetched room ${socketRoomId} from Redis cache`);
        const roomData = JSON.parse(cachedRoom);
        await client.join(socketRoomId);
        const recipientSocket = this.userSockets.get(data.withUserId);
        if (recipientSocket) {
          await recipientSocket.join(socketRoomId);
          recipientSocket.emit('chatStarted', {
            chatId: socketRoomId,
            withUser: userData.id,
            type: data.type,
            dbRoomId: roomData.dbRoomId
          });
        }
        client.emit('chatStarted', {
          chatId: socketRoomId,
          withUser: data.withUserId,
          type: data.type,
          dbRoomId: roomData.dbRoomId
        });
        return {
          chatId: socketRoomId,
          dbRoomId: roomData.dbRoomId,
          type: data.type
        };
      }

      const dbRoom = await this.fchatService.createRoom({
        type: data.type === 'SUPPORT' ? RoomType.SUPPORT : RoomType.ORDER,
        participants: [
          { userId: userData.id, userType: user_type },
          { userId: data.withUserId, userType: recipientType }
        ],
        relatedId: data.orderId,
        createdAt: new Date(),
        lastActivity: new Date()
      });

      // Lưu vào Redis
      const roomData = {
        participants: [userData.id, data.withUserId],
        type: data.type,
        orderId: data.orderId,
        dbRoomId: dbRoom.id
      };
      await this.redisService.setNx(
        cacheKey,
        JSON.stringify(roomData),
        86400 * 1000
      ); // TTL: 1 ngày
      this.activeChats.set(socketRoomId, roomData);

      await client.join(socketRoomId);
      console.log(`Sender ${userData.id} joined room ${socketRoomId}`);

      const recipientSocket = this.userSockets.get(data.withUserId);
      if (recipientSocket) {
        await recipientSocket.join(socketRoomId);
        console.log(`Recipient ${data.withUserId} joined room ${socketRoomId}`);
        recipientSocket.emit('chatStarted', {
          chatId: socketRoomId,
          withUser: userData.id,
          type: data.type,
          dbRoomId: dbRoom.id
        });
      }

      const socketsInRoom = await this.server.in(socketRoomId).allSockets();
      console.log(
        `Active sockets in room ${socketRoomId}:`,
        Array.from(socketsInRoom)
      );

      client.emit('chatStarted', {
        chatId: socketRoomId,
        withUser: data.withUserId,
        type: data.type,
        dbRoomId: dbRoom.id
      });

      return {
        chatId: socketRoomId,
        dbRoomId: dbRoom.id,
        type: data.type
      };
    } catch (error: any) {
      console.error('Error in startChat:', error);
      throw new WsException(error.message || 'Failed to start chat');
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      content: string;
      type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'ORDER_INFO';
    }
  ) {
    try {
      const user = client.data.user;
      console.log('Received sendMessage data:', data);

      // Fetch room from database
      const dbRoom = await this.fchatService.getRoomById(data.roomId);
      if (!dbRoom) {
        console.error(`Chat room not found for roomId: ${data.roomId}`);
        throw new WsException('Chat room not found');
      }

      // Check if user is a participant
      const isParticipant = dbRoom.participants.some(p => p.userId === user.id);
      if (!isParticipant) {
        console.error(
          `User ${user.id} is not a participant in room ${data.roomId}`
        );
        throw new WsException('Unauthorized to send message in this chat');
      }

      // Create message in database
      const dbMessage = await this.fchatService.createMessage({
        roomId: data.roomId,
        senderId: user.id,
        senderType: user.logged_in_as,
        content: data.content,
        messageType: data.type as MessageType,
        readBy: [user.id],
        timestamp: new Date()
      });

      await this.fchatService.updateRoomActivity(data.roomId);

      // Update chat history cache
      const chatHistoryKey = `chat_history:${data.roomId}`;
      const cachedMessages = await this.redisService.get(chatHistoryKey);
      const messages = cachedMessages ? JSON.parse(cachedMessages) : [];
      messages.push(dbMessage);
      await this.redisService.set(
        chatHistoryKey,
        JSON.stringify(messages),
        3600 * 1000
      );

      // Update all chats cache for all participants
      for (const participant of dbRoom.participants) {
        const userChatsKey = `user_chats:${participant.userId}`;
        await this.redisService.del(userChatsKey); // Invalidate the cache to force refresh
      }

      const formatContact = (
        contacts: Array<{
          title: string;
          email?: string;
          phone?: string;
          is_default: boolean;
        }> | null
      ): string => {
        if (!contacts || contacts.length === 0) return '';
        const defaultContact = contacts.find(c => c.is_default);
        return defaultContact ? defaultContact.phone : contacts[0].phone;
      };

      const formatPhone = (
        phones: Array<{
          title: string;
          number: string;
          is_default: boolean;
        }> | null
      ): string => {
        if (!phones || phones.length === 0) return '';
        const defaultPhone = phones.find(p => p.is_default);
        return defaultPhone ? defaultPhone.number : phones[0].number;
      };

      let senderDetails: any = null;
      switch (dbMessage.senderType) {
        case 'CUSTOMER':
          if (dbMessage.customerSender) {
            senderDetails = {
              id: dbMessage.customerSender.id,
              first_name: dbMessage.customerSender.first_name || '',
              last_name: dbMessage.customerSender.last_name || '',
              avatar: dbMessage.customerSender.avatar
                ? {
                    key: dbMessage.customerSender.avatar,
                    url: dbMessage.customerSender.avatar
                  }
                : null,
              phone: dbMessage.customerSender.phone || ''
            };
          }
          break;
        case 'DRIVER':
          if (dbMessage.driverSender) {
            senderDetails = {
              id: dbMessage.driverSender.id,
              first_name: dbMessage.driverSender.first_name || '',
              last_name: dbMessage.driverSender.last_name || '',
              avatar: dbMessage.driverSender.avatar
                ? {
                    key: dbMessage.driverSender.avatar,
                    url: dbMessage.driverSender.avatar
                  }
                : null,
              contact_email: formatContact(
                dbMessage.driverSender.contact_email
              ),
              contact_phone: formatContact(dbMessage.driverSender.contact_phone)
            };
          }
          break;
        case 'RESTAURANT_OWNER':
          if (dbMessage.restaurantSender) {
            senderDetails = {
              id: dbMessage.restaurantSender.id,
              restaurant_name: dbMessage.restaurantSender.restaurant_name || '',
              avatar: dbMessage.restaurantSender.avatar
                ? {
                    key: dbMessage.restaurantSender.avatar,
                    url: dbMessage.restaurantSender.avatar
                  }
                : null,
              contact_email: formatContact(
                dbMessage.restaurantSender.contact_email
              ),
              contact_phone: formatContact(
                dbMessage.restaurantSender.contact_phone
              )
            };
          }
          break;
        case 'CUSTOMER_CARE_REPRESENTATIVE':
          if (dbMessage.customerCareSender) {
            senderDetails = {
              id: dbMessage.customerCareSender.id,
              first_name: dbMessage.customerCareSender.first_name || '',
              last_name: dbMessage.customerCareSender.last_name || '',
              avatar: dbMessage.customerCareSender.avatar
                ? {
                    key: dbMessage.customerCareSender.avatar,
                    url: dbMessage.customerCareSender.avatar
                  }
                : null,
              contact_phone: formatPhone(
                dbMessage.customerCareSender.contact_phone
              )
            };
          }
          break;
      }

      // Construct the message object with senderDetails
      const message = {
        id: dbMessage.id,
        roomId: dbMessage.roomId,
        senderId: dbMessage.senderId,
        senderType: dbMessage.senderType,
        content: dbMessage.content,
        messageType: dbMessage.messageType,
        timestamp: dbMessage.timestamp.toISOString(),
        readBy: dbMessage.readBy,
        senderDetails
      };

      // Emit to all participants (including sender)
      const participants = dbRoom.participants.map(p => p.userId);
      for (const participantId of participants) {
        const participantSocket = this.userSockets.get(participantId);
        if (participantSocket) {
          participantSocket.emit('newMessage', message);
          console.log(`Emitted newMessage to ${participantId}`);
        } else {
          console.log(`Participant ${participantId} is offline`);
        }
      }

      return message;
    } catch (error: any) {
      console.error('Error in sendMessage:', error);
      throw new WsException(error.message || 'Failed to send message');
    }
  }

  // Utility function to validate chatId format
  private isValidChatId(chatId: string): boolean {
    // Assuming chatId is in the format: chat_user1_user2_type
    const chatIdRegex = /^chat_[0-9a-zA-Z_]+_[0-9a-zA-Z_]+_(SUPPORT|ORDER)$/; // Adjust regex as needed
    return chatIdRegex.test(chatId);
  }

  @OnEvent('chatHistory')
  handleGetChatHistoryEvent(data: { chatId: string; messages: any[] }) {
    console.log(`Chat history for ${data.chatId}:`, data.messages);
    return data.messages;
  }

  @SubscribeMessage('getChatHistory')
  async handleGetChatHistory(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    try {
      const user = client.data.user;
      if (!user) {
        throw new WsException('Unauthorized');
      }

      const cacheKey = `chat_history:${data.roomId}`;
      const ttl = 3600; // Cache 1 giờ

      // Kiểm tra Redis trước
      const cachedMessages = await this.redisService.get(cacheKey);
      if (cachedMessages) {
        console.log(`Fetched chat history for room ${data.roomId} from Redis`);
        const messages = JSON.parse(cachedMessages);
        client.emit('chatHistory', { roomId: data.roomId, messages });
        return { roomId: data.roomId, messages };
      }

      // Nếu không có trong cache, kiểm tra DB
      const dbRoom = await this.fchatService.getRoomById(data.roomId);
      if (!dbRoom) {
        console.error(`Chat room not found for roomId: ${data.roomId}`);
        throw new WsException('Chat room not found');
      }

      const isParticipant = dbRoom.participants.some(p => p.userId === user.id);
      if (!isParticipant) {
        console.error(
          `User ${user.id} is not a participant in room ${data.roomId}`
        );
        throw new WsException('Unauthorized to access this chat history');
      }

      const messages = await this.fchatService.getRoomMessages(data.roomId);
      console.log(
        `Retrieved ${messages.length} messages for room ${data.roomId}`
      );

      // Lưu vào Redis
      await this.redisService.setNx(
        cacheKey,
        JSON.stringify(messages),
        ttl * 1000
      );

      client.emit('chatHistory', { roomId: data.roomId, messages });
      return { roomId: data.roomId, messages };
    } catch (error: any) {
      console.error('Error getting chat history:', error);
      client.emit('error', {
        message: error.message || 'Failed to get chat history'
      });
      return { roomId: data.roomId, messages: [] };
    }
  }

  @SubscribeMessage('getAllChats')
  async handleGetAllChats(@ConnectedSocket() client: Socket) {
    try {
      const user = client.data.user;
      if (!user) {
        throw new WsException('Unauthorized');
      }

      const cacheKey = `user_chats:${user.id}`;
      const ttl = 300; // Cache 5 phút
      const cachedChats = await this.redisService.get(cacheKey);
      if (cachedChats) {
        console.log(`Fetched all chats for user ${user.id} from Redis`);
        const { ongoing, awaiting } = JSON.parse(cachedChats);
        client.emit('allChats', { ongoing, awaiting });
        return { ongoing, awaiting };
      }

      console.log('User requesting all chats:', user.id);

      const userChats = await this.fchatService.getRoomsByUserIdWithLastMessage(
        user.id
      );

      const processedChats = userChats.map(
        ({ room, lastMessage, otherParticipantDetails, userMessageCount }) => {
          const otherParticipant = room.participants.find(
            p => p.userId !== user.id
          );

          // Get sender details from the last message
          let senderDetails = null;
          if (lastMessage) {
            switch (lastMessage.senderType) {
              case Enum_UserType.CUSTOMER:
                senderDetails = lastMessage.customerSender
                  ? {
                      id: lastMessage.customerSender.id,
                      first_name: lastMessage.customerSender.first_name || '',
                      last_name: lastMessage.customerSender.last_name || '',
                      avatar: lastMessage.customerSender.avatar
                        ? {
                            key: lastMessage.customerSender.avatar,
                            url: lastMessage.customerSender.avatar
                          }
                        : null,
                      phone: lastMessage.customerSender.phone || ''
                    }
                  : null;
                break;
              case Enum_UserType.DRIVER:
                senderDetails = lastMessage.driverSender
                  ? {
                      id: lastMessage.driverSender.id,
                      first_name: lastMessage.driverSender.first_name || '',
                      last_name: lastMessage.driverSender.last_name || '',
                      avatar: lastMessage.driverSender.avatar
                        ? {
                            key: lastMessage.driverSender.avatar,
                            url: lastMessage.driverSender.avatar
                          }
                        : null,
                      contact_email: this.formatContact(
                        lastMessage.driverSender.contact_email
                      ),
                      contact_phone: this.formatContact(
                        lastMessage.driverSender.contact_phone
                      )
                    }
                  : null;
                break;
              case Enum_UserType.RESTAURANT_OWNER:
                senderDetails = lastMessage.restaurantSender
                  ? {
                      id: lastMessage.restaurantSender.id,
                      restaurant_name:
                        lastMessage.restaurantSender.restaurant_name || '',
                      avatar: lastMessage.restaurantSender.avatar
                        ? {
                            key: lastMessage.restaurantSender.avatar,
                            url: lastMessage.restaurantSender.avatar
                          }
                        : null,
                      contact_email: this.formatContact(
                        lastMessage.restaurantSender.contact_email
                      ),
                      contact_phone: this.formatContact(
                        lastMessage.restaurantSender.contact_phone
                      )
                    }
                  : null;
                break;
              case Enum_UserType.CUSTOMER_CARE_REPRESENTATIVE:
                senderDetails = lastMessage.customerCareSender
                  ? {
                      id: lastMessage.customerCareSender.id,
                      first_name:
                        lastMessage.customerCareSender.first_name || '',
                      last_name: lastMessage.customerCareSender.last_name || '',
                      avatar: lastMessage.customerCareSender.avatar
                        ? {
                            key: lastMessage.customerCareSender.avatar,
                            url: lastMessage.customerCareSender.avatar
                          }
                        : null,
                      contact_phone: this.formatPhone(
                        lastMessage.customerCareSender.contact_phone
                      )
                    }
                  : null;
                break;
            }
          }

          const chatInfo = {
            roomId: room.id,
            type: room.type,
            otherParticipant: {
              userId: otherParticipant?.userId,
              userType: otherParticipant?.userType,
              ...otherParticipantDetails
            },
            lastMessage: lastMessage
              ? {
                  id: lastMessage.id,
                  roomId: lastMessage.roomId,
                  senderId: lastMessage.senderId,
                  senderType: lastMessage.senderType,
                  content: lastMessage.content,
                  messageType: lastMessage.messageType,
                  timestamp: lastMessage.timestamp.toISOString(),
                  readBy: lastMessage.readBy,
                  sender: senderDetails
                }
              : null,
            lastActivity: room.lastActivity.toISOString(),
            relatedId: room.relatedId
          };

          // Chat is awaiting only if the user has never sent any messages
          const isAwaiting = userMessageCount === 0;

          return {
            chatInfo,
            isAwaiting
          };
        }
      );

      const ongoingChats = processedChats
        .filter(chat => !chat.isAwaiting)
        .map(chat => chat.chatInfo)
        .sort(
          (a, b) =>
            new Date(b.lastActivity).getTime() -
            new Date(a.lastActivity).getTime()
        );

      const awaitingChats = processedChats
        .filter(chat => chat.isAwaiting)
        .map(chat => chat.chatInfo)
        .sort(
          (a, b) =>
            new Date(b.lastActivity).getTime() -
            new Date(a.lastActivity).getTime()
        );

      console.log(
        `Found ${ongoingChats.length} ongoing chats and ${awaitingChats.length} awaiting chats`
      );
      await this.redisService.setNx(
        cacheKey,
        JSON.stringify({ ongoing: ongoingChats, awaiting: awaitingChats }),
        ttl * 1000
      );

      client.emit('allChats', {
        ongoing: ongoingChats,
        awaiting: awaitingChats
      });

      return {
        ongoing: ongoingChats,
        awaiting: awaitingChats
      };
    } catch (error: any) {
      console.error('Error getting all chats:', error);
      client.emit('error', {
        message: error.message || 'Failed to get all chats'
      });
      return {
        ongoing: [],
        awaiting: []
      };
    }
  }

  private formatContact(
    contacts: Array<{
      title: string;
      phone?: string;
      is_default: boolean;
    }> | null
  ): string {
    if (!contacts || contacts.length === 0) return '';
    const defaultContact = contacts.find(c => c.is_default);
    return defaultContact ? defaultContact.phone : contacts[0].phone;
  }

  // Utility function to format phone field (jsonb array for CustomerCare)
  private formatPhone(
    phones: Array<{ title: string; number: string; is_default: boolean }> | null
  ): string {
    if (!phones || phones.length === 0) return '';
    const defaultPhone = phones.find(p => p.is_default);
    return defaultPhone ? defaultPhone.number : phones[0].number;
  }

  private isValidChatCombination(
    userType: string,
    chatType: 'ORDER' | 'SUPPORT',
    recipientType: string
  ): boolean {
    if (chatType === 'SUPPORT') {
      const validSupportCombinations = {
        CUSTOMER: ['CUSTOMER_CARE_REPRESENTATIVE'],
        DRIVER: ['CUSTOMER_CARE_REPRESENTATIVE'],
        RESTAURANT_OWNER: ['CUSTOMER_CARE_REPRESENTATIVE'],
        CUSTOMER_CARE_REPRESENTATIVE: [
          'CUSTOMER',
          'DRIVER',
          'RESTAURANT_OWNER'
        ],
        ADMIN: [
          'CUSTOMER',
          'DRIVER',
          'RESTAURANT_OWNER',
          'CUSTOMER_CARE_REPRESENTATIVE'
        ]
      };
      return (
        validSupportCombinations[userType]?.includes(recipientType) || false
      );
    }

    if (chatType === 'ORDER') {
      const validOrderCombinations = {
        CUSTOMER: ['DRIVER', 'RESTAURANT_OWNER'],
        DRIVER: ['CUSTOMER'],
        RESTAURANT_OWNER: ['CUSTOMER'],
        ADMIN: ['CUSTOMER', 'DRIVER', 'RESTAURANT_OWNER']
      };
      return validOrderCombinations[userType]?.includes(recipientType) || false;
    }

    return false;
  }

  private getChatId(user1: string, user2: string, type: string): string {
    return `chat_${[user1, user2].sort().join('_')}_${type}`;
  }

  // Helper method to generate socket room ID from database room
  private getSocketRoomIdFromDbRoom(dbRoom: any): string {
    const participants = dbRoom.participants.map(p => p.userId).sort();
    return `chat_${participants.join('_')}_${dbRoom.type}`;
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.id;
    console.log('❌ Client disconnected from chat namespace:', client.id);

    this.userSockets.delete(client.data.user?.id);
    this.fchatService.removeConnection(client.id);
    this.redisService.del(`user:${userId}`);
  }

  private getUserType(userId: string): Enum_UserType {
    if (!userId) {
      console.warn('No userId provided');
      return null;
    }

    if (userId.startsWith('FF_CUS')) {
      return Enum_UserType.CUSTOMER;
    } else if (userId.startsWith('FF_RES')) {
      return Enum_UserType.RESTAURANT_OWNER;
    } else if (userId.startsWith('FF_DRI')) {
      return Enum_UserType.DRIVER;
    } else if (userId.startsWith('FF_CC')) {
      return Enum_UserType.CUSTOMER_CARE_REPRESENTATIVE;
    } else if (userId.startsWith('FF_ADMIN')) {
      return Enum_UserType.ADMIN;
    }

    console.warn(`Unknown user type for userId: ${userId}`);
    return null;
  }

  @SubscribeMessage('requestCustomerCare')
  async handleRequestCustomerCare(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { type: 'SUPPORT' | 'ORDER' }
  ) {
    try {
      const userData = await this.validateToken(client);
      if (!userData) {
        throw new WsException('Unauthorized');
      }

      const chatRoomId = this.getChatId(
        userData.id,
        'customer_care',
        data.type
      );

      // Emit event to customer care gateway using EventEmitter2
      this.eventEmitter.emit('customerCareRequest', {
        userId: userData.id,
        type: data.type,
        chatRoomId
      });

      // Wait for 10 seconds to find the most suitable customer care representative
      setTimeout(async () => {
        const optimalCustomerCare = await this.findOptimalCustomerCare();
        if (optimalCustomerCare) {
          const socketRoomId = this.getChatId(
            userData.id,
            optimalCustomerCare.id,
            data.type
          );
          await client.join(socketRoomId);
          const recipientSocket = this.userSockets.get(optimalCustomerCare.id);
          if (recipientSocket) {
            await recipientSocket.join(socketRoomId);
            recipientSocket.emit('chatStarted', {
              chatId: socketRoomId,
              withUser: userData.id,
              type: data.type
            });
          }
          client.emit('chatStarted', {
            chatId: socketRoomId,
            withUser: optimalCustomerCare.id,
            type: data.type
          });
        } else {
          client.emit('error', {
            message: 'No customer care representative available'
          });
        }
      }, 10000); // 10 seconds
    } catch (error: any) {
      console.error('Error in requestCustomerCare:', error);
      throw new WsException(error.message || 'Failed to request customer care');
    }
  }

  private async findOptimalCustomerCare(): Promise<any> {
    // Implement logic to find the most suitable customer care representative
    // This could be based on availability, load, expertise, etc.
    return { id: 'FF_CC_12345' }; // Example return value
  }

  @OnEvent('customerCareAssigned')
  async handleCustomerCareAssigned(data: {
    userId: string;
    customerCareId: string;
    type: 'SUPPORT' | 'ORDER';
    originalChatRoomId: string;
  }) {
    const { userId, customerCareId, type } = data;

    // Tạo socketRoomId
    const socketRoomId = this.getChatId(userId, customerCareId, type);
    // Ví dụ: chat_FF_CUS_430b0b56-df21-4ac4-ac98-904dd522f0ee_FF_CC_320571da-59d0-483a-9c39-912d2a72b256_SUPPORT

    // Khóa Redis để tránh trùng lặp
    const lockKey = `lock:chat:${socketRoomId}`;
    const lockAcquired = await this.redisService.setNx(lockKey, '1', 60 * 1000); // Khóa 60 giây

    if (!lockAcquired) {
      console.log(`Room creation for ${socketRoomId} is already in progress`);
      return; // Bỏ qua nếu khóa đã tồn tại
    }

    try {
      // Kiểm tra phòng trong Redis
      const cacheKey = `active_chat:${socketRoomId}`;
      const cachedRoom = await this.redisService.get(cacheKey);
      if (cachedRoom) {
        console.log(`Room ${socketRoomId} already exists in Redis`);
        const roomData = JSON.parse(cachedRoom);
        // Đưa người dùng vào phòng hiện có
        const clientSocket = this.userSockets.get(userId);
        const careSocket = this.userSockets.get(customerCareId);

        if (clientSocket) {
          await clientSocket.join(socketRoomId);
          clientSocket.emit('chatStarted', {
            chatId: socketRoomId,
            withUser: customerCareId,
            type,
            dbRoomId: roomData.dbRoomId
          });
        }

        if (careSocket) {
          await careSocket.join(socketRoomId);
          careSocket.emit('chatStarted', {
            chatId: socketRoomId,
            withUser: userId,
            type,
            dbRoomId: roomData.dbRoomId
          });
        }

        return;
      }

      // Tạo phòng trong cơ sở dữ liệu nếu chưa tồn tại
      const dbRoom = await this.fchatService.createRoom({
        type: type === 'SUPPORT' ? RoomType.SUPPORT : RoomType.ORDER,
        participants: [
          { userId, userType: Enum_UserType.CUSTOMER },
          {
            userId: customerCareId,
            userType: Enum_UserType.CUSTOMER_CARE_REPRESENTATIVE
          }
        ],
        createdAt: new Date(),
        lastActivity: new Date()
      });

      // Lưu vào Redis
      const roomData = {
        participants: [userId, customerCareId],
        type,
        dbRoomId: dbRoom.id
      };
      await this.redisService.setNx(
        cacheKey,
        JSON.stringify(roomData),
        86400 * 1000
      );
      this.activeChats.set(socketRoomId, roomData);

      // Đưa khách hàng và nhân viên vào phòng
      const clientSocket = this.userSockets.get(userId);
      const careSocket = this.userSockets.get(customerCareId);

      if (clientSocket) {
        await clientSocket.join(socketRoomId);
        clientSocket.emit('chatStarted', {
          chatId: socketRoomId,
          withUser: customerCareId,
          type,
          dbRoomId: dbRoom.id
        });
      }

      if (careSocket) {
        await careSocket.join(socketRoomId);
        careSocket.emit('chatStarted', {
          chatId: socketRoomId,
          withUser: userId,
          type,
          dbRoomId: dbRoom.id
        });
      }
    } finally {
      // Giải phóng khóa
      await this.redisService.del(lockKey);
    }
  }

  // ============ SUPPORT CHAT & CHATBOT FUNCTIONALITY ============

  @SubscribeMessage('startSupportChat')
  async handleStartSupportChat(@ConnectedSocket() client: Socket) {
    try {
      const userData = await this.validateToken(client);
      if (!userData) {
        throw new WsException('Unauthorized');
      }

      // Check if user already has an active support session
      const existingSession = this.supportChatService.getUserActiveSession(
        userData.id
      );
      if (existingSession) {
        client.emit('supportChatStarted', {
          sessionId: existingSession.sessionId,
          chatMode: existingSession.chatMode,
          status: existingSession.status
        });
        return existingSession;
      }

      // Create new support session
      const session = await this.supportChatService.startSupportSession(
        userData.id,
        userData.logged_in_as
      );

      // Join support room
      await client.join(`support_${session.sessionId}`);

      // Send welcome message from chatbot
      const greeting = this.chatbotService.getGreeting();
      client.emit('chatbotMessage', {
        sessionId: session.sessionId,
        message: greeting.message,
        type: greeting.type,
        options: greeting.options,
        timestamp: new Date().toISOString(),
        sender: 'FlashFood Bot'
      });

      client.emit('supportChatStarted', {
        sessionId: session.sessionId,
        chatMode: session.chatMode,
        status: session.status
      });

      return session;
    } catch (error: any) {
      console.error('Error starting support chat:', error);
      throw new WsException(error.message || 'Failed to start support chat');
    }
  }

  @SubscribeMessage('sendSupportMessage')
  async handleSupportMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; message: string }
  ) {
    try {
      const userData = await this.validateToken(client);
      if (!userData) {
        throw new WsException('Unauthorized');
      }

      const session = this.supportChatService.getSession(data.sessionId);
      if (!session || session.userId !== userData.id) {
        throw new WsException('Invalid session');
      }

      // Emit user message to room
      this.server.to(`support_${data.sessionId}`).emit('userMessage', {
        sessionId: data.sessionId,
        message: data.message,
        timestamp: new Date().toISOString(),
        sender: userData.id,
        senderType: userData.logged_in_as
      });

      if (session.chatMode === 'bot') {
        // Get chatbot response
        const response = this.chatbotService.getResponse(data.message);

        if (response.type === 'transfer') {
          // User wants to connect to human
          const connected = await this.supportChatService.requestHumanAgent(
            data.sessionId
          );

          if (connected) {
            client.emit('chatbotMessage', {
              sessionId: data.sessionId,
              message:
                "✅ You've been connected to a customer care representative!",
              type: 'text',
              timestamp: new Date().toISOString(),
              sender: 'FlashFood Bot'
            });
          } else {
            const queueStatus = this.supportChatService.getQueueStatus();
            client.emit('chatbotMessage', {
              sessionId: data.sessionId,
              message: `⏳ All our agents are currently busy. You're in position ${queueStatus.position} in the queue. Estimated wait time: ${queueStatus.estimatedWait} minutes.\n\nI can continue helping you while you wait!`,
              type: 'text',
              timestamp: new Date().toISOString(),
              sender: 'FlashFood Bot'
            });
          }
        } else {
          // Send chatbot response
          setTimeout(() => {
            client.emit('chatbotMessage', {
              sessionId: data.sessionId,
              message: response.message,
              type: response.type,
              options: response.options,
              timestamp: new Date().toISOString(),
              sender: 'FlashFood Bot'
            });
          }, 1000); // Simulate typing delay
        }
      } else if (session.chatMode === 'human' && session.agentId) {
        // Forward message to agent
        const agentSocket = this.userSockets.get(session.agentId);
        if (agentSocket) {
          agentSocket.emit('customerMessage', {
            sessionId: data.sessionId,
            message: data.message,
            timestamp: new Date().toISOString(),
            customerId: userData.id,
            customerType: userData.logged_in_as
          });
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error handling support message:', error);
      throw new WsException(error.message || 'Failed to send message');
    }
  }

  @SubscribeMessage('agentJoinSession')
  async handleAgentJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string }
  ) {
    try {
      const userData = await this.validateToken(client);
      if (!userData) {
        throw new WsException('Unauthorized');
      }

      // Verify user is an agent/admin
      if (
        userData.logged_in_as !== 'CUSTOMER_CARE_REPRESENTATIVE' &&
        userData.logged_in_as !== 'ADMIN'
      ) {
        throw new WsException('Unauthorized - Agent access required');
      }

      const session = this.supportChatService.getSession(data.sessionId);
      if (!session) {
        throw new WsException('Session not found');
      }

      // Join support room
      await client.join(`support_${data.sessionId}`);

      // Make agent available for future sessions
      await this.supportChatService.agentAvailable(userData.id);

      client.emit('agentJoinedSession', {
        sessionId: data.sessionId,
        customerId: session.userId,
        customerType: session.userType
      });

      // Notify customer that agent joined
      const customerSocket = this.userSockets.get(session.userId);
      if (customerSocket) {
        customerSocket.emit('agentConnected', {
          sessionId: data.sessionId,
          agentId: userData.id,
          message: '👋 A customer care representative has joined the chat!'
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error agent joining session:', error);
      throw new WsException(error.message || 'Failed to join session');
    }
  }

  @SubscribeMessage('sendAgentMessage')
  async handleAgentMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; message: string }
  ) {
    try {
      const userData = await this.validateToken(client);
      if (!userData) {
        throw new WsException('Unauthorized');
      }

      const session = this.supportChatService.getSession(data.sessionId);
      if (!session || session.agentId !== userData.id) {
        throw new WsException('Invalid session or unauthorized');
      }

      // Send message to customer
      const customerSocket = this.userSockets.get(session.userId);
      if (customerSocket) {
        customerSocket.emit('agentMessage', {
          sessionId: data.sessionId,
          message: data.message,
          timestamp: new Date().toISOString(),
          agentId: userData.id,
          sender: 'Customer Care'
        });
      }

      // Also emit to room for logging
      this.server.to(`support_${data.sessionId}`).emit('agentMessage', {
        sessionId: data.sessionId,
        message: data.message,
        timestamp: new Date().toISOString(),
        agentId: userData.id,
        sender: 'Customer Care'
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error sending agent message:', error);
      throw new WsException(error.message || 'Failed to send message');
    }
  }

  @SubscribeMessage('endSupportSession')
  async handleEndSupportSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string }
  ) {
    try {
      const userData = await this.validateToken(client);
      if (!userData) {
        throw new WsException('Unauthorized');
      }

      const session = this.supportChatService.getSession(data.sessionId);
      if (!session) {
        throw new WsException('Session not found');
      }

      // Verify user is participant
      if (session.userId !== userData.id && session.agentId !== userData.id) {
        throw new WsException('Unauthorized to end this session');
      }

      // End the session
      await this.supportChatService.endSession(data.sessionId);

      // Notify all participants
      this.server.to(`support_${data.sessionId}`).emit('sessionEnded', {
        sessionId: data.sessionId,
        timestamp: new Date().toISOString()
      });

      // Leave room
      client.leave(`support_${data.sessionId}`);

      return { success: true };
    } catch (error: any) {
      console.error('Error ending support session:', error);
      throw new WsException(error.message || 'Failed to end session');
    }
  }

  @SubscribeMessage('switchChatMode')
  async handleSwitchChatMode(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; mode: 'bot' | 'human' }
  ) {
    try {
      const userData = await this.validateToken(client);
      if (!userData) {
        throw new WsException('Unauthorized');
      }

      const session = this.supportChatService.getSession(data.sessionId);
      if (!session || session.userId !== userData.id) {
        throw new WsException('Invalid session');
      }

      const success = await this.supportChatService.switchChatMode(
        data.sessionId,
        data.mode
      );

      if (success && data.mode === 'human') {
        client.emit('chatModeChanged', {
          sessionId: data.sessionId,
          mode: 'human',
          message: '✅ Switched to human agent mode!'
        });
      } else if (success && data.mode === 'bot') {
        client.emit('chatModeChanged', {
          sessionId: data.sessionId,
          mode: 'bot',
          message: '🤖 Switched back to bot mode!'
        });
      } else {
        const queueStatus = this.supportChatService.getQueueStatus();
        client.emit('chatModeChanged', {
          sessionId: data.sessionId,
          mode: 'human',
          message: `⏳ Added to queue. Position: ${queueStatus.position}, Estimated wait: ${queueStatus.estimatedWait} minutes`
        });
      }

      return { success };
    } catch (error: any) {
      console.error('Error switching chat mode:', error);
      throw new WsException(error.message || 'Failed to switch mode');
    }
  }

  // Event listeners for support system
  @OnEvent('agentAssigned')
  async handleAgentAssigned(data: {
    sessionId: string;
    userId: string;
    agentId: string;
    userType: string;
  }) {
    // Notify customer that agent was assigned
    const customerSocket = this.userSockets.get(data.userId);
    if (customerSocket) {
      customerSocket.emit('agentAssigned', {
        sessionId: data.sessionId,
        agentId: data.agentId,
        message: "✅ You've been connected to a customer care representative!"
      });
    }

    // Notify agent
    const agentSocket = this.userSockets.get(data.agentId);
    if (agentSocket) {
      agentSocket.emit('newCustomerAssigned', {
        sessionId: data.sessionId,
        customerId: data.userId,
        customerType: data.userType,
        message: '📞 New customer assigned to you!'
      });
    }
  }
}
