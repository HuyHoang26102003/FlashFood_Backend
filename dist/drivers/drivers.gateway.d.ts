import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Socket } from 'socket.io';
import { DriversService } from './drivers.service';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { OrdersService } from 'src/orders/orders.service';
import { DriverProgressStagesService } from 'src/driver_progress_stages/driver_progress_stages.service';
import { Order } from 'src/orders/entities/order.entity';
import { DataSource } from 'typeorm';
import { DriverProgressStage } from 'src/driver_progress_stages/entities/driver_progress_stage.entity';
import { AddressBookRepository } from 'src/address_book/address_book.repository';
import { DriversRepository } from './drivers.repository';
import { JwtService } from '@nestjs/jwt';
import { DriverStatsService } from 'src/driver_stats_records/driver_stats_records.service';
import { FinanceRulesService } from 'src/finance_rules/finance_rules.service';
import { FWalletsRepository } from 'src/fwallets/fwallets.repository';
import { TransactionService } from 'src/transactions/transactions.service';
import { RedisService } from 'src/redis/redis.service';
import { UserRepository } from 'src/users/users.repository';
export declare class DriversGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private socketServer;
    private readonly restaurantsService;
    private readonly driverService;
    private readonly driverRepository;
    private readonly driverStatsService;
    private readonly eventEmitter;
    private readonly ordersService;
    private readonly financeRulesService;
    private readonly fWalletsRepository;
    private readonly transactionsService;
    private readonly driverProgressStageService;
    private readonly dataSource;
    private readonly addressBookRepository;
    private readonly jwtService;
    private readonly redisService;
    private readonly userRepository;
    private server;
    private driverSockets;
    private notificationLock;
    private activeConnections;
    private dpsCreationLocks;
    private processingOrders;
    private processedEvents;
    private isListenerRegistered;
    private redisClient;
    constructor(socketServer: any, restaurantsService: RestaurantsService, driverService: DriversService, driverRepository: DriversRepository, driverStatsService: DriverStatsService, eventEmitter: EventEmitter2, ordersService: OrdersService, financeRulesService: FinanceRulesService, fWalletsRepository: FWalletsRepository, transactionsService: TransactionService, driverProgressStageService: DriverProgressStagesService, dataSource: DataSource, addressBookRepository: AddressBookRepository, jwtService: JwtService, redisService: RedisService, userRepository: UserRepository);
    afterInit(): void;
    private registerEventListeners;
    onModuleDestroy(): Promise<void>;
    private validateToken;
    handleConnection(client: Socket): Promise<boolean>;
    cleanupDriverConnections(driverId: string, newSocketId: string): Promise<void>;
    handleDisconnect(client: Socket): void;
    private deduplicateEvent;
    handleNewOrder(order: any): Promise<any>;
    notifyPartiesOnce(order: Order): Promise<void>;
    handleDriverProgressUpdate(data: {
        stageId: string;
        orderId?: string;
    }): Promise<{
        success: boolean;
        stage: DriverProgressStage;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
    }>;
    handleDriverAcceptOrder(data: {
        driverId: string;
        orderId: string;
    }): Promise<{
        success: boolean;
        data: {
            order: Order;
            dps: DriverProgressStage;
        };
    } | {
        success: boolean;
        message: string;
    }>;
    private getStageDetails;
    handleOrderAssignedToDriver(orderAssignment: any): Promise<{
        event: string;
        data: {
            success: boolean;
        };
    }>;
    private handleDeliveryCompletion;
    private prepareDriverNotificationData;
    private prepareAddressData;
    private prepareDriverDetails;
    private formatFullAddress;
    private calculateDistance;
    private deg2rad;
    private calculateEstimatedTime;
}
