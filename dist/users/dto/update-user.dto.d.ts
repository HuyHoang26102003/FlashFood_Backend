import { CreateUserDto } from './create-user.dto';
import { Enum_AppTheme, Enum_UserType } from 'src/types/Payload';
declare const UpdateUserDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    readonly verification_code?: string;
    readonly balance?: number;
    readonly reset_token?: string;
    readonly reset_token_expiry?: Date;
    readonly password?: string;
    readonly app_preferences?: {
        theme: Enum_AppTheme;
    };
    readonly last_login?: Date;
    readonly user_type?: Enum_UserType[];
}
export {};
