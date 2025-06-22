import { CreateFWalletDto } from './create-fwallet.dto';
declare const UpdateFwalletDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateFWalletDto>>;
export declare class UpdateFwalletDto extends UpdateFwalletDto_base {
    balance?: number;
    email?: string;
    password?: string;
    first_name?: string;
    last_name?: string;
    user_id?: string;
}
export {};
