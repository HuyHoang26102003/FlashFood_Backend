import { MenuItemVariant } from './entities/menu_item_variant.entity';
import { CreateMenuItemVariantDto } from './dto/create-menu_item_variant.dto';
import { UpdateMenuItemVariantDto } from './dto/update-menu_item_variant.dto';
import { MenuItemVariantsRepository } from './menu_item_variants.repository';
import { MenuItemsRepository } from 'src/menu_items/menu_items.repository';
export declare class MenuItemVariantsService {
    private readonly menuItemVariantRepository;
    private readonly menuItemRepository;
    private readonly logger;
    constructor(menuItemVariantRepository: MenuItemVariantsRepository, menuItemRepository: MenuItemsRepository);
    create(createMenuItemVariantDto: CreateMenuItemVariantDto): Promise<any>;
    update(id: string, updateMenuItemVariantDto: UpdateMenuItemVariantDto): Promise<any>;
    findAll(query?: Record<string, any>): Promise<any>;
    findOne(id: string): Promise<any>;
    findOneByDetails(price: number, description: string, menu_id: string): Promise<MenuItemVariant>;
    remove(id: string): Promise<any>;
    findAllPaginated(page?: number, limit?: number): Promise<import("src/utils/createResponse").ApiResponse<any>>;
}
