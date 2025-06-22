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
var PenaltiesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PenaltiesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const penalty_entity_1 = require("./entities/penalty.entity");
const penalties_repository_1 = require("./penalties.repository");
const createResponse_1 = require("../utils/createResponse");
const penalty_rules_repository_1 = require("../penalty-rules/penalty-rules.repository");
const admin_repository_1 = require("../admin/admin.repository");
const drivers_repository_1 = require("../drivers/drivers.repository");
let PenaltiesService = PenaltiesService_1 = class PenaltiesService {
    constructor(penaltiesRepository, penaltyRulesRepository, driverRepository, adminRepository, penaltyEntityRepository) {
        this.penaltiesRepository = penaltiesRepository;
        this.penaltyRulesRepository = penaltyRulesRepository;
        this.driverRepository = driverRepository;
        this.adminRepository = adminRepository;
        this.penaltyEntityRepository = penaltyEntityRepository;
        this.logger = new common_1.Logger(PenaltiesService_1.name);
    }
    async create(createPenaltyDto) {
        try {
            if (!createPenaltyDto.driver_id &&
                !createPenaltyDto.customer_care_id &&
                !createPenaltyDto.restaurant_id) {
                return (0, createResponse_1.createResponse)('MissingInput', null, 'At least one of driver_id, customer_care_id, or restaurant_id is required');
            }
            const admin = await this.adminRepository.findById(createPenaltyDto.penaltied_by_id);
            if (!admin) {
                return (0, createResponse_1.createResponse)('NotFound', null, `Admin with ID ${createPenaltyDto.penaltied_by_id} not found`);
            }
            const driver = await this.driverRepository.findById(createPenaltyDto.driver_id);
            if (!driver) {
                return (0, createResponse_1.createResponse)('NotFound', null, `Driver with ID ${createPenaltyDto.driver_id} not found`);
            }
            const rule = await this.penaltyRulesRepository.findById(createPenaltyDto.rule_id);
            if (!rule) {
                return (0, createResponse_1.createResponse)('NotFound', null, `Penalty rule with ID ${createPenaltyDto.rule_id} not found`);
            }
            const newPenalty = await this.penaltiesRepository.create(createPenaltyDto);
            return (0, createResponse_1.createResponse)('OK', newPenalty, 'Penalty created successfully');
        }
        catch (error) {
            return this.handleError('Error creating penalty:', error);
        }
    }
    async findAll() {
        try {
            const penalties = await this.penaltyEntityRepository.find({
                relations: ['penaltied_by', 'rule']
            });
            return (0, createResponse_1.createResponse)('OK', penalties, 'Fetched all penalties');
        }
        catch (error) {
            return this.handleError('Error fetching penalties:', error);
        }
    }
    async findOne(id) {
        try {
            const penalty = await this.penaltiesRepository.findById(id);
            return this.handlePenaltyResponse(penalty);
        }
        catch (error) {
            return this.handleError('Error fetching penalty:', error);
        }
    }
    async findByDriverId({ driverId, limit, offset }) {
        try {
            const penalties = await this.penaltiesRepository.findByDriverId(driverId, limit, offset);
            return (0, createResponse_1.createResponse)('OK', penalties, 'Fetched penalties by driver');
        }
        catch (error) {
            return this.handleError('Error fetching penalties by driver:', error);
        }
    }
    async findByCustomerCareId({ customerCareId, limit, offset }) {
        try {
            const penalties = await this.penaltiesRepository.findByCustomerCareId(customerCareId, limit, offset);
            return (0, createResponse_1.createResponse)('OK', penalties, 'Fetched penalties by customer care');
        }
        catch (error) {
            return this.handleError('Error fetching penalties by customer care:', error);
        }
    }
    async findByRestaurantId({ restaurantId, limit, offset }) {
        try {
            const penalties = await this.penaltiesRepository.findByRestaurantId(restaurantId, limit, offset);
            return (0, createResponse_1.createResponse)('OK', penalties, 'Fetched penalties by restaurant');
        }
        catch (error) {
            return this.handleError('Error fetching penalties by restaurant:', error);
        }
    }
    async findByAdminId({ adminId, limit, offset }) {
        try {
            const penalties = await this.penaltiesRepository.findByAdminId(adminId, limit, offset);
            return (0, createResponse_1.createResponse)('OK', penalties, 'Fetched penalties by admin');
        }
        catch (error) {
            return this.handleError('Error fetching penalties by admin:', error);
        }
    }
    async update(id, updatePenaltyDto) {
        try {
            const penalty = await this.penaltiesRepository.findById(id);
            if (!penalty) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Penalty not found');
            }
            const updatedPenalty = await this.penaltiesRepository.update(id, updatePenaltyDto);
            return (0, createResponse_1.createResponse)('OK', updatedPenalty, 'Penalty updated successfully');
        }
        catch (error) {
            return this.handleError('Error updating penalty:', error);
        }
    }
    async updateStatus(id, status) {
        try {
            const penalty = await this.penaltiesRepository.findById(id);
            if (!penalty) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Penalty not found');
            }
            const updateData = { status };
            const updatedPenalty = await this.penaltiesRepository.update(id, updateData);
            return (0, createResponse_1.createResponse)('OK', updatedPenalty, 'Penalty status updated successfully');
        }
        catch (error) {
            return this.handleError('Error updating penalty status:', error);
        }
    }
    async remove(id) {
        try {
            const deletedPenalty = await this.penaltiesRepository.remove(id);
            if (!deletedPenalty) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Penalty not found');
            }
            return (0, createResponse_1.createResponse)('OK', null, 'Penalty deleted successfully');
        }
        catch (error) {
            return this.handleError('Error deleting penalty:', error);
        }
    }
    async findAllPaginated(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [items, total] = await this.penaltiesRepository.findAllPaginated(skip, limit);
            const totalPages = Math.ceil(total / limit);
            return (0, createResponse_1.createResponse)('OK', {
                totalPages,
                currentPage: page,
                totalItems: total,
                items
            });
        }
        catch (error) {
            this.logger.error(`Error fetching paginated penalties: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return (0, createResponse_1.createResponse)('ServerError', null);
        }
    }
    handlePenaltyResponse(penalty) {
        if (!penalty) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'Penalty not found');
        }
        return (0, createResponse_1.createResponse)('OK', penalty, 'Penalty retrieved successfully');
    }
    handleError(message, error) {
        console.error(message, error);
        return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while processing your request');
    }
};
exports.PenaltiesService = PenaltiesService;
exports.PenaltiesService = PenaltiesService = PenaltiesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, typeorm_1.InjectRepository)(penalty_entity_1.Penalty)),
    __metadata("design:paramtypes", [penalties_repository_1.PenaltiesRepository,
        penalty_rules_repository_1.PenaltyRulesRepository,
        drivers_repository_1.DriversRepository,
        admin_repository_1.AdminRepository,
        typeorm_2.Repository])
], PenaltiesService);
//# sourceMappingURL=penalties.service.js.map