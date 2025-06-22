import { Repository } from 'typeorm';
import { FoodCategory } from './entities/food_category.entity';
import { CreateFoodCategoryDto } from './dto/create-food_category.dto';
import { UpdateFoodCategoryDto } from './dto/update-food_category.dto';
export declare class FoodCategoriesRepository {
    private repository;
    constructor(repository: Repository<FoodCategory>);
    create(createDto: CreateFoodCategoryDto): Promise<FoodCategory>;
    findAll(): Promise<FoodCategory[]>;
    findById(id: string): Promise<FoodCategory>;
    findByIds(ids: string[]): Promise<FoodCategory[]>;
    findByName(name: string): Promise<FoodCategory>;
    update(id: string, updateDto: UpdateFoodCategoryDto): Promise<FoodCategory>;
    delete(id: string): Promise<boolean>;
    findAllPaginated(skip: number, limit: number): Promise<[FoodCategory[], number]>;
}
