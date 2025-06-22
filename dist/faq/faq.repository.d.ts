import { Repository } from 'typeorm';
import { FAQ, FAQType } from './entities/faq.entity';
import { UpdateFAQDto } from './dto/update-faq.dto';
export declare class FAQsRepository {
    faqRepository: Repository<FAQ>;
    constructor(faqRepository: Repository<FAQ>);
    create(faqData: Partial<FAQ>): Promise<FAQ>;
    findAll(): Promise<FAQ[]>;
    findActive(): Promise<FAQ[]>;
    findByType(type: FAQType): Promise<FAQ[]>;
    findById(id: string): Promise<FAQ | null>;
    update(id: string, updateData: UpdateFAQDto): Promise<void>;
    delete(id: string): Promise<{
        affected?: number;
    }>;
    findAllPaginated(skip: number, limit: number): Promise<[FAQ[], number]>;
}
