import { CreatePenaltyDto } from './create-penalty.dto';
declare const UpdatePenaltyDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreatePenaltyDto>>;
export declare class UpdatePenaltyDto extends UpdatePenaltyDto_base {
    description?: string;
    penalty_points?: number;
    status?: string;
    expires_at?: number;
}
export {};
