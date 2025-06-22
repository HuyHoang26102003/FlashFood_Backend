import { CreateCartItemDto } from './create-cart_item.dto';
declare const UpdateCartItemDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateCartItemDto>>;
export declare class UpdateCartItemDto extends UpdateCartItemDto_base {
    item_id: string;
    variants: {
        variant_id: string;
        quantity: number;
    }[];
    customer_id: string;
    restaurant_id: string;
    updated_at: number;
}
export {};
