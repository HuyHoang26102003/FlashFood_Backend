import { Repository } from 'typeorm';
import { MenuItem } from './entities/menu_item.entity';
export declare class MenuItemsRepository {
    private menuItemRepository;
    constructor(menuItemRepository: Repository<MenuItem>);
    findByIds(ids: string[]): Promise<MenuItem[]>;
    create(data: Partial<MenuItem>): Promise<MenuItem>;
    findById(id: string): Promise<MenuItem>;
    findOne(conditions: any): Promise<MenuItem>;
    findAll(): Promise<MenuItem[]>;
    findByRestaurantId(restaurantId: string): Promise<MenuItem[]>;
    update(id: string, data: Partial<MenuItem>): Promise<MenuItem>;
    remove(id: string): Promise<void>;
    save(menuItem: MenuItem): Promise<MenuItem>;
    findAllPaginated(skip: number, limit: number): Promise<[MenuItem[], number]>;
}
