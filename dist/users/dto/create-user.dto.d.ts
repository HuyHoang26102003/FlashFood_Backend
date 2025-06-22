import { Enum_UserType } from 'src/types/Payload';
export declare class CreateUserDto {
    readonly verification_code?: string;
    readonly first_name: string;
    readonly password: string;
    readonly last_name: string;
    readonly email: string;
    readonly phone: string;
    readonly user_type: Enum_UserType[];
    readonly address: string[];
    readonly avatar: {
        url: string;
        key: string;
    };
    readonly is_verified: boolean;
}
