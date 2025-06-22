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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const createResponse_1 = require("../utils/createResponse");
const uuid_1 = require("uuid");
const admin_repository_1 = require("./admin.repository");
const users_service_1 = require("../users/users.service");
const admin_1 = require("../utils/types/admin");
const typeorm_1 = require("@nestjs/typeorm");
const banned_account_entity_1 = require("../banned-account/entities/banned-account.entity");
const typeorm_2 = require("typeorm");
let AdminService = class AdminService {
    constructor(adminRepository, usersService, bannedAccountRepository) {
        this.adminRepository = adminRepository;
        this.usersService = usersService;
        this.bannedAccountRepository = bannedAccountRepository;
    }
    async create(createAdminDto) {
        try {
            const { user_id, role, permissions } = createAdminDto;
            const allowedPermissions = admin_1.RolePermissions[role];
            const hasInvalidPermissions = permissions.some(permission => !allowedPermissions.includes(permission));
            if (hasInvalidPermissions) {
                return (0, createResponse_1.createResponse)('Forbidden', null, 'Invalid permissions for the given role');
            }
            const userResponse = await this.usersService.findByCondition({
                id: user_id
            });
            if (userResponse.EC === -2) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'User not found');
            }
            const existingAdmin = await this.adminRepository.findByUserId(user_id);
            if (existingAdmin) {
                return (0, createResponse_1.createResponse)('DuplicatedRecord', null, 'Admin already exists for this user');
            }
            const user = { id: user_id };
            const savedAdmin = await this.adminRepository.create({
                ...createAdminDto,
                id: `FF_ADMIN_${(0, uuid_1.v4)()}`,
                user_id: user
            });
            return (0, createResponse_1.createResponse)('OK', savedAdmin, 'Admin created successfully');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error creating admin');
        }
    }
    async findAll() {
        try {
            const admins = await this.adminRepository.findAll();
            return (0, createResponse_1.createResponse)('OK', admins, 'Admins retrieved successfully');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching admins');
        }
    }
    async findOne(id) {
        try {
            const admin = await this.adminRepository.findById(id);
            if (!admin) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Admin not found');
            }
            return (0, createResponse_1.createResponse)('OK', admin, 'Admin retrieved successfully');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching admin');
        }
    }
    async findOneByUserId(userId) {
        try {
            const admin = await this.adminRepository.findByUserId(userId);
            if (!admin) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Admin not found');
            }
            return (0, createResponse_1.createResponse)('OK', admin, 'Admin retrieved successfully');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching admin');
        }
    }
    async updateEntityAvatar(uploadResult, entityId) {
        const admin = await this.adminRepository.update(entityId, {
            avatar: { url: uploadResult.url, key: uploadResult.public_id }
        });
        if (!admin) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'admin not found');
        }
        return (0, createResponse_1.createResponse)('OK', admin, 'admin avatar updated successfully');
    }
    async update(id, updateAdminDto) {
        try {
            const admin = await this.adminRepository.findById(id);
            if (!admin) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Admin not found');
            }
            if (updateAdminDto.role || updateAdminDto.permissions) {
                const role = updateAdminDto.role || admin.role;
                const newPermissions = updateAdminDto.permissions || admin.permissions;
                const allowedPermissions = admin_1.RolePermissions[role];
                const hasInvalidPermissions = newPermissions.some(permission => !allowedPermissions.includes(permission));
                if (hasInvalidPermissions) {
                    return (0, createResponse_1.createResponse)('Forbidden', null, 'Invalid permissions for the given role');
                }
            }
            await this.adminRepository.update(id, updateAdminDto);
            const updatedAdmin = await this.adminRepository.findById(id);
            return (0, createResponse_1.createResponse)('OK', updatedAdmin, 'Admin updated successfully');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error updating admin');
        }
    }
    async remove(id) {
        try {
            const result = await this.adminRepository.delete(id);
            if (result.affected === 0) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Admin not found');
            }
            return (0, createResponse_1.createResponse)('OK', null, 'Admin deleted successfully');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error deleting admin');
        }
    }
    async banAccount(entityType, entityId, adminId, reason) {
        try {
            const admin = await this.adminRepository.findById(adminId);
            if (!admin) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Admin not found');
            }
            if (!admin.permissions.includes(admin_1.AdminPermission.BAN_ACCOUNTS)) {
                return (0, createResponse_1.createResponse)('Forbidden', null, 'Permission denied');
            }
            const validEntityTypes = [
                'Customer',
                'CustomerCare',
                'Driver',
                'Restaurant'
            ];
            if (!validEntityTypes.includes(entityType)) {
                return (0, createResponse_1.createResponse)('InvalidFormatInput', null, 'Invalid entity type');
            }
            const existingBan = await this.bannedAccountRepository.findOne({
                where: { entity_type: entityType, entity_id: entityId }
            });
            if (existingBan) {
                return (0, createResponse_1.createResponse)('DuplicatedRecord', null, 'Account already banned');
            }
            const banRecord = this.bannedAccountRepository.create({
                entity_type: entityType,
                entity_id: entityId,
                banned_by: adminId,
                reason
            });
            const savedBan = await this.bannedAccountRepository.save(banRecord);
            return (0, createResponse_1.createResponse)('OK', savedBan, `${entityType} banned successfully`);
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error banning account');
        }
    }
    async isAccountBanned(entityType, entityId) {
        const banRecord = await this.bannedAccountRepository.findOne({
            where: { entity_type: entityType, entity_id: entityId }
        });
        return !!banRecord;
    }
    async updatePermissions(adminId, updatePermissionsDto, requesterId) {
        try {
            const requester = await this.adminRepository.findById(requesterId);
            if (!requester) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Requester admin not found');
            }
            if (!requester.permissions.includes(admin_1.AdminPermission.MANAGE_ADMINS)) {
                return (0, createResponse_1.createResponse)('Forbidden', null, 'Permission denied');
            }
            const targetAdmin = await this.adminRepository.findById(adminId);
            if (!targetAdmin) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Target admin not found');
            }
            const currentPermissions = targetAdmin.permissions || [];
            const requestedPermissions = updatePermissionsDto.permissions;
            const updatedPermissions = [...currentPermissions];
            for (const permission of requestedPermissions) {
                const index = updatedPermissions.indexOf(permission);
                if (index !== -1) {
                    updatedPermissions.splice(index, 1);
                }
                else {
                    updatedPermissions.push(permission);
                }
            }
            const allowedPermissions = admin_1.RolePermissions[targetAdmin.role];
            const hasInvalidPermissions = updatedPermissions.some(permission => !allowedPermissions.includes(permission));
            if (hasInvalidPermissions) {
                return (0, createResponse_1.createResponse)('Forbidden', null, 'Updated permissions exceed role limitations');
            }
            await this.adminRepository.update(adminId, {
                permissions: updatedPermissions
            });
            const updatedAdmin = await this.adminRepository.findById(adminId);
            return (0, createResponse_1.createResponse)('OK', updatedAdmin, 'Permissions updated successfully');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error updating permissions');
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(banned_account_entity_1.BannedAccount)),
    __metadata("design:paramtypes", [admin_repository_1.AdminRepository,
        users_service_1.UsersService,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map