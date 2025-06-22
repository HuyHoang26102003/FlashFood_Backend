import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WsResponse } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { RestaurantsService } from './restaurants.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { DriversService } from 'src/drivers/drivers.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrdersRepository } from 'src/orders/orders.repository';
import { JwtService } from '@nestjs/jwt';
import { FinanceRulesService } from 'src/finance_rules/finance_rules.service';
import { DriverStatsService } from 'src/driver_stats_records/driver_stats_records.service';
import { RedisService } from 'src/redis/redis.service';
import { OrdersService } from 'src/orders/orders.service';
interface AvailableDriver {
    id: string;
    lat: number;
    lng: number;
}
interface RestaurantAcceptData {
    availableDrivers: AvailableDriver[];
    orderDetails: string;
}
export declare class RestaurantsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private socketServer;
    private readonly restaurantsService;
    private readonly driverService;
    private eventEmitter;
    private readonly ordersRepository;
    private readonly jwtService;
    private readonly driverStatsService;
    private readonly financeRulesService;
    private readonly redisService;
    private readonly ordersService;
    private server;
    private notificationLock;
    private activeConnections;
    private restaurantSockets;
    private redisClient;
    private isListenerRegistered;
    private readonly logger;
    constructor(socketServer: any, restaurantsService: RestaurantsService, driverService: DriversService, eventEmitter: EventEmitter2, ordersRepository: OrdersRepository, jwtService: JwtService, driverStatsService: DriverStatsService, financeRulesService: FinanceRulesService, redisService: RedisService, ordersService: OrdersService);
    afterInit(): void;
    onModuleDestroy(): Promise<void>;
    private validateToken;
    handleConnection(client: Socket): Promise<void>;
    cleanupRestaurantConnections(restaurantId: string, newSocketId: string): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleUpdateRestaurant(updateRestaurantDto: UpdateRestaurantDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/restaurant.entity").Restaurant>>;
    handleNewOrder(order: any): Promise<{
        event: string;
        data: any;
        message: string;
    }>;
    handleRestaurantAccept(data: RestaurantAcceptData, client: Socket): Promise<WsResponse<any>>;
    private prepareDriverData;
    private isValidDriverResponse;
    private calculateOrderMetrics;
    private calculateDriverWage;
    private updateOrderWithMetrics;
    private getUpdatedOrder;
    private notifyDriverAndParties;
    handleRestaurantOrderReady(data: {
        orderId: string;
    }): Promise<{
        event: string;
        data: import("src/orders/entities/order.entity").Order;
    } | {
        event: string;
        data: {
            message: string;
        };
    }>;
    notifyPartiesOnce(order: any): Promise<void>;
    handleOrderTrackingUpdate(order: any): Promise<{
        event: string;
        data: {
            orderId: any;
            status: any;
            tracking_info: any;
            updated_at: any;
            customer_id: any;
            driver_id: any;
            restaurant_id: any;
            restaurant_avatar: any;
            driver_avatar: any;
            restaurantAddress: any;
            customerAddress: any;
            driverDetails: any;
        };
        message: string;
    }>;
}
export {};
