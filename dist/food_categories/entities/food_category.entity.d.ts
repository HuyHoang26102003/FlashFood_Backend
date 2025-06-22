import { Promotion } from 'src/promotions/entities/promotion.entity';
export declare class FoodCategory {
    id: string;
    name: string;
    description: string;
    avatar: {
        url: string;
        key: string;
    };
    created_at: number;
    updated_at: number;
    promotions: Promotion[];
    generateId(): void;
}
