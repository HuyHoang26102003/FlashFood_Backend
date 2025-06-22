import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
export declare class PromotionsController {
    private readonly promotionsService;
    constructor(promotionsService: PromotionsService);
    create(createPromotionDto: CreatePromotionDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/promotion.entity").Promotion>>;
    findAll(): Promise<import("../utils/createResponse").ApiResponse<import("./entities/promotion.entity").Promotion[]>>;
    findAllPaginated(page?: string, limit?: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
    findValidWithRestaurants(): Promise<import("../utils/createResponse").ApiResponse<import("./entities/promotion.entity").Promotion[]>>;
    findOne(id: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/promotion.entity").Promotion>>;
    update(id: string, updatePromotionDto: UpdatePromotionDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/promotion.entity").Promotion>>;
    remove(id: string): Promise<import("../utils/createResponse").ApiResponse<null>>;
}
