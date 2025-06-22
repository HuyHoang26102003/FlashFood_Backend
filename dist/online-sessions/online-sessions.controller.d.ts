import { OnlineSessionsService } from './online-sessions.service';
import { CreateOnlineSessionDto } from './dto/create-online-session.dto';
import { UpdateOnlineSessionDto } from './dto/update-online-session.dto';
export declare class OnlineSessionsController {
    private readonly onlineSessionsService;
    constructor(onlineSessionsService: OnlineSessionsService);
    create(createOnlineSessionDto: CreateOnlineSessionDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/online-session.entity").OnlineSession>>;
    findAll(): Promise<import("../utils/createResponse").ApiResponse<import("./entities/online-session.entity").OnlineSession[]>>;
    findByDriverId(driverId: string, limit?: string, offset?: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/online-session.entity").OnlineSession[]>>;
    findByCustomerCareId(customerCareId: string, limit?: string, offset?: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/online-session.entity").OnlineSession[]>>;
    findOne(id: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/online-session.entity").OnlineSession>>;
    update(id: string, updateOnlineSessionDto: UpdateOnlineSessionDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/online-session.entity").OnlineSession>>;
    endSession(id: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/online-session.entity").OnlineSession>>;
    remove(id: string): Promise<import("../utils/createResponse").ApiResponse<null>>;
}
