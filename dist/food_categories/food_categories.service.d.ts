import { CreateFoodCategoryDto } from './dto/create-food_category.dto';
import { UpdateFoodCategoryDto } from './dto/update-food_category.dto';
import { FoodCategoriesRepository } from './food_categories.repository';
import { ApiResponse } from 'src/utils/createResponse';
import { FoodCategory } from './entities/food_category.entity';
import { RedisService } from 'src/redis/redis.service';
import { Repository } from 'typeorm';
export declare class FoodCategoriesService {
    private readonly foodCategoriesRepository;
    private readonly redisService;
    private readonly foodCategoryRepository;
    private readonly cacheKey;
    private readonly cacheTtl;
    constructor(foodCategoriesRepository: FoodCategoriesRepository, redisService: RedisService, foodCategoryRepository: Repository<FoodCategory>);
    create(createFoodCategoryDto: CreateFoodCategoryDto): Promise<ApiResponse<FoodCategory>>;
    findAll(): Promise<ApiResponse<FoodCategory[]>>;
    findOne(id: string): Promise<ApiResponse<FoodCategory>>;
    update(id: string, updateFoodCategoryDto: UpdateFoodCategoryDto): Promise<ApiResponse<FoodCategory>>;
    remove(id: string): Promise<ApiResponse<null>>;
    findAllPaginated(page?: number, limit?: number): Promise<ApiResponse<any>>;
}
