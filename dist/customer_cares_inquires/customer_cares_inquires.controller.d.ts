import { CustomerCareInquiriesService } from './customer_cares_inquires.service';
import { CreateCustomerCareInquiryDto } from './dto/create-customer-care-inquiry.dto';
import { UpdateCustomerCareInquiryDto } from './dto/update-customer-care-inquiry.dto';
export declare class CustomerCareInquiriesController {
    private readonly service;
    constructor(service: CustomerCareInquiriesService);
    create(createDto: CreateCustomerCareInquiryDto): Promise<import("../utils/createResponse").ApiResponse<any>>;
    findAll(): Promise<import("../utils/createResponse").ApiResponse<any>>;
    findAllPaginated(page?: string, limit?: string): Promise<import("../utils/createResponse").ApiResponse<{
        totalPages: number;
        currentPage: number;
        totalItems: number;
        items: import("./entities/customer_care_inquiry.entity").CustomerCareInquiry[];
    }>>;
    findAllInquiriesByCCId(ccId: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
    findAllInquiriesByCustomerId(customerId: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
    findAllEscalatedInquiries(): Promise<import("../utils/createResponse").ApiResponse<any>>;
    findOne(id: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
    update(id: string, updateDto: UpdateCustomerCareInquiryDto): Promise<import("../utils/createResponse").ApiResponse<any>>;
    remove(id: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
    escalateInquiry(id: string, data: {
        customerCareId: string;
        reason: string;
        escalatedTo: 'ADMIN' | 'CUSTOMER_CARE';
        escalatedToId: string;
    }): Promise<import("../utils/createResponse").ApiResponse<any>>;
    rejectInquiry(id: string, data: {
        customerCareId: string;
        reason: string;
    }): Promise<import("../utils/createResponse").ApiResponse<any>>;
    transferInquiry(id: string, data: {
        fromCustomerCareId: string;
        toCustomerCareId: string;
        reason: string;
    }): Promise<import("../utils/createResponse").ApiResponse<any>>;
    recordResponse(id: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
    resolveInquiry(id: string, data: {
        resolutionType: 'REFUND' | 'REPLACEMENT' | 'INVESTIGATING' | 'ACCOUNT_FIX' | 'TECHNICAL_SUPPORT' | 'OTHER';
        resolutionNotes?: string;
    }): Promise<import("../utils/createResponse").ApiResponse<any>>;
}
