import { Repository } from 'typeorm';
import { Penalty } from './entities/penalty.entity';
import { PenaltiesRepository } from './penalties.repository';
import { CreatePenaltyDto } from './dto/create-penalty.dto';
import { UpdatePenaltyDto } from './dto/update-penalty.dto';
import { ApiResponse } from 'src/utils/createResponse';
import { PenaltyRulesRepository } from 'src/penalty-rules/penalty-rules.repository';
import { AdminRepository } from 'src/admin/admin.repository';
import { DriversRepository } from 'src/drivers/drivers.repository';
export declare class PenaltiesService {
    private readonly penaltiesRepository;
    private readonly penaltyRulesRepository;
    private readonly driverRepository;
    private readonly adminRepository;
    private penaltyEntityRepository;
    private readonly logger;
    constructor(penaltiesRepository: PenaltiesRepository, penaltyRulesRepository: PenaltyRulesRepository, driverRepository: DriversRepository, adminRepository: AdminRepository, penaltyEntityRepository: Repository<Penalty>);
    create(createPenaltyDto: CreatePenaltyDto): Promise<ApiResponse<Penalty>>;
    findAll(): Promise<ApiResponse<Penalty[]>>;
    findOne(id: string): Promise<ApiResponse<Penalty>>;
    findByDriverId({ driverId, limit, offset }: {
        driverId: string;
        limit: number;
        offset: number;
    }): Promise<ApiResponse<Penalty[]>>;
    findByCustomerCareId({ customerCareId, limit, offset }: {
        customerCareId: string;
        limit: number;
        offset: number;
    }): Promise<ApiResponse<Penalty[]>>;
    findByRestaurantId({ restaurantId, limit, offset }: {
        restaurantId: string;
        limit: number;
        offset: number;
    }): Promise<ApiResponse<Penalty[]>>;
    findByAdminId({ adminId, limit, offset }: {
        adminId: string;
        limit: number;
        offset: number;
    }): Promise<ApiResponse<Penalty[]>>;
    update(id: string, updatePenaltyDto: UpdatePenaltyDto): Promise<ApiResponse<Penalty>>;
    updateStatus(id: string, status: string): Promise<ApiResponse<Penalty>>;
    remove(id: string): Promise<ApiResponse<null>>;
    findAllPaginated(page?: number, limit?: number): Promise<ApiResponse<any>>;
    private handlePenaltyResponse;
    private handleError;
}
