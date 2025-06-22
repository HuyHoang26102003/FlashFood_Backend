import { Repository } from 'typeorm';
import { CustomerCareInquiry } from './entities/customer_care_inquiry.entity';
import { CreateCustomerCareInquiryDto } from './dto/create-customer-care-inquiry.dto';
import { UpdateCustomerCareInquiryDto } from './dto/update-customer-care-inquiry.dto';
import { Order } from 'src/orders/entities/order.entity';
import { CustomerCare } from 'src/customer_cares/entities/customer_care.entity';
export declare class CustomerCareInquiriesRepository {
    private repository;
    private orderRepository;
    private customerCareRepository;
    private readonly logger;
    constructor(repository: Repository<CustomerCareInquiry>, orderRepository: Repository<Order>, customerCareRepository: Repository<CustomerCare>);
    create(createDto: CreateCustomerCareInquiryDto): Promise<CustomerCareInquiry>;
    update(id: string, updateDto: UpdateCustomerCareInquiryDto): Promise<CustomerCareInquiry>;
    findById(id: string): Promise<CustomerCareInquiry>;
    findAll(): Promise<CustomerCareInquiry[]>;
    findAllInquiriesByCCId(customerCareId: string): Promise<CustomerCareInquiry[]>;
    findAllInquiriesByCustomerId(customerId: string): Promise<CustomerCareInquiry[]>;
    remove(id: string): Promise<boolean>;
    escalateInquiry(id: string, customerCareId: string, reason: string, escalatedTo: 'ADMIN' | 'CUSTOMER_CARE', escalatedToId: string): Promise<CustomerCareInquiry>;
    rejectInquiry(id: string, customerCareId: string, reason: string): Promise<CustomerCareInquiry>;
    transferInquiry(id: string, fromCustomerCareId: string, toCustomerCareId: string, reason: string): Promise<CustomerCareInquiry>;
    recordResponse(id: string): Promise<CustomerCareInquiry>;
    resolveInquiry(id: string, resolutionType: 'REFUND' | 'REPLACEMENT' | 'INVESTIGATING' | 'ACCOUNT_FIX' | 'TECHNICAL_SUPPORT' | 'OTHER', resolutionNotes?: string): Promise<CustomerCareInquiry>;
    findAllEscalatedInquiries(): Promise<CustomerCareInquiry[]>;
    findAllPaginated(skip: number, limit: number): Promise<[CustomerCareInquiry[], number]>;
}
