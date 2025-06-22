import { Repository } from 'typeorm';
import { CustomerCare } from './entities/customer_care.entity';
import { CreateCustomerCareDto } from './dto/create-customer_cares.dto';
export declare class CustomerCaresRepository {
    private repository;
    constructor(repository: Repository<CustomerCare>);
    create(createDto: CreateCustomerCareDto): Promise<CustomerCare>;
    findAll(): Promise<CustomerCare[]>;
    findById(id: string): Promise<CustomerCare>;
    findOne(condition: any): Promise<CustomerCare>;
    findByUserId(userId: string): Promise<CustomerCare>;
    update(id: string, updateDto: any): Promise<CustomerCare>;
    remove(id: string): Promise<boolean>;
    findAllPaginated(skip: number, limit: number): Promise<[CustomerCare[], number]>;
}
