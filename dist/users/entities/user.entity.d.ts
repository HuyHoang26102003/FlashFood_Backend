import { Enum_UserType, Enum_AppTheme } from 'src/types/Payload';
import { FWallet } from 'src/fwallets/entities/fwallet.entity';
export declare class User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    verification_code: number;
    password: string;
    balance: number;
    user_type: Enum_UserType[];
    address: string[];
    avatar: {
        url: string;
        key: string;
    };
    is_verified: boolean;
    app_preferences: {
        theme: Enum_AppTheme;
    };
    created_at: Date;
    updated_at: Date;
    reset_token: string;
    reset_token_expiry: Date;
    fwallets: FWallet[];
    last_login: Date;
}
