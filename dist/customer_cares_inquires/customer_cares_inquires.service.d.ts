import { CustomerCareInquiriesRepository } from './customer_cares_inquires.repository';
import { CreateCustomerCareInquiryDto } from './dto/create-customer-care-inquiry.dto';
import { UpdateCustomerCareInquiryDto } from './dto/update-customer-care-inquiry.dto';
import { ApiResponse } from 'src/utils/createResponse';
import { RedisService } from 'src/redis/redis.service';
import { CustomerCareInquiry } from './entities/customer_care_inquiry.entity';
export declare class CustomerCareInquiriesService {
    private readonly repository;
    private readonly redisService;
    constructor(repository: CustomerCareInquiriesRepository, redisService: RedisService);
    create(createDto: CreateCustomerCareInquiryDto): Promise<ApiResponse<any>>;
    findAll(): Promise<ApiResponse<any>>;
    findById(id: string): Promise<ApiResponse<any>>;
    findAllInquiriesByCCId(id: string): Promise<ApiResponse<any>>;
    findAllInquiriesByCustomerId(customerId: string): Promise<ApiResponse<any>>;
    update(id: string, updateDto: UpdateCustomerCareInquiryDto): Promise<ApiResponse<any>>;
    remove(id: string): Promise<ApiResponse<any>>;
    escalateInquiry(id: string, customerCareId: string, reason: string, escalatedTo: 'ADMIN' | 'CUSTOMER_CARE', escalatedToId: string): Promise<ApiResponse<any>>;
    rejectInquiry(id: string, customerCareId: string, reason: string): Promise<ApiResponse<any>>;
    transferInquiry(id: string, fromCustomerCareId: string, toCustomerCareId: string, reason: string): Promise<ApiResponse<any>>;
    recordResponse(id: string): Promise<ApiResponse<any>>;
    resolveInquiry(id: string, resolutionType: 'REFUND' | 'REPLACEMENT' | 'INVESTIGATING' | 'ACCOUNT_FIX' | 'TECHNICAL_SUPPORT' | 'OTHER', resolutionNotes?: string): Promise<ApiResponse<any>>;
    findAllEscalatedInquiries(): Promise<ApiResponse<any>>;
    findAllPaginated(page?: number, limit?: number): Promise<ApiResponse<{
        totalPages: number;
        currentPage: number;
        totalItems: number;
        items: CustomerCareInquiry[];
    }>>;
}
