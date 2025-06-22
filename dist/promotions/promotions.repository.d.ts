import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
export declare class PromotionsRepository {
    promotionRepository: Repository<Promotion>;
    constructor(promotionRepository: Repository<Promotion>);
    create(promotionData: Partial<Promotion>): Promise<Promotion>;
    findAll(options?: {
        relations?: string[];
    }): Promise<Promotion[]>;
    findById(id: string): Promise<Promotion | null>;
    findByIdWithRestaurants(id: string): Promise<Promotion | null>;
    findByName(name: string): Promise<Promotion | null>;
    update(id: string, updatePromotionDto: UpdatePromotionDto): Promise<Promotion | null>;
    delete(id: string): Promise<{
        affected?: number;
    }>;
    findByIds(ids: string[]): Promise<Promotion[]>;
    findAllPaginated(skip: number, limit: number): Promise<[Promotion[], number]>;
}
