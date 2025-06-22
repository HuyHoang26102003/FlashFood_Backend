import { OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CustomersService } from './customers.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
export declare class CustomersGateway implements OnGatewayInit {
    private readonly customersService;
    private readonly jwtService;
    private readonly eventEmitter;
    server: Server;
    private readonly logger;
    private isListenerRegistered;
    constructor(customersService: CustomersService, jwtService: JwtService, eventEmitter: EventEmitter2);
    afterInit(): void;
    onModuleDestroy(): Promise<void>;
    private validateToken;
    handleConnection(client: Socket): Promise<void>;
    handleCustomerPlaceOrder(order: any): Promise<{
        event: string;
        data: {
            orderId: any;
            status: any;
            tracking_info: any;
            updated_at: any;
            customer_id: any;
            driver_id: any;
            restaurant_id: any;
            restaurantAddress: any;
            customerAddress: any;
            driverDetails: any;
        };
        message: string;
    }>;
    handleListenUpdateOrderTracking(order: any): Promise<{
        event: string;
        data: any;
        message: string;
    }>;
}
