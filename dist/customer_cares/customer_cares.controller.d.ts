import { CustomerCareService } from './customer_cares.service';
import { CreateCustomerCareDto } from './dto/create-customer_cares.dto';
import { UpdateCustomerCareDto } from './dto/update-customer_cares.dto';
export declare class CustomerCaresController {
    private readonly customerCareService;
    constructor(customerCareService: CustomerCareService);
    resetInquiriesCache(): Promise<import("../utils/createResponse").ApiResponse<any>>;
    create(createCustomerCareDto: CreateCustomerCareDto): Promise<any>;
    findAll(): Promise<import("../utils/createResponse").ApiResponse<any>>;
    findAllPaginated(page?: string, limit?: string): Promise<import("../utils/createResponse").ApiResponse<{
        totalPages: number;
        currentPage: number;
        totalItems: number;
        items: import("./entities/customer_care.entity").CustomerCare[];
    }>>;
    findAllInquiriesByCCId(ccId: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
    findCustomerCareById(id: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
    findOne(field: string, value: string): Promise<any>;
    update(id: string, updateCustomerCareDto: UpdateCustomerCareDto): Promise<import("../utils/createResponse").ApiResponse<any>>;
    setAvailability(id: string): Promise<any>;
    remove(id: string): Promise<any>;
}
