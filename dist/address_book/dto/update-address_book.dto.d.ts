import { CreateAddressBookDto } from './create-address_book.dto';
declare const UpdateAddressBookDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateAddressBookDto>>;
export declare class UpdateAddressBookDto extends UpdateAddressBookDto_base {
    readonly street?: string;
    readonly city?: string;
    readonly nationality?: string;
    readonly is_default?: boolean;
    readonly created_at?: number;
    readonly updated_at?: number;
    readonly postal_code?: number;
    readonly location?: {
        lng: number;
        lat: number;
    };
    readonly title?: string;
}
export {};
