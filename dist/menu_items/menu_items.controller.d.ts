import { MenuItemsService } from './menu_items.service';
import { CreateMenuItemDto } from './dto/create-menu_item.dto';
import { UpdateMenuItemDto } from './dto/update-menu_item.dto';
export declare class MenuItemsController {
    private readonly menuItemsService;
    constructor(menuItemsService: MenuItemsService);
    create(createMenuItemDto: CreateMenuItemDto): Promise<import("../utils/createResponse").ApiResponse<any>>;
    findAll(): Promise<import("../utils/createResponse").ApiResponse<import("./entities/menu_item.entity").MenuItem[]>>;
    findAllPaginated(page?: string, limit?: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
    findOne(id: string): Promise<import("../utils/createResponse").ApiResponse<any>>;
    update(id: string, updateMenuItemDto: UpdateMenuItemDto): Promise<import("../utils/createResponse").ApiResponse<import("./entities/menu_item.entity").MenuItem>>;
    remove(id: string): Promise<import("../utils/createResponse").ApiResponse<null>>;
    toggleAvailability(id: string): Promise<import("../utils/createResponse").ApiResponse<import("./entities/menu_item.entity").MenuItem>>;
}
