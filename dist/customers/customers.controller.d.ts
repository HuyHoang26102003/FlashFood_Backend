import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ToggleCustomerFavoriteRestaurantDto, UpdateCustomerDto, UpdateCustomerPreferredCategoryDto } from './dto/update-customer.dto';
import { CartItemsService } from 'src/cart_items/cart_items.service';
import { CreateCartItemDto } from 'src/cart_items/dto/create-cart_item.dto';
import { UpdateCartItemDto } from 'src/cart_items/dto/update-cart_item.dto';
import { AddressBookService } from 'src/address_book/address_book.service';
import { CreateAddressBookDto } from 'src/address_book/dto/create-address_book.dto';
import { ApiResponse } from 'src/utils/createResponse';
import { Customer } from './entities/customer.entity';
export declare class CustomersController {
    private readonly customersService;
    private readonly cartItemService;
    private readonly addressBookService;
    constructor(customersService: CustomersService, cartItemService: CartItemsService, addressBookService: AddressBookService);
    create(createCustomerDto: CreateCustomerDto): Promise<ApiResponse<Customer>>;
    findAll(): Promise<ApiResponse<Customer[]>>;
    findAllPaginated(page?: string, limit?: string): Promise<ApiResponse<{
        totalPages: number;
        currentPage: number;
        totalItems: number;
        items: Customer[];
    }>>;
    getAllRestaurants(id: string): Promise<any>;
    searchRestaurants(keyword: string, page?: number, limit?: number): Promise<ApiResponse<import("../restaurants/entities/restaurant.entity").Restaurant[]>> | {
        status: string;
        data: any;
        message: string;
    };
    getFavoriteRestaurants(customerId: string): Promise<ApiResponse<import("../restaurants/entities/restaurant.entity").Restaurant[]>>;
    getAllOrders(id: string): Promise<ApiResponse<any>>;
    findAllCartItemByCustomerId(customerId: string): Promise<any>;
    getNotifications(customerId: string): Promise<ApiResponse<any>>;
    findCustomerById(id: string): Promise<ApiResponse<any>>;
    findOne(field: string, value: string): Promise<ApiResponse<Customer>>;
    toggleFavoriteRestaurant(id: string, toggleDto: ToggleCustomerFavoriteRestaurantDto): Promise<ApiResponse<Customer>>;
    togglePreferredCategory(id: string, preferred_category: UpdateCustomerPreferredCategoryDto): Promise<ApiResponse<Customer>>;
    updateCartItem(customer_id: string, cart_item_id: string, cart_item: UpdateCartItemDto): Promise<any>;
    addAddress(customerId: string, createAddressBookDto: CreateAddressBookDto): Promise<ApiResponse<import("../address_book/entities/address_book.entity").AddressBook>>;
    createCartItem(customerId: string, createCartItemDto: CreateCartItemDto): Promise<any>;
    deleteCartItem(cartItemId: string): Promise<any>;
    updateAddress(customerId: string, addressbookId: string): Promise<ApiResponse<any>>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<ApiResponse<Customer>>;
    remove(id: string): Promise<ApiResponse<null>>;
}
