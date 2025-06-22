import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto, UpdatePermissionsDto } from './dto/update-admin.dto';
import { ApiResponse } from 'src/utils/createResponse';
import { AdminRepository } from './admin.repository';
import { UsersService } from '../users/users.service';
import { BannedAccount } from 'src/banned-account/entities/banned-account.entity';
import { Repository } from 'typeorm';
export declare class AdminService {
    private readonly adminRepository;
    private readonly usersService;
    private readonly bannedAccountRepository;
    constructor(adminRepository: AdminRepository, usersService: UsersService, bannedAccountRepository: Repository<BannedAccount>);
    create(createAdminDto: CreateAdminDto): Promise<ApiResponse<Admin>>;
    findAll(): Promise<ApiResponse<Admin[]>>;
    findOne(id: string): Promise<ApiResponse<Admin>>;
    findOneByUserId(userId: string): Promise<ApiResponse<Admin>>;
    updateEntityAvatar(uploadResult: {
        url: string;
        public_id: string;
    }, entityId: string): Promise<ApiResponse<any>>;
    update(id: string, updateAdminDto: UpdateAdminDto): Promise<ApiResponse<Admin>>;
    remove(id: string): Promise<ApiResponse<null>>;
    banAccount(entityType: 'Customer' | 'CustomerCare' | 'Driver' | 'Restaurant', entityId: string, adminId: string, reason?: string): Promise<ApiResponse<BannedAccount>>;
    isAccountBanned(entityType: 'Customer' | 'CustomerCare' | 'Driver' | 'Restaurant', entityId: string): Promise<boolean>;
    updatePermissions(adminId: string, updatePermissionsDto: UpdatePermissionsDto, requesterId: string): Promise<ApiResponse<Admin>>;
}
