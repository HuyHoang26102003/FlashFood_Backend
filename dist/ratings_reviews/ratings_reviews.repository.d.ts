import { Repository } from 'typeorm';
import { RatingsReview } from './entities/ratings_review.entity';
import { CreateRatingsReviewDto } from './dto/create-ratings_review.dto';
import { UpdateRatingsReviewDto } from './dto/update-ratings_review.dto';
export declare class RatingsReviewsRepository {
    private repository;
    constructor(repository: Repository<RatingsReview>);
    create(createDto: CreateRatingsReviewDto): Promise<RatingsReview>;
    findAll(query?: Record<string, any>): Promise<RatingsReview[]>;
    findById(id: string): Promise<RatingsReview>;
    findOne(query: Record<string, any>): Promise<RatingsReview>;
    update(id: string, updateDto: UpdateRatingsReviewDto): Promise<RatingsReview>;
    remove(id: string): Promise<boolean>;
}
