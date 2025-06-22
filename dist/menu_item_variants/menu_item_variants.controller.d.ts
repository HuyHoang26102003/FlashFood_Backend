import { MenuItemVariantsService } from './menu_item_variants.service';
import { CreateMenuItemVariantDto } from './dto/create-menu_item_variant.dto';
import { UpdateMenuItemVariantDto } from './dto/update-menu_item_variant.dto';
export declare class MenuItemVariantsController {
    private readonly menuItemVariantsService;
    constructor(menuItemVariantsService: MenuItemVariantsService);
    create(createMenuItemVariantDto: CreateMenuItemVariantDto): Promise<any>;
    findAll(): Promise<any>;
    findAllPaginated(page?: string, limit?: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
    findOne(id: string): Promise<any>;
    update(id: string, updateMenuItemVariantDto: UpdateMenuItemVariantDto): Promise<any>;
    remove(id: string): Promise<any>;
}
