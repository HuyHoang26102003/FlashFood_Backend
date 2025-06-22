import { DriversService } from './drivers.service';
import { CreateDriverDto, UpdateVehicleDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { OnlineSessionsService } from 'src/online-sessions/online-sessions.service';
import { ApiResponse } from 'src/utils/createResponse';
import { ToggleDriverAvailabilityDto } from './dto/driver-availability.dto';
export declare class DriversController {
    private readonly driversService;
    private readonly onlineSessionsService;
    constructor(driversService: DriversService, onlineSessionsService: OnlineSessionsService);
    create(createDriverDto: CreateDriverDto): Promise<ApiResponse<import("./entities/driver.entity").Driver>>;
    clearRedis(): Promise<ApiResponse<null>>;
    findAll(): Promise<ApiResponse<any>>;
    findAllPaginated(page?: string, limit?: string): Promise<ApiResponse<{
        totalPages: number;
        currentPage: number;
        totalItems: number;
        items: import("./entities/driver.entity").Driver[];
    }>>;
    findOnlineSessionByDriverId(driverId: string, limit?: string, offset?: string): Promise<ApiResponse<{
        date: any;
        items: any;
        total_milisec: any;
        total_hours: Promise<string>;
    }[]>>;
    findAllDpsByDriverId(driverId: string, limit?: string, offset?: string): Promise<ApiResponse<any>>;
    getAllOrders(id: string): Promise<ApiResponse<any>>;
    findDriverById(id: string): Promise<ApiResponse<any>>;
    getDriverRatingsReviews(id: string): Promise<ApiResponse<any>>;
    findOne(field: string, value: string): Promise<ApiResponse<import("./entities/driver.entity").Driver>>;
    updateDriverVehicle(updateVehicleDto: UpdateVehicleDto, driverId: string): Promise<ApiResponse<import("./entities/driver.entity").Driver>>;
    update(id: string, updateDriverDto: UpdateDriverDto): Promise<ApiResponse<import("./entities/driver.entity").Driver>>;
    toggleAvailability(id: string, toggleDto: ToggleDriverAvailabilityDto): Promise<ApiResponse<any>>;
    remove(id: string): Promise<ApiResponse<null>>;
}
