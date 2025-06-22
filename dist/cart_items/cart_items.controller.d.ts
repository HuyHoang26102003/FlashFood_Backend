import { CartItemsService } from './cart_items.service';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { UpdateCartItemDto } from './dto/update-cart_item.dto';
export declare class CartItemsController {
    private readonly cartItemsService;
    constructor(cartItemsService: CartItemsService);
    create(createCartItemDto: CreateCartItemDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateCartItemDto: UpdateCartItemDto): Promise<any>;
    remove(id: string): Promise<any>;
}
