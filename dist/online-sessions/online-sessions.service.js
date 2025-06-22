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
exports.OnlineSessionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const online_session_entity_1 = require("./entities/online-session.entity");
const online_session_repository_1 = require("./online-session.repository");
const createResponse_1 = require("../utils/createResponse");
let OnlineSessionsService = class OnlineSessionsService {
    constructor(onlineSessionsRepository, onlineSessionEntityRepository) {
        this.onlineSessionsRepository = onlineSessionsRepository;
        this.onlineSessionEntityRepository = onlineSessionEntityRepository;
    }
    async create(createOnlineSessionDto) {
        try {
            if (!createOnlineSessionDto.driver_id &&
                !createOnlineSessionDto.customer_care_id) {
                return (0, createResponse_1.createResponse)('MissingInput', null, 'Driver ID or Customer Care ID is required');
            }
            const newSession = await this.onlineSessionsRepository.create(createOnlineSessionDto);
            return (0, createResponse_1.createResponse)('OK', newSession, 'Online session created successfully');
        }
        catch (error) {
            return this.handleError('Error creating online session:', error);
        }
    }
    async findAll() {
        try {
            const sessions = await this.onlineSessionEntityRepository.find();
            return (0, createResponse_1.createResponse)('OK', sessions, 'Fetched all online sessions');
        }
        catch (error) {
            return this.handleError('Error fetching online sessions:', error);
        }
    }
    async findOne(id) {
        try {
            const session = await this.onlineSessionsRepository.findById(id);
            return this.handleSessionResponse(session);
        }
        catch (error) {
            return this.handleError('Error fetching online session:', error);
        }
    }
    async findByDriverId({ driverId, limit, offset }) {
        try {
            const sessions = await this.onlineSessionsRepository.findByDriverId(driverId, limit, offset);
            return (0, createResponse_1.createResponse)('OK', sessions, 'Fetched online sessions by driver');
        }
        catch (error) {
            return this.handleError('Error fetching sessions by driver:', error);
        }
    }
    async findByCustomerCareId({ customerCareId, limit, offset }) {
        try {
            const sessions = await this.onlineSessionsRepository.findByCustomerCareId(customerCareId, limit, offset);
            return (0, createResponse_1.createResponse)('OK', sessions, 'Fetched online sessions by customer care');
        }
        catch (error) {
            return this.handleError('Error fetching sessions by customer care:', error);
        }
    }
    async update(id, updateOnlineSessionDto) {
        try {
            const session = await this.onlineSessionsRepository.findById(id);
            if (!session) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Online session not found');
            }
            const updatedSession = await this.onlineSessionsRepository.update(id, updateOnlineSessionDto);
            return (0, createResponse_1.createResponse)('OK', updatedSession, 'Online session updated successfully');
        }
        catch (error) {
            return this.handleError('Error updating online session:', error);
        }
    }
    async findOneByDriverIdAndActive(driverId) {
        const session = await this.onlineSessionEntityRepository.findOne({
            where: { driver_id: driverId, is_active: true },
            order: { start_time: 'DESC' }
        });
        return session || null;
    }
    async endSession(id) {
        try {
            const session = await this.onlineSessionsRepository.findById(id);
            if (!session) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Online session not found');
            }
            const updateData = {
                end_time: Math.floor(Date.now() / 1000),
                is_active: false
            };
            const updatedSession = await this.onlineSessionsRepository.update(id, updateData);
            return (0, createResponse_1.createResponse)('OK', updatedSession, 'Online session ended successfully');
        }
        catch (error) {
            return this.handleError('Error ending online session:', error);
        }
    }
    async remove(id) {
        try {
            const deletedSession = await this.onlineSessionsRepository.remove(id);
            if (!deletedSession) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Online session not found');
            }
            return (0, createResponse_1.createResponse)('OK', null, 'Online session deleted successfully');
        }
        catch (error) {
            return this.handleError('Error deleting online session:', error);
        }
    }
    handleSessionResponse(session) {
        if (!session) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'Online session not found');
        }
        return (0, createResponse_1.createResponse)('OK', session, 'Online session retrieved successfully');
    }
    handleError(message, error) {
        console.error(message, error);
        return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while processing your request');
    }
};
exports.OnlineSessionsService = OnlineSessionsService;
exports.OnlineSessionsService = OnlineSessionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(online_session_entity_1.OnlineSession)),
    __metadata("design:paramtypes", [online_session_repository_1.OnlineSessionsRepository,
        typeorm_2.Repository])
], OnlineSessionsService);
//# sourceMappingURL=online-sessions.service.js.map