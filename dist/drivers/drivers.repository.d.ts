import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { Order } from 'src/orders/entities/order.entity';
export declare class DriversRepository {
    private driverEntityRepository;
    private orderRepository;
    constructor(driverEntityRepository: Repository<Driver>, orderRepository: Repository<Order>);
    findById(id: string, options?: {
        relations?: string[];
    }): Promise<Driver>;
    findOne(conditions: object): Promise<Driver>;
    findOneOrFail(conditions: {
        where: object;
    }): Promise<Driver>;
    findAll(): Promise<Driver[]>;
    create(createDriverDto: any): Promise<any>;
    update(id: string, updateDriverDto: any): Promise<Driver>;
    save(driver: Driver): Promise<Driver>;
    remove(id: string): Promise<Driver>;
    findByUserId(userId: string): Promise<Driver>;
    updateVehicleImages(id: string, vehicleImages: Array<{
        key: string;
        url: string;
    }>): Promise<Driver>;
    findAllPaginated(skip: number, limit: number): Promise<[Driver[], number]>;
}
