import { EntityManager, Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserRepository {
    private readonly repository;
    constructor(repository: Repository<User>);
    findByEmail(email: string): Promise<User | null>;
    create(userData: Partial<User>): Promise<User>;
    findAll(): Promise<User[]>;
    findById(id: string, manager?: EntityManager): Promise<User>;
    update(id: string, updateDto: UpdateUserDto, manager?: EntityManager): Promise<UpdateResult>;
    delete(id: string): Promise<{
        affected?: number;
    }>;
    findOne(conditions: any): Promise<User | null>;
}
