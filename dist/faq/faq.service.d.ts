import { CreateFAQDto } from './dto/create-faq.dto';
import { UpdateFAQDto } from './dto/update-faq.dto';
import { FAQ, FAQType } from './entities/faq.entity';
import { FAQsRepository } from './faq.repository';
import { ApiResponse } from 'src/utils/createResponse';
export declare class FAQsService {
    private readonly faqsRepository;
    constructor(faqsRepository: FAQsRepository);
    create(createFAQDto: CreateFAQDto): Promise<ApiResponse<FAQ>>;
    findAll(): Promise<ApiResponse<FAQ[]>>;
    findActive(): Promise<ApiResponse<FAQ[]>>;
    findByType(type: FAQType): Promise<ApiResponse<FAQ[]>>;
    findOne(id: string): Promise<ApiResponse<FAQ>>;
    update(id: string, updateFAQDto: UpdateFAQDto): Promise<ApiResponse<FAQ>>;
    remove(id: string): Promise<ApiResponse<null>>;
    findAllPaginated(page?: number, limit?: number): Promise<ApiResponse<{
        totalPages: number;
        currentPage: number;
        totalItems: number;
        items: FAQ[];
    }>>;
}
