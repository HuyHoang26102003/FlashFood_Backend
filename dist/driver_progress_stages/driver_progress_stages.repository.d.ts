import { Repository, DataSource } from 'typeorm';
import { DriverProgressStage } from './entities/driver_progress_stage.entity';
import { CreateDriverProgressStageDto } from './dto/create-driver-progress-stage.dto';
import { UpdateDriverProgressStageDto } from './dto/update-driver-progress-stage.dto';
export declare class DriverProgressStagesRepository {
    private repository;
    private dataSource;
    constructor(repository: Repository<DriverProgressStage>, dataSource: DataSource);
    create(createDto: CreateDriverProgressStageDto): Promise<DriverProgressStage>;
    findAll(): Promise<DriverProgressStage[]>;
    findById(id: string): Promise<DriverProgressStage>;
    findByDriverId(driverId: string): Promise<DriverProgressStage>;
    update(id: string, updateDto: UpdateDriverProgressStageDto): Promise<DriverProgressStage>;
    remove(id: string): Promise<boolean>;
    updateStages(id: string, stages: any[]): Promise<DriverProgressStage>;
    getAllByDriverId(driverId: string, offset?: number, limit?: number): Promise<DriverProgressStage[]>;
}
