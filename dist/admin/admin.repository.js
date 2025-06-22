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
var AdminRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const admin_entity_1 = require("./entities/admin.entity");
const user_entity_1 = require("../users/entities/user.entity");
let AdminRepository = AdminRepository_1 = class AdminRepository {
    constructor(adminRepository, userRepository) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(AdminRepository_1.name);
    }
    async create(createAdminDto) {
        try {
            const admin = this.adminRepository.create(createAdminDto);
            return await this.adminRepository.save(admin);
        }
        catch (error) {
            this.logger.error(`Error creating admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async findAll() {
        try {
            return await this.adminRepository.find({
                relations: ['user', 'created_by'],
                order: { created_at: 'DESC' }
            });
        }
        catch (error) {
            this.logger.error(`Error finding all admins: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async findById(id) {
        try {
            return await this.adminRepository.findOne({
                where: { id },
                relations: ['user', 'created_by']
            });
        }
        catch (error) {
            this.logger.error(`Error finding admin by id: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async findByUserId(userId) {
        try {
            return await this.adminRepository.findOne({
                where: { user_id: userId },
                relations: ['user', 'created_by']
            });
        }
        catch (error) {
            this.logger.error(`Error finding admin by user id: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async update(id, updateAdminDto) {
        try {
            const { created_at, ...updateData } = updateAdminDto;
            const finalUpdateData = {
                ...updateData,
                updated_at: Math.floor(Date.now() / 1000),
                ...(created_at && {
                    created_at: created_at instanceof Date
                        ? Math.floor(created_at.getTime() / 1000)
                        : created_at
                })
            };
            await this.adminRepository.update(id, finalUpdateData);
            return await this.findById(id);
        }
        catch (error) {
            this.logger.error(`Error updating admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async delete(id) {
        try {
            return await this.adminRepository.delete(id);
        }
        catch (error) {
            this.logger.error(`Error deleting admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async remove(id) {
        try {
            const admin = await this.findById(id);
            if (admin) {
                await this.adminRepository.delete(id);
            }
            return admin;
        }
        catch (error) {
            this.logger.error(`Error removing admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async findAllPaginated(skip, limit) {
        try {
            return await this.adminRepository.findAndCount({
                skip,
                take: limit,
                relations: ['user', 'created_by'],
                order: { created_at: 'DESC' }
            });
        }
        catch (error) {
            this.logger.error(`Error finding paginated admins: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
};
exports.AdminRepository = AdminRepository;
exports.AdminRepository = AdminRepository = AdminRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admin_entity_1.Admin)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AdminRepository);
//# sourceMappingURL=admin.repository.js.map