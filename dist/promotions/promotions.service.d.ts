import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { Promotion } from './entities/promotion.entity';
import { ApiResponse } from 'src/utils/createResponse';
import { PromotionsRepository } from './promotions.repository';
import { FoodCategoriesRepository } from 'src/food_categories/food_categories.repository';
import { RedisService } from 'src/redis/redis.service';
export declare class PromotionsService {
    private readonly promotionsRepository;
    private readonly foodCategoriesRepository;
    private readonly redisService;
    private readonly allPromotionsCacheKey;
    private readonly validPromotionsCacheKey;
    private readonly cacheTtl;
    constructor(promotionsRepository: PromotionsRepository, foodCategoriesRepository: FoodCategoriesRepository, redisService: RedisService);
    create(createPromotionDto: CreatePromotionDto): Promise<ApiResponse<Promotion>>;
    findValidWithRestaurants(): Promise<ApiResponse<Promotion[]>>;
    findAll(): Promise<ApiResponse<Promotion[]>>;
    findOne(id: string): Promise<ApiResponse<Promotion>>;
    update(id: string, updatePromotionDto: UpdatePromotionDto): Promise<ApiResponse<Promotion>>;
    remove(id: string): Promise<ApiResponse<null>>;
    updateEntityAvatar(uploadResult: {
        url: string;
        public_id: string;
    }, entityId: string): Promise<ApiResponse<any>>;
    findAllPaginated(page?: number, limit?: number): Promise<ApiResponse<any>>;
}
