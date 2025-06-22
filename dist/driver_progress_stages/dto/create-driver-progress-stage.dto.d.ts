import { Order } from 'src/orders/entities/order.entity';
declare class LocationDto {
    lat: number;
    lng: number;
}
declare class WeatherDto {
    temperature?: number;
    condition?: string;
}
declare class StageDetailsDto {
    location?: LocationDto;
    estimated_time?: number;
    actual_time?: number;
    notes?: string;
    tip?: number;
    weather?: WeatherDto;
}
export declare class StageDto {
    state: string;
    status: 'pending' | 'completed' | 'in_progress' | 'failed';
    timestamp: number;
    duration: number;
    details?: StageDetailsDto;
}
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
export declare class CreateDriverProgressStageDto {
    driver_id: string;
    orders: Order[];
    current_state: string;
    total_earns: number;
    stages?: StageDto[];
    events?: EventDto[];
    previous_state?: string;
    next_state?: string;
    estimated_time_remaining?: number;
    actual_time_spent?: number;
    total_distance_travelled?: number;
    total_tips?: number;
}
export {};
