export declare class CreateCartItemDto {
    item_id: string;
    variants: {
        variant_id: string;
        quantity: number;
    }[];
    customer_id: string;
    restaurant_id: string;
}
