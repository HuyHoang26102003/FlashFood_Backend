import { Repository } from 'typeorm';
import { OnlineSession } from './entities/online-session.entity';
import { CreateOnlineSessionDto } from './dto/create-online-session.dto';
import { UpdateOnlineSessionDto } from './dto/update-online-session.dto';
import { OnlineSessionsRepository } from './online-session.repository';
import { ApiResponse } from 'src/utils/createResponse';
export declare class OnlineSessionsService {
    private readonly onlineSessionsRepository;
    private onlineSessionEntityRepository;
    constructor(onlineSessionsRepository: OnlineSessionsRepository, onlineSessionEntityRepository: Repository<OnlineSession>);
    create(createOnlineSessionDto: CreateOnlineSessionDto): Promise<ApiResponse<OnlineSession>>;
    findAll(): Promise<ApiResponse<OnlineSession[]>>;
    findOne(id: string): Promise<ApiResponse<OnlineSession>>;
    findByDriverId({ driverId, limit, offset }: {
        driverId: string;
        limit: number;
        offset: number;
    }): Promise<ApiResponse<OnlineSession[]>>;
    findByCustomerCareId({ customerCareId, limit, offset }: {
        customerCareId: string;
        limit: number;
        offset: number;
    }): Promise<ApiResponse<OnlineSession[]>>;
    update(id: string, updateOnlineSessionDto: UpdateOnlineSessionDto): Promise<ApiResponse<OnlineSession>>;
    findOneByDriverIdAndActive(driverId: string): Promise<OnlineSession | null>;
    endSession(id: string): Promise<ApiResponse<OnlineSession>>;
    remove(id: string): Promise<ApiResponse<null>>;
    private handleSessionResponse;
    private handleError;
}
