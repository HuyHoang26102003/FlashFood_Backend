"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FchatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("./entities/message.entity");
const chat_room_entity_1 = require("./entities/chat-room.entity");
const Payload_1 = require("../types/Payload");
const customer_entity_1 = require("../customers/entities/customer.entity");
const driver_entity_1 = require("../drivers/entities/driver.entity");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const customer_care_entity_1 = require("../customer_cares/entities/customer_care.entity");
let FchatService = class FchatService {
    constructor(messageRepository, roomRepository, customerRepository, driverRepository, restaurantRepository, customerCareRepository) {
        this.messageRepository = messageRepository;
        this.roomRepository = roomRepository;
        this.customerRepository = customerRepository;
        this.driverRepository = driverRepository;
        this.restaurantRepository = restaurantRepository;
        this.customerCareRepository = customerCareRepository;
        this.connections = new Map();
    }
    async addConnection(socketId, user) {
        this.connections.set(socketId, user);
    }
    async removeConnection(socketId) {
        this.connections.delete(socketId);
    }
    async getRoomById(roomId) {
        return this.roomRepository.findOne({ where: { id: roomId } });
    }
    async getRoomByParticipantsAndType(participantIds, type) {
        try {
            const room = await this.roomRepository
                .createQueryBuilder('chatRoom')
                .where('chatRoom.type = :type', { type })
                .andWhere('chatRoom.participants @> :participants', {
                participants: participantIds.map(id => ({ userId: id }))
            })
                .getOne();
            return room || null;
        }
        catch (error) {
            console.error('Error finding room by participants and type:', error);
            return null;
        }
    }
    async createMessage(messageData) {
        let senderDetails;
        switch (messageData.senderType) {
            case Payload_1.Enum_UserType.CUSTOMER:
                senderDetails = await this.customerRepository
                    .createQueryBuilder('customer')
                    .select([
                    'customer.id',
                    'customer.first_name',
                    'customer.last_name',
                    'customer.avatar',
                    'customer.phone'
                ])
                    .where('customer.id = :id', { id: messageData.senderId })
                    .getOne();
                if (senderDetails) {
                    senderDetails.first_name = senderDetails.first_name || '';
                    senderDetails.last_name = senderDetails.last_name || '';
                    senderDetails.avatar = senderDetails.avatar || null;
                    senderDetails.phone = senderDetails.phone || '';
                }
                break;
            case Payload_1.Enum_UserType.DRIVER:
                senderDetails = await this.driverRepository
                    .createQueryBuilder('driver')
                    .select([
                    'driver.id',
                    'driver.first_name',
                    'driver.last_name',
                    'driver.avatar',
                    'driver.contact_email',
                    'driver.contact_phone'
                ])
                    .where('driver.id = :id', { id: messageData.senderId })
                    .getOne();
                if (senderDetails) {
                    senderDetails.first_name = senderDetails.first_name || '';
                    senderDetails.last_name = senderDetails.last_name || '';
                    senderDetails.avatar = senderDetails.avatar || null;
                    senderDetails.contact_email = senderDetails.contact_email || [];
                    senderDetails.contact_phone = senderDetails.contact_phone || [];
                }
                break;
            case Payload_1.Enum_UserType.RESTAURANT_OWNER:
                senderDetails = await this.restaurantRepository
                    .createQueryBuilder('restaurant')
                    .select([
                    'restaurant.id',
                    'restaurant.restaurant_name',
                    'restaurant.avatar',
                    'restaurant.contact_email',
                    'restaurant.contact_phone'
                ])
                    .where('restaurant.id = :id', { id: messageData.senderId })
                    .getOne();
                if (senderDetails) {
                    senderDetails.restaurant_name = senderDetails.restaurant_name || '';
                    senderDetails.avatar = senderDetails.avatar || null;
                    senderDetails.contact_email = senderDetails.contact_email || [];
                    senderDetails.contact_phone = senderDetails.contact_phone || [];
                }
                break;
            case Payload_1.Enum_UserType.CUSTOMER_CARE_REPRESENTATIVE:
                senderDetails = await this.customerCareRepository
                    .createQueryBuilder('customerCare')
                    .select([
                    'customerCare.id',
                    'customerCare.first_name',
                    'customerCare.last_name',
                    'customerCare.avatar',
                    'customerCare.contact_phone'
                ])
                    .where('customerCare.id = :id', { id: messageData.senderId })
                    .getOne();
                if (senderDetails) {
                    senderDetails.first_name = senderDetails.first_name || '';
                    senderDetails.last_name = senderDetails.last_name || '';
                    senderDetails.avatar = senderDetails.avatar || null;
                    senderDetails.contact_phone = senderDetails.contact_phone || [];
                }
                break;
            default:
                throw new Error(`Invalid senderType: ${messageData.senderType}`);
        }
        if (!senderDetails) {
            throw new Error(`Sender not found for ID: ${messageData.senderId}`);
        }
        const message = this.messageRepository.create({
            ...messageData,
            [messageData.senderType.toLowerCase() + 'Sender']: senderDetails
        });
        const savedMessage = await this.messageRepository.save(message);
        const query = this.messageRepository
            .createQueryBuilder('message')
            .select([
            'message.id',
            'message.roomId',
            'message.senderId',
            'message.senderType',
            'message.content',
            'message.messageType',
            'message.timestamp',
            'message.readBy'
        ])
            .leftJoin('message.customerSender', 'customerSender', 'message.senderType = :customerType', { customerType: Payload_1.Enum_UserType.CUSTOMER })
            .leftJoin('message.driverSender', 'driverSender', 'message.senderType = :driverType', { driverType: Payload_1.Enum_UserType.DRIVER })
            .leftJoin('message.restaurantSender', 'restaurantSender', 'message.senderType = :restaurantType', { restaurantType: Payload_1.Enum_UserType.RESTAURANT_OWNER })
            .leftJoin('message.customerCareSender', 'customerCareSender', 'message.senderType = :customerCareType', { customerCareType: Payload_1.Enum_UserType.CUSTOMER_CARE_REPRESENTATIVE })
            .addSelect([
            'customerSender.id',
            'customerSender.first_name',
            'customerSender.last_name',
            'customerSender.avatar',
            'customerSender.phone'
        ])
            .addSelect([
            'driverSender.id',
            'driverSender.first_name',
            'driverSender.last_name',
            'driverSender.avatar',
            'driverSender.contact_email',
            'driverSender.contact_phone'
        ])
            .addSelect([
            'restaurantSender.id',
            'restaurantSender.restaurant_name',
            'restaurantSender.avatar',
            'restaurantSender.contact_email',
            'restaurantSender.contact_phone'
        ])
            .addSelect([
            'customerCareSender.id',
            'customerCareSender.first_name',
            'customerCareSender.last_name',
            'customerCareSender.avatar',
            'customerCareSender.contact_phone'
        ])
            .where('message.id = :id', { id: savedMessage.id });
        console.log('Generated SQL:', await query.getSql());
        const messageWithRelations = await query.getOne();
        if (!messageWithRelations) {
            throw new Error('Failed to fetch message with relations');
        }
        if (messageWithRelations.customerSender) {
            messageWithRelations.customerSender.first_name =
                messageWithRelations.customerSender.first_name || '';
            messageWithRelations.customerSender.last_name =
                messageWithRelations.customerSender.last_name || '';
            messageWithRelations.customerSender.avatar =
                messageWithRelations.customerSender.avatar || null;
            messageWithRelations.customerSender.phone =
                messageWithRelations.customerSender.phone || '';
        }
        if (messageWithRelations.driverSender) {
            messageWithRelations.driverSender.first_name =
                messageWithRelations.driverSender.first_name || '';
            messageWithRelations.driverSender.last_name =
                messageWithRelations.driverSender.last_name || '';
            messageWithRelations.driverSender.avatar =
                messageWithRelations.driverSender.avatar || null;
            messageWithRelations.driverSender.contact_email =
                messageWithRelations.driverSender.contact_email || [];
            messageWithRelations.driverSender.contact_phone =
                messageWithRelations.driverSender.contact_phone || [];
        }
        if (messageWithRelations.restaurantSender) {
            messageWithRelations.restaurantSender.restaurant_name =
                messageWithRelations.restaurantSender.restaurant_name || '';
            messageWithRelations.restaurantSender.avatar =
                messageWithRelations.restaurantSender.avatar || null;
            messageWithRelations.restaurantSender.contact_email =
                messageWithRelations.restaurantSender.contact_email || [];
            messageWithRelations.restaurantSender.contact_phone =
                messageWithRelations.restaurantSender.contact_phone || [];
        }
        if (messageWithRelations.customerCareSender) {
            messageWithRelations.customerCareSender.first_name =
                messageWithRelations.customerCareSender.first_name || '';
            messageWithRelations.customerCareSender.last_name =
                messageWithRelations.customerCareSender.last_name || '';
            messageWithRelations.customerCareSender.avatar =
                messageWithRelations.customerCareSender.avatar || null;
            messageWithRelations.customerCareSender.contact_phone =
                messageWithRelations.customerCareSender.contact_phone || [];
        }
        return messageWithRelations;
    }
    async createRoom(roomData) {
        console.log('check room created', roomData);
        const room = this.roomRepository.create(roomData);
        return this.roomRepository.save(room);
    }
    async getRoomMessages(roomId) {
        const messages = await this.messageRepository
            .createQueryBuilder('message')
            .select([
            'message.id',
            'message.roomId',
            'message.senderId',
            'message.senderType',
            'message.content',
            'message.messageType',
            'message.timestamp',
            'message.readBy'
        ])
            .leftJoin('message.customerSender', 'customerSender', 'message.senderType = :customerType', {
            customerType: Payload_1.Enum_UserType.CUSTOMER
        })
            .leftJoin('message.driverSender', 'driverSender', 'message.senderType = :driverType', {
            driverType: Payload_1.Enum_UserType.DRIVER
        })
            .leftJoin('message.restaurantSender', 'restaurantSender', 'message.senderType = :restaurantType', {
            restaurantType: Payload_1.Enum_UserType.RESTAURANT_OWNER
        })
            .leftJoin('message.customerCareSender', 'customerCareSender', 'message.senderType = :customerCareType', {
            customerCareType: Payload_1.Enum_UserType.CUSTOMER_CARE_REPRESENTATIVE
        })
            .addSelect([
            'customerSender.id',
            'customerSender.first_name',
            'customerSender.last_name',
            'customerSender.avatar',
            'customerSender.phone'
        ])
            .addSelect([
            'driverSender.id',
            'driverSender.first_name',
            'driverSender.last_name',
            'driverSender.avatar',
            'driverSender.contact_email',
            'driverSender.contact_phone'
        ])
            .addSelect([
            'restaurantSender.id',
            'restaurantSender.restaurant_name',
            'restaurantSender.avatar',
            'restaurantSender.contact_email',
            'restaurantSender.contact_phone'
        ])
            .addSelect([
            'customerCareSender.id',
            'customerCareSender.first_name',
            'customerCareSender.last_name',
            'customerCareSender.avatar',
            'customerCareSender.contact_phone'
        ])
            .where('message.roomId = :roomId', { roomId })
            .orderBy('message.timestamp', 'ASC')
            .getMany();
        return messages.map(message => {
            if (message.customerSender) {
                message.customerSender.first_name =
                    message.customerSender.first_name || '';
                message.customerSender.last_name =
                    message.customerSender.last_name || '';
                message.customerSender.avatar = message.customerSender.avatar || null;
                message.customerSender.phone = message.customerSender.phone || '';
            }
            if (message.driverSender) {
                message.driverSender.first_name = message.driverSender.first_name || '';
                message.driverSender.last_name = message.driverSender.last_name || '';
                message.driverSender.avatar = message.driverSender.avatar || null;
                message.driverSender.contact_email =
                    message.driverSender.contact_email || [];
                message.driverSender.contact_phone =
                    message.driverSender.contact_phone || [];
            }
            if (message.restaurantSender) {
                message.restaurantSender.restaurant_name =
                    message.restaurantSender.restaurant_name || '';
                message.restaurantSender.avatar =
                    message.restaurantSender.avatar || null;
                message.restaurantSender.contact_email =
                    message.restaurantSender.contact_email || [];
                message.restaurantSender.contact_phone =
                    message.restaurantSender.contact_phone || [];
            }
            if (message.customerCareSender) {
                message.customerCareSender.first_name =
                    message.customerCareSender.first_name || '';
                message.customerCareSender.last_name =
                    message.customerCareSender.last_name || '';
                message.customerCareSender.avatar =
                    message.customerCareSender.avatar || null;
                message.customerCareSender.contact_phone =
                    message.customerCareSender.contact_phone || [];
            }
            return message;
        });
    }
    async canUserJoinRoom(userId, roomId) {
        try {
            const room = await this.roomRepository.findOne({
                where: { id: roomId },
                relations: ['participants']
            });
            if (!room) {
                return false;
            }
            return room.participants.some(participant => participant.userId === userId);
        }
        catch (error) {
            console.error('Error checking room access:', error);
            return false;
        }
    }
    async updateRoomActivity(roomId) {
        try {
            await this.roomRepository.update({ id: roomId }, { lastActivity: new Date() });
        }
        catch (error) {
            console.error('Error updating room activity:', error);
            throw error;
        }
    }
    async getActiveChats(userId) {
        return this.roomRepository.find({
            where: {
                participants: {
                    userId: userId
                }
            },
            relations: ['participants'],
            order: {
                lastActivity: 'DESC'
            }
        });
    }
    async markMessagesAsRead(roomId, userId) {
        try {
            await this.messageRepository
                .createQueryBuilder()
                .update(message_entity_1.Message)
                .set({
                readBy: () => `array_append("readBy", '${userId}')`
            })
                .where('roomId = :roomId', { roomId })
                .andWhere('NOT (:userId = ANY(readBy))', { userId })
                .execute();
        }
        catch (error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    }
    async getRoomsByUserId(userId) {
        return this.roomRepository
            .createQueryBuilder('room')
            .where(`room.participants @> :participant`, {
            participant: JSON.stringify([{ userId }])
        })
            .orderBy('room.lastActivity', 'DESC')
            .getMany();
    }
    async getLastMessageForRoom(roomId) {
        const message = await this.messageRepository
            .createQueryBuilder('message')
            .select([
            'message.id',
            'message.roomId',
            'message.senderId',
            'message.senderType',
            'message.content',
            'message.messageType',
            'message.timestamp',
            'message.readBy'
        ])
            .leftJoin('message.customerSender', 'customerSender', 'message.senderType = :customerType', {
            customerType: Payload_1.Enum_UserType.CUSTOMER
        })
            .leftJoin('message.driverSender', 'driverSender', 'message.senderType = :driverType', {
            driverType: Payload_1.Enum_UserType.DRIVER
        })
            .leftJoin('message.restaurantSender', 'restaurantSender', 'message.senderType = :restaurantType', {
            restaurantType: Payload_1.Enum_UserType.RESTAURANT_OWNER
        })
            .leftJoin('message.customerCareSender', 'customerCareSender', 'message.senderType = :customerCareType', {
            customerCareType: Payload_1.Enum_UserType.CUSTOMER_CARE_REPRESENTATIVE
        })
            .addSelect([
            'customerSender.id',
            'customerSender.first_name',
            'customerSender.last_name',
            'customerSender.avatar',
            'customerSender.phone'
        ])
            .addSelect([
            'driverSender.id',
            'driverSender.first_name',
            'driverSender.last_name',
            'driverSender.avatar',
            'driverSender.contact_email',
            'driverSender.contact_phone'
        ])
            .addSelect([
            'restaurantSender.id',
            'restaurantSender.restaurant_name',
            'restaurantSender.avatar',
            'restaurantSender.contact_email',
            'restaurantSender.contact_phone'
        ])
            .addSelect([
            'customerCareSender.id',
            'customerCareSender.first_name',
            'customerCareSender.last_name',
            'customerCareSender.avatar',
            'customerCareSender.contact_phone'
        ])
            .where('message.roomId = :roomId', { roomId })
            .orderBy('message.timestamp', 'DESC')
            .limit(1)
            .getOne();
        if (!message) {
            return null;
        }
        if (message.customerSender) {
            message.customerSender.first_name =
                message.customerSender.first_name || '';
            message.customerSender.last_name = message.customerSender.last_name || '';
            message.customerSender.avatar = message.customerSender.avatar || null;
            message.customerSender.phone = message.customerSender.phone || '';
        }
        if (message.driverSender) {
            message.driverSender.first_name = message.driverSender.first_name || '';
            message.driverSender.last_name = message.driverSender.last_name || '';
            message.driverSender.avatar = message.driverSender.avatar || null;
            message.driverSender.contact_email =
                message.driverSender.contact_email || [];
            message.driverSender.contact_phone =
                message.driverSender.contact_phone || [];
        }
        if (message.restaurantSender) {
            message.restaurantSender.restaurant_name =
                message.restaurantSender.restaurant_name || '';
            message.restaurantSender.avatar = message.restaurantSender.avatar || null;
            message.restaurantSender.contact_email =
                message.restaurantSender.contact_email || [];
            message.restaurantSender.contact_phone =
                message.restaurantSender.contact_phone || [];
        }
        if (message.customerCareSender) {
            message.customerCareSender.first_name =
                message.customerCareSender.first_name || '';
            message.customerCareSender.last_name =
                message.customerCareSender.last_name || '';
            message.customerCareSender.avatar =
                message.customerCareSender.avatar || null;
            message.customerCareSender.contact_phone =
                message.customerCareSender.contact_phone || [];
        }
        return message;
    }
    async getRoomsByUserIdWithLastMessage(userId) {
        const rooms = await this.roomRepository
            .createQueryBuilder('room')
            .where(`room.participants @> :participant`, {
            participant: JSON.stringify([{ userId }])
        })
            .orderBy('room.lastActivity', 'DESC')
            .getMany();
        if (rooms.length === 0) {
            return [];
        }
        const lastMessages = await this.messageRepository
            .createQueryBuilder('message')
            .select([
            'message.id',
            'message.roomId',
            'message.senderId',
            'message.senderType',
            'message.content',
            'message.messageType',
            'message.timestamp',
            'message.readBy'
        ])
            .leftJoin('message.customerSender', 'customerSender', 'message.senderType = :customerType', { customerType: Payload_1.Enum_UserType.CUSTOMER })
            .leftJoin('message.driverSender', 'driverSender', 'message.senderType = :driverType', { driverType: Payload_1.Enum_UserType.DRIVER })
            .leftJoin('message.restaurantSender', 'restaurantSender', 'message.senderType = :restaurantType', { restaurantType: Payload_1.Enum_UserType.RESTAURANT_OWNER })
            .leftJoin('message.customerCareSender', 'customerCareSender', 'message.senderType = :customerCareType', { customerCareType: Payload_1.Enum_UserType.CUSTOMER_CARE_REPRESENTATIVE })
            .addSelect([
            'customerSender.id',
            'customerSender.first_name',
            'customerSender.last_name',
            'customerSender.avatar',
            'customerSender.phone'
        ])
            .addSelect([
            'driverSender.id',
            'driverSender.first_name',
            'driverSender.last_name',
            'driverSender.avatar',
            'driverSender.contact_email',
            'driverSender.contact_phone'
        ])
            .addSelect([
            'restaurantSender.id',
            'restaurantSender.restaurant_name',
            'restaurantSender.avatar',
            'restaurantSender.contact_email',
            'restaurantSender.contact_phone'
        ])
            .addSelect([
            'customerCareSender.id',
            'customerCareSender.first_name',
            'customerCareSender.last_name',
            'customerCareSender.avatar',
            'customerCareSender.contact_phone'
        ])
            .where('message.roomId IN (:...roomIds)', {
            roomIds: rooms.map(room => room.id)
        })
            .orderBy('message.timestamp', 'DESC')
            .getMany();
        const messageCounts = await this.messageRepository
            .createQueryBuilder('message')
            .select('message.roomId', 'roomId')
            .addSelect('COUNT(*)', 'count')
            .where('message.senderId = :userId', { userId })
            .andWhere('message.roomId IN (:...roomIds)', {
            roomIds: rooms.map(room => room.id)
        })
            .groupBy('message.roomId')
            .getRawMany();
        const messageCountByRoom = new Map();
        messageCounts.forEach(({ roomId, count }) => {
            messageCountByRoom.set(roomId, parseInt(count, 10));
        });
        const lastMessageByRoom = new Map();
        lastMessages.forEach(message => {
            if (!lastMessageByRoom.has(message.roomId)) {
                if (message.customerSender) {
                    message.customerSender.first_name =
                        message.customerSender.first_name || '';
                    message.customerSender.last_name =
                        message.customerSender.last_name || '';
                    message.customerSender.avatar = message.customerSender.avatar || null;
                    message.customerSender.phone = message.customerSender.phone || '';
                }
                if (message.driverSender) {
                    message.driverSender.first_name =
                        message.driverSender.first_name || '';
                    message.driverSender.last_name = message.driverSender.last_name || '';
                    message.driverSender.avatar = message.driverSender.avatar || null;
                    message.driverSender.contact_email =
                        message.driverSender.contact_email || [];
                    message.driverSender.contact_phone =
                        message.driverSender.contact_phone || [];
                }
                if (message.restaurantSender) {
                    message.restaurantSender.restaurant_name =
                        message.restaurantSender.restaurant_name || '';
                    message.restaurantSender.avatar =
                        message.restaurantSender.avatar || null;
                    message.restaurantSender.contact_email =
                        message.restaurantSender.contact_email || [];
                    message.restaurantSender.contact_phone =
                        message.restaurantSender.contact_phone || [];
                }
                if (message.customerCareSender) {
                    message.customerCareSender.first_name =
                        message.customerCareSender.first_name || '';
                    message.customerCareSender.last_name =
                        message.customerCareSender.last_name || '';
                    message.customerCareSender.avatar =
                        message.customerCareSender.avatar || null;
                    message.customerCareSender.contact_phone =
                        message.customerCareSender.contact_phone || [];
                }
                lastMessageByRoom.set(message.roomId, message);
            }
        });
        const otherParticipants = await Promise.all(rooms.map(async (room) => {
            const otherParticipant = room.participants.find(p => p.userId !== userId);
            if (!otherParticipant)
                return null;
            let participantDetails = null;
            switch (otherParticipant.userType) {
                case Payload_1.Enum_UserType.CUSTOMER:
                    participantDetails = await this.customerRepository
                        .createQueryBuilder('customer')
                        .select([
                        'customer.id',
                        'customer.first_name',
                        'customer.last_name',
                        'customer.avatar',
                        'customer.phone'
                    ])
                        .where('customer.id = :id', { id: otherParticipant.userId })
                        .getOne();
                    break;
                case Payload_1.Enum_UserType.DRIVER:
                    participantDetails = await this.driverRepository
                        .createQueryBuilder('driver')
                        .select([
                        'driver.id',
                        'driver.first_name',
                        'driver.last_name',
                        'driver.avatar',
                        'driver.contact_email',
                        'driver.contact_phone'
                    ])
                        .where('driver.id = :id', { id: otherParticipant.userId })
                        .getOne();
                    break;
                case Payload_1.Enum_UserType.RESTAURANT_OWNER:
                    participantDetails = await this.restaurantRepository
                        .createQueryBuilder('restaurant')
                        .select([
                        'restaurant.id',
                        'restaurant.restaurant_name',
                        'restaurant.avatar',
                        'restaurant.contact_email',
                        'restaurant.contact_phone'
                    ])
                        .where('restaurant.id = :id', { id: otherParticipant.userId })
                        .getOne();
                    break;
                case Payload_1.Enum_UserType.CUSTOMER_CARE_REPRESENTATIVE:
                    participantDetails = await this.customerCareRepository
                        .createQueryBuilder('customerCare')
                        .select([
                        'customerCare.id',
                        'customerCare.first_name',
                        'customerCare.last_name',
                        'customerCare.avatar',
                        'customerCare.contact_phone'
                    ])
                        .where('customerCare.id = :id', { id: otherParticipant.userId })
                        .getOne();
                    break;
            }
            if (participantDetails) {
                if (otherParticipant.userType === Payload_1.Enum_UserType.CUSTOMER) {
                    participantDetails.first_name = participantDetails.first_name || '';
                    participantDetails.last_name = participantDetails.last_name || '';
                    participantDetails.avatar = participantDetails.avatar || null;
                    participantDetails.phone = participantDetails.phone || '';
                }
                else if (otherParticipant.userType === Payload_1.Enum_UserType.DRIVER) {
                    participantDetails.first_name = participantDetails.first_name || '';
                    participantDetails.last_name = participantDetails.last_name || '';
                    participantDetails.avatar = participantDetails.avatar || null;
                    participantDetails.contact_email =
                        participantDetails.contact_email || [];
                    participantDetails.contact_phone =
                        participantDetails.contact_phone || [];
                }
                else if (otherParticipant.userType === Payload_1.Enum_UserType.RESTAURANT_OWNER) {
                    participantDetails.restaurant_name =
                        participantDetails.restaurant_name || '';
                    participantDetails.avatar = participantDetails.avatar || null;
                    participantDetails.contact_email =
                        participantDetails.contact_email || [];
                    participantDetails.contact_phone =
                        participantDetails.contact_phone || [];
                }
                else if (otherParticipant.userType ===
                    Payload_1.Enum_UserType.CUSTOMER_CARE_REPRESENTATIVE) {
                    participantDetails.first_name = participantDetails.first_name || '';
                    participantDetails.last_name = participantDetails.last_name || '';
                    participantDetails.avatar = participantDetails.avatar || null;
                    participantDetails.contact_phone =
                        participantDetails.contact_phone || [];
                }
            }
            return { roomId: room.id, participantDetails };
        }));
        const participantDetailsByRoom = new Map();
        otherParticipants.forEach(participant => {
            if (participant) {
                participantDetailsByRoom.set(participant.roomId, participant.participantDetails);
            }
        });
        return rooms.map(room => ({
            room,
            lastMessage: lastMessageByRoom.get(room.id) || null,
            otherParticipantDetails: participantDetailsByRoom.get(room.id) || null,
            userMessageCount: messageCountByRoom.get(room.id) || 0
        }));
    }
};
exports.FchatService = FchatService;
exports.FchatService = FchatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(chat_room_entity_1.ChatRoom)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(3, (0, typeorm_1.InjectRepository)(driver_entity_1.Driver)),
    __param(4, (0, typeorm_1.InjectRepository)(restaurant_entity_1.Restaurant)),
    __param(5, (0, typeorm_1.InjectRepository)(customer_care_entity_1.CustomerCare)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FchatService);
//# sourceMappingURL=fchat.service.js.map