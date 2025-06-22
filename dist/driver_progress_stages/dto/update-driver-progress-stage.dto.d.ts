import { CreateDriverProgressStageDto } from './create-driver-progress-stage.dto';
declare class EventDetailsDto {
    location?: {
        lat: number;
        lng: number;
    };
    notes?: string;
}
declare class EventDto {
    event_type: 'driver_start' | 'pickup_complete' | 'delivery_complete';
    event_timestamp: Date;
    event_details?: EventDetailsDto;
}
declare const UpdateDriverProgressStageDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateDriverProgressStageDto>>;
export declare class UpdateDriverProgressStageDto extends UpdateDriverProgressStageDto_base {
    events?: EventDto[];
    transactions_processed?: boolean;
    updated_at?: number;
    version?: number;
}
export {};
