import { AdminService } from '../admin.service';
import { PromotionsService } from '../../promotions/promotions.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { CreatePromotionDto } from '../../promotions/dto/create-promotion.dto';
import { UpdatePromotionDto } from '../../promotions/dto/update-promotion.dto';
export declare class FinanceAdminController {
    private readonly adminService;
    private readonly promotionsService;
    constructor(adminService: AdminService, promotionsService: PromotionsService);
    createFinanceAdmin(createAdminDto: CreateAdminDto): Promise<import("../../utils/createResponse").ApiResponse<import("../entities/admin.entity").Admin>>;
    findAllFinanceAdmins(): Promise<import("../../utils/createResponse").ApiResponse<import("../entities/admin.entity").Admin[]>>;
    findAllPromotions(): Promise<import("../../utils/createResponse").ApiResponse<import("../../promotions/entities/promotion.entity").Promotion[]>>;
    findOneFinanceAdmin(id: string): Promise<import("../../utils/createResponse").ApiResponse<import("../entities/admin.entity").Admin>>;
    updateFinanceAdmin(id: string, updateAdminDto: UpdateAdminDto): Promise<import("../../utils/createResponse").ApiResponse<import("../entities/admin.entity").Admin>>;
    removeFinanceAdmin(id: string): Promise<import("../../utils/createResponse").ApiResponse<null>>;
    createPromotion(createPromotionDto: CreatePromotionDto): Promise<import("../../utils/createResponse").ApiResponse<import("../../promotions/entities/promotion.entity").Promotion>>;
    findOnePromotion(id: string): Promise<import("../../utils/createResponse").ApiResponse<import("../../promotions/entities/promotion.entity").Promotion>>;
    updatePromotion(id: string, updatePromotionDto: UpdatePromotionDto): Promise<import("../../utils/createResponse").ApiResponse<import("../../promotions/entities/promotion.entity").Promotion>>;
    removePromotion(id: string): Promise<import("../../utils/createResponse").ApiResponse<null>>;
}
