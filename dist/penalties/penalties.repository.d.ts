import { Repository } from 'typeorm';
import { Penalty } from './entities/penalty.entity';
export declare class PenaltiesRepository {
    private penaltyEntityRepository;
    constructor(penaltyEntityRepository: Repository<Penalty>);
    findById(id: string): Promise<Penalty>;
    findByDriverId(driverId: string, limit: number, offset: number): Promise<Penalty[]>;
    findByCustomerCareId(customerCareId: string, limit: number, offset: number): Promise<Penalty[]>;
    findByRestaurantId(restaurantId: string, limit: number, offset: number): Promise<Penalty[]>;
    findByAdminId(adminId: string, limit: number, offset: number): Promise<Penalty[]>;
    create(createPenaltyDto: any): Promise<any>;
    update(id: string, updatePenaltyDto: any): Promise<Penalty>;
    remove(id: string): Promise<Penalty>;
    findAllPaginated(skip: number, limit: number): Promise<[Penalty[], number]>;
}
