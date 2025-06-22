import { Repository } from 'typeorm';
import { OnlineSession } from './entities/online-session.entity';
export declare class OnlineSessionsRepository {
    private onlineSessionEntityRepository;
    constructor(onlineSessionEntityRepository: Repository<OnlineSession>);
    findById(id: string): Promise<OnlineSession>;
    findByDriverId(driverId: string, limit: number, offset: number): Promise<OnlineSession[]>;
    findByCustomerCareId(customerCareId: string, limit: number, offset: number): Promise<OnlineSession[]>;
    create(createOnlineSessionDto: any): Promise<any>;
    update(id: string, updateOnlineSessionDto: any): Promise<OnlineSession>;
    remove(id: string): Promise<OnlineSession>;
}
