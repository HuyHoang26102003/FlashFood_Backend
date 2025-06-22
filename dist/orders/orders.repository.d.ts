import { Repository } from 'typeorm';
import { Order, OrderStatus, OrderTrackingInfo } from './entities/order.entity';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersRepository {
    private repository;
    private promotionRepository;
    constructor(repository: Repository<Order>, promotionRepository: Repository<Promotion>);
    create(createDto: CreateOrderDto): Promise<Order>;
    findAll(): Promise<Order[]>;
    findById(id: string): Promise<Order>;
    findOne(conditions: object): Promise<Order>;
    update(id: string, updateDto: any): Promise<Order>;
    delete(id: string): Promise<boolean>;
    updateStatus(id: string, { status, tracking_info }: {
        status: OrderStatus;
        tracking_info: OrderTrackingInfo;
    }): Promise<Order>;
    updateTrackingInfo(id: string, tracking_info: OrderTrackingInfo): Promise<Order>;
    updateDriverTips(id: string, driver_tips: number): Promise<Order>;
    findAllPaginated(skip: number, limit: number): Promise<[Order[], number]>;
}
