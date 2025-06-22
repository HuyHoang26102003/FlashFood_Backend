import { Injectable } from '@nestjs/common';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto, UpdatePermissionsDto } from './dto/update-admin.dto';
import { createResponse } from 'src/utils/createResponse';
import { ApiResponse } from 'src/utils/createResponse';
import { v4 as uuidv4 } from 'uuid';
import { AdminRepository } from './admin.repository';
import { UsersService } from '../users/users.service';
import { AdminPermission, RolePermissions } from 'src/utils/types/admin';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BannedAccount } from 'src/banned-account/entities/banned-account.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly usersService: UsersService,
    @InjectRepository(BannedAccount)
    private readonly bannedAccountRepository: Repository<BannedAccount>
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<ApiResponse<Admin>> {
    try {
      const { user_id, role, permissions } = createAdminDto;

      // Validate permissions based on role
      const allowedPermissions = RolePermissions[role];
      const hasInvalidPermissions = permissions.some(
        permission => !allowedPermissions.includes(permission)
      );

      if (hasInvalidPermissions) {
        return createResponse(
          'Forbidden',
          null,
          'Invalid permissions for the given role'
        );
      }

      // Check if user exists
      const userResponse = await this.usersService.findByCondition({
        id: user_id as string
      });
      if (userResponse.EC === -2) {
        return createResponse('NotFound', null, 'User not found');
      }

      // Check if admin already exists for this user
      const existingAdmin = await this.adminRepository.findByUserId(user_id);
      if (existingAdmin) {
        return createResponse(
          'DuplicatedRecord',
          null,
          'Admin already exists for this user'
        );
      }

      // Create a partial User object for the relation
      const user = { id: user_id } as User; // Type assertion to satisfy TypeScript

      const savedAdmin = await this.adminRepository.create({
        ...createAdminDto,
        id: `FF_ADMIN_${uuidv4()}`,
        user_id: user // Assign the User object instead of the string
      } as any);

      return createResponse('OK', savedAdmin, 'Admin created successfully');
    } catch (error: any) {
      console.log('error', error);
      return createResponse('ServerError', null, 'Error creating admin');
    }
  }

  async findAll(): Promise<ApiResponse<Admin[]>> {
    try {
      const admins = await this.adminRepository.findAll();
      return createResponse('OK', admins, 'Admins retrieved successfully');
    } catch (error: any) {
      console.log('error', error);
      return createResponse('ServerError', null, 'Error fetching admins');
    }
  }

  async findOne(id: string): Promise<ApiResponse<Admin>> {
    try {
      const admin = await this.adminRepository.findById(id);
      if (!admin) {
        return createResponse('NotFound', null, 'Admin not found');
      }
      return createResponse('OK', admin, 'Admin retrieved successfully');
    } catch (error: any) {
      console.log('error', error);
      return createResponse('ServerError', null, 'Error fetching admin');
    }
  }

  async findOneByUserId(userId: string): Promise<ApiResponse<Admin>> {
    try {
      const admin = await this.adminRepository.findByUserId(userId);
      if (!admin) {
        return createResponse('NotFound', null, 'Admin not found');
      }
      return createResponse('OK', admin, 'Admin retrieved successfully');
    } catch (error: any) {
      console.log('error', error);
      return createResponse('ServerError', null, 'Error fetching admin');
    }
  }

  async updateEntityAvatar(
    uploadResult: { url: string; public_id: string },
    entityId: string
  ) {
    const admin = await this.adminRepository.update(entityId, {
      avatar: { url: uploadResult.url, key: uploadResult.public_id }
    });

    if (!admin) {
      return createResponse('NotFound', null, 'admin not found');
    }

    return createResponse('OK', admin, 'admin avatar updated successfully');
  }

  async update(
    id: string,
    updateAdminDto: UpdateAdminDto
  ): Promise<ApiResponse<Admin>> {
    try {
      const admin = await this.adminRepository.findById(id);
      if (!admin) {
        return createResponse('NotFound', null, 'Admin not found');
      }

      // Validate permissions if role or permissions are being updated
      if (updateAdminDto.role || updateAdminDto.permissions) {
        const role = updateAdminDto.role || admin.role;
        const newPermissions = updateAdminDto.permissions || admin.permissions;

        const allowedPermissions = RolePermissions[role];
        const hasInvalidPermissions = newPermissions.some(
          permission => !allowedPermissions.includes(permission)
        );

        if (hasInvalidPermissions) {
          return createResponse(
            'Forbidden',
            null,
            'Invalid permissions for the given role'
          );
        }
      }

      await this.adminRepository.update(id, updateAdminDto);
      const updatedAdmin = await this.adminRepository.findById(id);
      return createResponse('OK', updatedAdmin, 'Admin updated successfully');
    } catch (error: any) {
      console.log('error', error);
      return createResponse('ServerError', null, 'Error updating admin');
    }
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    try {
      const result = await this.adminRepository.delete(id);
      if (result.affected === 0) {
        return createResponse('NotFound', null, 'Admin not found');
      }
      return createResponse('OK', null, 'Admin deleted successfully');
    } catch (error: any) {
      console.log('error', error);
      return createResponse('ServerError', null, 'Error deleting admin');
    }
  }

  async banAccount(
    entityType: 'Customer' | 'CustomerCare' | 'Driver' | 'Restaurant',
    entityId: string,
    adminId: string,
    reason?: string
  ): Promise<ApiResponse<BannedAccount>> {
    try {
      // Check admin existence and permission
      const admin = await this.adminRepository.findById(adminId);
      if (!admin) {
        return createResponse('NotFound', null, 'Admin not found');
      }
      if (!admin.permissions.includes(AdminPermission.BAN_ACCOUNTS)) {
        return createResponse('Forbidden', null, 'Permission denied');
      }

      // Validate entityType
      const validEntityTypes = [
        'Customer',
        'CustomerCare',
        'Driver',
        'Restaurant'
      ];
      if (!validEntityTypes.includes(entityType)) {
        return createResponse(
          'InvalidFormatInput',
          null,
          'Invalid entity type'
        );
      }

      // Check if already banned
      const existingBan = await this.bannedAccountRepository.findOne({
        where: { entity_type: entityType, entity_id: entityId }
      });
      if (existingBan) {
        return createResponse(
          'DuplicatedRecord',
          null,
          'Account already banned'
        );
      }

      // Create and save ban record
      const banRecord = this.bannedAccountRepository.create({
        entity_type: entityType,
        entity_id: entityId,
        banned_by: adminId,
        reason
      });
      const savedBan = await this.bannedAccountRepository.save(banRecord);

      return createResponse(
        'OK',
        savedBan,
        `${entityType} banned successfully`
      );
    } catch (error: any) {
      console.log('error', error);
      return createResponse('ServerError', null, 'Error banning account');
    }
  }

  // Hàm kiểm tra trạng thái ban (dùng trong các service khác)
  async isAccountBanned(
    entityType: 'Customer' | 'CustomerCare' | 'Driver' | 'Restaurant',
    entityId: string
  ): Promise<boolean> {
    const banRecord = await this.bannedAccountRepository.findOne({
      where: { entity_type: entityType, entity_id: entityId }
    });
    return !!banRecord;
  }

  async updatePermissions(
    adminId: string,
    updatePermissionsDto: UpdatePermissionsDto,
    requesterId: string // ID của admin thực hiện (super admin)
  ): Promise<ApiResponse<Admin>> {
    try {
      // Check requester (super admin) permission
      const requester = await this.adminRepository.findById(requesterId);
      if (!requester) {
        return createResponse('NotFound', null, 'Requester admin not found');
      }
      if (!requester.permissions.includes(AdminPermission.MANAGE_ADMINS)) {
        return createResponse('Forbidden', null, 'Permission denied');
      }

      // Find target admin
      const targetAdmin = await this.adminRepository.findById(adminId);
      if (!targetAdmin) {
        return createResponse('NotFound', null, 'Target admin not found');
      }

      // Get current permissions and requested permissions
      const currentPermissions = targetAdmin.permissions || [];
      const requestedPermissions = updatePermissionsDto.permissions;

      // Toggle logic: Nếu có thì xóa, nếu chưa có thì thêm
      const updatedPermissions = [...currentPermissions];
      for (const permission of requestedPermissions) {
        const index = updatedPermissions.indexOf(permission);
        if (index !== -1) {
          // Nếu đã có, xóa khỏi mảng
          updatedPermissions.splice(index, 1);
        } else {
          // Nếu chưa có, thêm vào mảng
          updatedPermissions.push(permission);
        }
      }

      // Validate updated permissions against role
      const allowedPermissions = RolePermissions[targetAdmin.role];
      const hasInvalidPermissions = updatedPermissions.some(
        permission => !allowedPermissions.includes(permission)
      );
      if (hasInvalidPermissions) {
        return createResponse(
          'Forbidden',
          null,
          'Updated permissions exceed role limitations'
        );
      }

      // Update admin with new permissions
      await this.adminRepository.update(adminId, {
        permissions: updatedPermissions
      });
      const updatedAdmin = await this.adminRepository.findById(adminId);

      return createResponse(
        'OK',
        updatedAdmin,
        'Permissions updated successfully'
      );
    } catch (error: any) {
      console.log('error', error);
      return createResponse('ServerError', null, 'Error updating permissions');
    }
  }
}
