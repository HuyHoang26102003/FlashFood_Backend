import { RatingsReviewsService } from './ratings_reviews.service';
import { CreateRatingsReviewDto } from './dto/create-ratings_review.dto';
import { UpdateRatingsReviewDto } from './dto/update-ratings_review.dto';
export declare class RatingsReviewsController {
    private readonly ratingsReviewsService;
    constructor(ratingsReviewsService: RatingsReviewsService);
    create(createRatingsReviewDto: CreateRatingsReviewDto): Promise<import("../utils/createResponse").ApiResponse<any>>;
    findAll(): Promise<import("../utils/createResponse").ApiResponse<any>>;
    findOne(id: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
    update(id: string, updateRatingsReviewDto: UpdateRatingsReviewDto): Promise<import("../utils/createResponse").ApiResponse<any>>;
    remove(id: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
}
