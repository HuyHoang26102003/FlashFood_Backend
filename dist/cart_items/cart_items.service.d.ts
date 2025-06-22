import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { UpdateCartItemDto } from './dto/update-cart_item.dto';
import { CartItemsRepository } from './cart_items.repository';
import { RestaurantsRepository } from 'src/restaurants/restaurants.repository';
import { CustomersRepository } from 'src/customers/customers.repository';
import { MenuItemsRepository } from 'src/menu_items/menu_items.repository';
import { MenuItemVariantsRepository } from 'src/menu_item_variants/menu_item_variants.repository';
export declare class CartItemsService {
    private readonly cartItemsRepository;
    private readonly restaurantRepository;
    private readonly customersRepository;
    private readonly menuItemsRepository;
    private readonly menuItemVariantsRepository;
    constructor(cartItemsRepository: CartItemsRepository, restaurantRepository: RestaurantsRepository, customersRepository: CustomersRepository, menuItemsRepository: MenuItemsRepository, menuItemVariantsRepository: MenuItemVariantsRepository);
    private calculateDiscountedPrice;
    create(createCartItemDto: CreateCartItemDto): Promise<any>;
    update(id: string, updateCartItemDto: UpdateCartItemDto): Promise<any>;
    findAll(query?: Record<string, any>): Promise<any>;
    findById(id: string): Promise<any>;
    findOne(query: Record<string, any>): Promise<any>;
    remove(id: string): Promise<any>;
    private populateVariants;
    private updateExistingCartItemVariants;
}
