import { DriverStatsService } from './driver_stats_records.service';
export declare class DriverStatsController {
    private readonly driverStatsService;
    constructor(driverStatsService: DriverStatsService);
    getStats(driverId: string, startDate: string, endDate: string, aggregate?: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
}
