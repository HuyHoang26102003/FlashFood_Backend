import { PenaltiesService } from './penalties.service';
import { CreatePenaltyDto } from './dto/create-penalty.dto';
import { UpdatePenaltyDto } from './dto/update-penalty.dto';
export declare class PenaltiesController {
    private readonly penaltiesService;
    constructor(penaltiesService: PenaltiesService);
    create(createPenaltyDto: CreatePenaltyDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/penalty.entity").Penalty>>;
    findAll(): Promise<import("../utils/createResponse").ApiResponse<import("./entities/penalty.entity").Penalty[]>>;
    findAllPaginated(page?: string, limit?: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
    findByDriverId(driverId: string, limit?: string, offset?: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/penalty.entity").Penalty[]>>;
    findByCustomerCareId(customerCareId: string, limit?: string, offset?: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/penalty.entity").Penalty[]>>;
    findByRestaurantId(restaurantId: string, limit?: string, offset?: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/penalty.entity").Penalty[]>>;
    findByAdminId(adminId: string, limit?: string, offset?: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/penalty.entity").Penalty[]>>;
    findOne(id: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/penalty.entity").Penalty>>;
    update(id: string, updatePenaltyDto: UpdatePenaltyDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/penalty.entity").Penalty>>;
    updateStatus(id: string, status: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/penalty.entity").Penalty>>;
    remove(id: string): Promise<import("../utils/createResponse").ApiResponse<null>>;
}
