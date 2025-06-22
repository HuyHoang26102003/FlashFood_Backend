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
exports.DriverProgressStagesRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const driver_progress_stage_entity_1 = require("./entities/driver_progress_stage.entity");
let DriverProgressStagesRepository = class DriverProgressStagesRepository {
    constructor(repository, dataSource) {
        this.repository = repository;
        this.dataSource = dataSource;
    }
    async create(createDto) {
        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            const existingActive = await transactionalEntityManager
                .createQueryBuilder(driver_progress_stage_entity_1.DriverProgressStage, 'dps')
                .where('dps.driver_id = :driverId', { driverId: createDto.driver_id })
                .andWhere('dps.current_state != :completeState', {
                completeState: 'delivery_complete'
            })
                .orderBy('dps.created_at', 'DESC')
                .setLock('pessimistic_write')
                .getOne();
            if (existingActive) {
                console.log('Found existing active stage:', existingActive.id);
                return existingActive;
            }
            const stage = this.repository.create(createDto);
            try {
                const savedStage = await transactionalEntityManager.save(driver_progress_stage_entity_1.DriverProgressStage, stage);
                console.log('Created new stage:', savedStage.id);
                return savedStage;
            }
            catch (error) {
                console.error('Error creating stage:', error);
                const lastMinuteCheck = await this.findByDriverId(createDto.driver_id);
                if (lastMinuteCheck) {
                    console.log('Found stage after save error:', lastMinuteCheck.id);
                    return lastMinuteCheck;
                }
                throw error;
            }
        });
    }
    async findAll() {
        return await this.repository.find();
    }
    async findById(id) {
        return await this.repository.findOne({ where: { id } });
    }
    async findByDriverId(driverId) {
        return await this.repository
            .createQueryBuilder('dps')
            .where('dps.driver_id = :driverId', { driverId })
            .andWhere('dps.current_state != :completeState', {
            completeState: 'delivery_complete'
        })
            .orderBy('dps.created_at', 'DESC')
            .getOne();
    }
    async update(id, updateDto) {
        await this.repository.update(id, {
            ...updateDto,
            updated_at: Math.floor(Date.now() / 1000)
        });
        return await this.findById(id);
    }
    async remove(id) {
        const result = await this.repository.delete(id);
        return result.affected > 0;
    }
    async updateStages(id, stages) {
        await this.repository.update(id, {
            stages,
            updated_at: Math.floor(Date.now() / 1000)
        });
        return await this.findById(id);
    }
    async getAllByDriverId(driverId, offset = 0, limit = 5) {
        return await this.repository
            .createQueryBuilder('dps')
            .where('dps.driver_id = :driverId', { driverId })
            .leftJoinAndSelect('dps.orders', 'orders')
            .orderBy('dps.created_at', 'DESC')
            .skip(offset)
            .take(limit)
            .getMany();
    }
};
exports.DriverProgressStagesRepository = DriverProgressStagesRepository;
exports.DriverProgressStagesRepository = DriverProgressStagesRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(driver_progress_stage_entity_1.DriverProgressStage)),
    __param(1, (0, typeorm_2.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.DataSource])
], DriverProgressStagesRepository);
//# sourceMappingURL=driver_progress_stages.repository.js.map