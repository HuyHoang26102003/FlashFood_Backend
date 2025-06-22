import { CreateFoodCategoryDto } from './create-food_category.dto';
declare const UpdateFoodCategoryDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateFoodCategoryDto>>;
export declare class UpdateFoodCategoryDto extends UpdateFoodCategoryDto_base {
    readonly name: string;
    readonly description: string;
    readonly avatar: {
        key: string;
        url: string;
    };
}
export {};
