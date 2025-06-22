import { CreateCustomerCareDto } from './dto/create-customer_cares.dto';
import { ApiResponse } from 'src/utils/createResponse';
import { CustomerCaresRepository } from './customer_cares.repository';
import { CustomerCareInquiriesRepository } from 'src/customer_cares_inquires/customer_cares_inquires.repository';
import { RedisService } from 'src/redis/redis.service';
import { DataSource } from 'typeorm';
import { CustomerCareInquiry } from 'src/customer_cares_inquires/entities/customer_care_inquiry.entity';
import { CustomerCare } from './entities/customer_care.entity';
export declare class CustomerCareService {
    private readonly repository;
    private readonly inquiryRepository;
    private readonly redisService;
    private readonly dataSource;
    constructor(repository: CustomerCaresRepository, inquiryRepository: CustomerCareInquiriesRepository, redisService: RedisService, dataSource: DataSource);
    create(createCustomerCareDto: CreateCustomerCareDto): Promise<any>;
    findAll(): Promise<ApiResponse<any>>;
    findAllInquiriesByCCId(id: string, forceRefresh?: boolean): Promise<ApiResponse<any>>;
    findCustomerCareById(id: string): Promise<ApiResponse<any>>;
    findOne(conditions: object): Promise<any>;
    update(inquiryId: string, updateData: Partial<CustomerCareInquiry>): Promise<ApiResponse<any>>;
    setAvailability(id: string): Promise<any>;
    remove(id: string): Promise<any>;
    updateEntityAvatar(uploadResult: {
        url: string;
        public_id: string;
    }, entityId: string): Promise<ApiResponse<any>>;
    resetInquiriesCache(): Promise<ApiResponse<any>>;
    findAllPaginated(page?: number, limit?: number): Promise<ApiResponse<{
        totalPages: number;
        currentPage: number;
        totalItems: number;
        items: CustomerCare[];
    }>>;
}
