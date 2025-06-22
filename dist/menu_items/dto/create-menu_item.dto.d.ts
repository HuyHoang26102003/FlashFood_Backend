import { DiscountDto } from 'src/discounts/discount.dto';
import { MenuItemVariantDto } from 'src/menu_item_variants/dto/create-menu_item_variant.dto';
export declare class CreateMenuItemDto {
    restaurant_id: string;
    name: string;
    description: string;
    price: number;
    category: string[];
    avatar?: {
        key: string;
        url: string;
    };
    availability?: boolean;
    suggest_notes?: string[];
    variants?: MenuItemVariantDto[];
    discount?: DiscountDto;
}
