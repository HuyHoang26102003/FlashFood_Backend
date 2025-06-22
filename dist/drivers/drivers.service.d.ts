import { CreateDriverDto, UpdateVehicleDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver } from './entities/driver.entity';
import { ApiResponse } from 'src/utils/createResponse';
import { Type_Delivery_Order } from 'src/types/Driver';
import { AddressBookRepository } from 'src/address_book/address_book.repository';
import { DriversRepository } from './drivers.repository';
import { Order } from 'src/orders/entities/order.entity';
import { OrdersRepository } from 'src/orders/orders.repository';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { DriverProgressStagesRepository } from 'src/driver_progress_stages/driver_progress_stages.repository';
import { OnlineSessionsService } from 'src/online-sessions/online-sessions.service';
import { DriverStatsService } from 'src/driver_stats_records/driver_stats_records.service';
import { RatingsReviewsRepository } from 'src/ratings_reviews/ratings_reviews.repository';
import { ToggleDriverAvailabilityDto } from './dto/driver-availability.dto';
import { RedisService } from 'src/redis/redis.service';
export declare class DriversService {
    private readonly driversRepository;
    private driverEntityRepository;
    private readonly ordersRepository;
    private readonly driverStatsService;
    private readonly addressRepository;
    private readonly driverProgressStageRepository;
    private readonly onlineSessionsService;
    private readonly dataSource;
    private readonly ratingsReviewsRepository;
    private readonly redisService;
    constructor(driversRepository: DriversRepository, driverEntityRepository: Repository<Driver>, ordersRepository: OrdersRepository, driverStatsService: DriverStatsService, addressRepository: AddressBookRepository, driverProgressStageRepository: DriverProgressStagesRepository, onlineSessionsService: OnlineSessionsService, dataSource: DataSource, ratingsReviewsRepository: RatingsReviewsRepository, redisService: RedisService);
    onModuleInit(): Promise<void>;
    preloadDrivers(): Promise<void>;
    clearRedis(): Promise<ApiResponse<null>>;
    toggleAvailability(id: string, toggleDto: ToggleDriverAvailabilityDto): Promise<ApiResponse<Driver>>;
    create(createDriverDto: CreateDriverDto): Promise<ApiResponse<Driver>>;
    findAll(): Promise<ApiResponse<any>>;
    findDriverById(id: string): Promise<ApiResponse<any>>;
    findOne(conditions: object): Promise<ApiResponse<Driver>>;
    update(id: string, updateDriverDto: UpdateDriverDto): Promise<ApiResponse<Driver>>;
    remove(id: string): Promise<ApiResponse<null>>;
    updateEntityAvatar(uploadResult: {
        url: string;
        public_id: string;
    }, entityId: string): Promise<ApiResponse<Driver>>;
    prioritizeAndAssignDriver(listAvailableDrivers: Array<{
        id: string;
        location: {
            lng: number;
            lat: number;
        };
        active_points?: number;
        current_order_id?: string[];
    }>, orderDetails: Type_Delivery_Order): Promise<ApiResponse<any>>;
    updateDriverDeliveryStatus(driverId: string, orderId: Order['id'], status: boolean): Promise<ApiResponse<Driver>>;
    updateDriverOrder(driverId: string, orderIds: string[]): Promise<void>;
    addOrderToDriver(driverId: string, orderId: string, restaurantLocation: {
        lat: number;
        lng: number;
    }, transactionalEntityManager?: EntityManager): Promise<ApiResponse<Driver>>;
    private calculateActivePoints;
    private handleDriverResponse;
    private getRestaurantLocation;
    private calculateDriverPriorities;
    private compareDriverPriorities;
    private handleError;
    updateVehicleImages(uploadResults: Array<{
        key: string;
        url: string;
    }>, entityId: string): Promise<ApiResponse<any>>;
    updateVehicle(driverId: string, updateVehicleDto: UpdateVehicleDto): Promise<ApiResponse<Driver>>;
    getAllDriverProgressStages({ driverId, limit, offset }: {
        driverId: string;
        limit?: number;
        offset?: number;
    }): Promise<ApiResponse<any>>;
    formatTime(milliseconds: any): Promise<string>;
    getDriverRatingsReviews(driverId: string): Promise<ApiResponse<any>>;
    getAllOrders(driverId: string): Promise<ApiResponse<any>>;
    findAllPaginated(page?: number, limit?: number): Promise<ApiResponse<{
        totalPages: number;
        currentPage: number;
        totalItems: number;
        items: Driver[];
    }>>;
}
