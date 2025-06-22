import { FAQsService } from './faq.service';
import { CreateFAQDto } from './dto/create-faq.dto';
import { UpdateFAQDto } from './dto/update-faq.dto';
import { FAQType } from './entities/faq.entity';
export declare class FAQsController {
    private readonly faqsService;
    constructor(faqsService: FAQsService);
    create(createFAQDto: CreateFAQDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/faq.entity").FAQ>>;
    findAll(): Promise<import("../utils/createResponse").ApiResponse<import("./entities/faq.entity").FAQ[]>>;
    findAllPaginated(page?: string, limit?: string): Promise<import("../utils/createResponse").ApiResponse<{
        totalPages: number;
        currentPage: number;
        totalItems: number;
        items: import("./entities/faq.entity").FAQ[];
    }>>;
    findActive(): Promise<import("../utils/createResponse").ApiResponse<import("./entities/faq.entity").FAQ[]>>;
    findByType(type: FAQType): Promise<import("../utils/createResponse").ApiResponse<import("./entities/faq.entity").FAQ[]>>;
    findOne(id: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/faq.entity").FAQ>>;
    update(id: string, updateFAQDto: UpdateFAQDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/faq.entity").FAQ>>;
    remove(id: string): Promise<import("../utils/createResponse").ApiResponse<null>>;
}
