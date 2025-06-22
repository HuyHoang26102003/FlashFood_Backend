import { CreateMenuItemDto } from './create-menu_item.dto';
import { DiscountDto } from 'src/discounts/discount.dto';
import { MenuItemVariantDto } from 'src/menu_item_variants/dto/create-menu_item_variant.dto';
declare const UpdateMenuItemDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateMenuItemDto>>;
export declare class UpdateMenuItemDto extends UpdateMenuItemDto_base {
    restaurant_id: string;
    name: string;
    description: string;
    price: number;
    category: string[];
    avatar: {
        key: string;
        url: string;
    };
    availability: boolean;
    suggest_notes: string[];
    variants?: MenuItemVariantDto[];
    discount: DiscountDto;
}
export {};
