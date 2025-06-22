import { CreateAdminDto } from './create-admin.dto';
import { AdminRole, AdminPermission, AdminStatus } from 'src/utils/types/admin';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { CustomerCare } from 'src/customer_cares/entities/customer_care.entity';
declare const UpdateAdminDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateAdminDto>>;
export declare class UpdateAdminDto extends UpdateAdminDto_base {
    role?: AdminRole;
    permissions?: AdminPermission[];
    assigned_restaurants?: Restaurant[];
    assigned_drivers?: Driver[];
    avatar?: {
        url: string;
        key: string;
    };
    assigned_customer_care?: CustomerCare[];
    status?: AdminStatus;
}
export declare class UpdatePermissionsDto {
    permissions: AdminPermission[];
    requesterId: string;
}
export {};
