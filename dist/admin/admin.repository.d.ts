import { Repository, DeleteResult } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { User } from 'src/users/entities/user.entity';
export declare class AdminRepository {
    private adminRepository;
    private userRepository;
    private readonly logger;
    constructor(adminRepository: Repository<Admin>, userRepository: Repository<User>);
    create(createAdminDto: Partial<Admin>): Promise<Admin>;
    findAll(): Promise<Admin[]>;
    findById(id: string): Promise<Admin | null>;
    findByUserId(userId: string): Promise<Admin | null>;
    update(id: string, updateAdminDto: UpdateAdminDto): Promise<Admin | null>;
    delete(id: string): Promise<DeleteResult>;
    remove(id: string): Promise<Admin | null>;
    findAllPaginated(skip: number, limit: number): Promise<[Admin[], number]>;
}
