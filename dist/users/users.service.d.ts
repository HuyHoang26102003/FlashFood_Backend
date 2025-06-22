import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse } from 'src/utils/createResponse';
import { UserRepository } from './users.repository';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: UserRepository);
    createUser(createUserDto: CreateUserDto): Promise<ApiResponse<User>>;
    findAll(): Promise<ApiResponse<User[]>>;
    findById(id: string): Promise<ApiResponse<User>>;
    findByCondition(condition: {
        [key: string]: any;
    }): Promise<ApiResponse<User>>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<ApiResponse<User>>;
    remove(id: string): Promise<ApiResponse<null>>;
}
