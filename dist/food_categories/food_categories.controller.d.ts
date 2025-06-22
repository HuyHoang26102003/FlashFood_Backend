import { FoodCategoriesService } from './food_categories.service';
import { CreateFoodCategoryDto } from './dto/create-food_category.dto';
import { UpdateFoodCategoryDto } from './dto/update-food_category.dto';
export declare class FoodCategoriesController {
    private readonly foodCategoriesService;
    constructor(foodCategoriesService: FoodCategoriesService);
    create(createFoodCategoryDto: CreateFoodCategoryDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/food_category.entity").FoodCategory>>;
    findAll(): Promise<import("../utils/createResponse").ApiResponse<import("./entities/food_category.entity").FoodCategory[]>>;
    findAllPaginated(page?: string, limit?: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
    findOne(id: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/food_category.entity").FoodCategory>>;
    update(id: string, updateFoodCategoryDto: UpdateFoodCategoryDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/food_category.entity").FoodCategory>>;
    remove(id: string): Promise<import("../utils/createResponse").ApiResponse<null>>;
}
