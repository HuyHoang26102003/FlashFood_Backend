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
exports.OnlineSessionsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const online_session_entity_1 = require("./entities/online-session.entity");
let OnlineSessionsRepository = class OnlineSessionsRepository {
    constructor(onlineSessionEntityRepository) {
        this.onlineSessionEntityRepository = onlineSessionEntityRepository;
    }
    async findById(id) {
        return await this.onlineSessionEntityRepository.findOne({ where: { id } });
    }
    async findByDriverId(driverId, limit, offset) {
        return await this.onlineSessionEntityRepository.find({
            where: { driver_id: driverId },
            take: limit,
            skip: offset,
            order: { start_time: 'DESC' }
        });
    }
    async findByCustomerCareId(customerCareId, limit, offset) {
        return await this.onlineSessionEntityRepository.find({
            where: { customer_care_id: customerCareId },
            take: limit,
            skip: offset,
            order: { start_time: 'DESC' }
        });
    }
    async create(createOnlineSessionDto) {
        const session = this.onlineSessionEntityRepository.create(createOnlineSessionDto);
        return await this.onlineSessionEntityRepository.save(session);
    }
    async update(id, updateOnlineSessionDto) {
        await this.onlineSessionEntityRepository.update(id, updateOnlineSessionDto);
        return await this.findById(id);
    }
    async remove(id) {
        const session = await this.findById(id);
        if (session) {
            await this.onlineSessionEntityRepository.delete(id);
        }
        return session;
    }
};
exports.OnlineSessionsRepository = OnlineSessionsRepository;
exports.OnlineSessionsRepository = OnlineSessionsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(online_session_entity_1.OnlineSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OnlineSessionsRepository);
//# sourceMappingURL=online-session.repository.js.map