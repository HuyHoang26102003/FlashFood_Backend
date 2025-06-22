import { Repository } from 'typeorm';
import { MenuItemVariant } from './entities/menu_item_variant.entity';
export declare class MenuItemVariantsRepository {
    private menuItemVariantRepository;
    constructor(menuItemVariantRepository: Repository<MenuItemVariant>);
    create(data: Partial<MenuItemVariant>): Promise<MenuItemVariant>;
    findById(id: string): Promise<MenuItemVariant>;
    findByIds(ids: string[]): Promise<MenuItemVariant[]>;
    findByDetails(price: number, description: string, menu_id: string): Promise<MenuItemVariant>;
    findAll(conditions?: any): Promise<MenuItemVariant[]>;
    findAllPaginated(skip: number, limit: number): Promise<[MenuItemVariant[], number]>;
    update(id: string, data: Partial<MenuItemVariant>): Promise<MenuItemVariant>;
    remove(id: string): Promise<void>;
}
