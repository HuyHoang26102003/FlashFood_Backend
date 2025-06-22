import { Server } from 'socket.io';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersGateway {
    private readonly ordersService;
    server: Server;
    constructor(ordersService: OrdersService);
    handleCreateOrder(createOrderDto: CreateOrderDto): Promise<import("../utils/createResponse").ApiResponse<any>>;
}
