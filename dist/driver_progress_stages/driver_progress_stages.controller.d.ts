import { DriverProgressStagesService } from './driver_progress_stages.service';
import { CreateDriverProgressStageDto } from './dto/create-driver-progress-stage.dto';
import { UpdateDriverProgressStageDto } from './dto/update-driver-progress-stage.dto';
export declare class DriverProgressStagesController {
    private readonly driverProgressStagesService;
    constructor(driverProgressStagesService: DriverProgressStagesService);
    create(createDto: CreateDriverProgressStageDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/driver_progress_stage.entity").DriverProgressStage>>;
    findAll(): Promise<import("../utils/createResponse").ApiResponse<import("./entities/driver_progress_stage.entity").DriverProgressStage[]>>;
    findById(id: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/driver_progress_stage.entity").DriverProgressStage>>;
    getActiveStageByDriver(driverId: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/driver_progress_stage.entity").DriverProgressStage>>;
    update(id: string, updateDto: UpdateDriverProgressStageDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/driver_progress_stage.entity").DriverProgressStage>>;
    remove(id: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
}
