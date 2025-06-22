import { CreateDriverDto } from './create-driver.dto';
import { Order } from 'src/orders/entities/order.entity';
declare const UpdateDriverDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateDriverDto>>;
export declare class UpdateDriverDto extends UpdateDriverDto_base {
    id?: string;
    user_id?: string;
    first_name?: string;
    last_name?: string;
    contact_email?: {
        title: string;
        is_default: boolean;
        email: string;
    }[];
    contact_phone?: {
        title: string;
        number: string;
        is_default: boolean;
    }[];
    vehicle?: {
        license_plate: string;
        model: string;
        color: string;
    };
    current_location?: {
        lat: number;
        lng: number;
    };
    current_orders?: Order[];
    created_at?: number;
    updated_at?: number;
    last_login?: number;
    avatar?: {
        key: string;
        url: string;
    };
    available_for_work?: boolean;
    is_on_delivery?: boolean;
    active_points?: number;
    rating?: {
        average_rating: number;
        review_count: number;
    };
}
export {};
