export declare class CreateAddressBookDto {
    readonly street: string;
    readonly city: string;
    readonly nationality: string;
    readonly is_default: boolean;
    readonly created_at: number;
    readonly updated_at: number;
    readonly postal_code: number;
    readonly location: {
        lng: number;
        lat: number;
    };
    readonly title: string;
}
