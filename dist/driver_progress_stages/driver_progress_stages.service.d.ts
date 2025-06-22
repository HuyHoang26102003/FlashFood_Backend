import { DriverProgressStagesRepository } from './driver_progress_stages.repository';
import { CreateDriverProgressStageDto, StageDto } from './dto/create-driver-progress-stage.dto';
import { UpdateDriverProgressStageDto } from './dto/update-driver-progress-stage.dto';
import { ApiResponse } from 'src/utils/createResponse';
import { DriverProgressStage } from './entities/driver_progress_stage.entity';
import { DriversRepository } from 'src/drivers/drivers.repository';
import { OrdersRepository } from 'src/orders/orders.repository';
import { DataSource, EntityManager } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
export declare class DriverProgressStagesService {
    private readonly driverProgressStagesRepository;
    private readonly driversRepository;
    private readonly ordersRepository;
    private readonly dataSource;
    constructor(driverProgressStagesRepository: DriverProgressStagesRepository, driversRepository: DriversRepository, ordersRepository: OrdersRepository, dataSource: DataSource);
    private calculateTotalEarns;
    private calculateTotalDistance;
    private calculateTimeSpent;
    private getAddressLocation;
    create(createDto: CreateDriverProgressStageDto & {
        estimated_time_remaining?: number;
        total_distance_travelled?: number;
        total_tips?: number;
        total_earns?: number;
    }, transactionalEntityManager?: EntityManager): Promise<ApiResponse<DriverProgressStage>>;
    updateStage(stageId: string, updateData: UpdateDriverProgressStageDto & {
        previous_state?: string | null;
        next_state?: string | null;
        estimated_time_remaining?: number;
        actual_time_spent?: number;
        total_distance_travelled?: number;
        total_tips?: number;
        total_earns?: number;
    }, transactionalEntityManager?: EntityManager): Promise<ApiResponse<DriverProgressStage>>;
    generateStagesForOrders(orders: Order[], orderIndex?: number, completed?: boolean): StageDto[];
    addOrderToExistingDPS(dpsId: string, order: Order, transactionalEntityManager: EntityManager): Promise<ApiResponse<DriverProgressStage>>;
    getActiveStageByDriver(driverId: string): Promise<ApiResponse<DriverProgressStage>>;
    findAll(): Promise<ApiResponse<DriverProgressStage[]>>;
    findById(id: string): Promise<ApiResponse<DriverProgressStage>>;
    remove(id: string): Promise<ApiResponse<any>>;
    updateStages(stageId: string, updatedStages: StageDto[]): Promise<ApiResponse<DriverProgressStage>>;
}
