import { DataSource, Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AddressBook } from 'src/address_book/entities/address_book.entity';
import { FoodCategory } from 'src/food_categories/entities/food_category.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
export declare class CustomersRepository {
    private readonly customerRepository;
    private readonly addressRepository;
    private readonly foodCategoryRepository;
    private readonly restaurantRepository;
    private readonly dataSource;
    constructor(customerRepository: Repository<Customer>, addressRepository: Repository<AddressBook>, foodCategoryRepository: Repository<FoodCategory>, restaurantRepository: Repository<Restaurant>, dataSource: DataSource);
    save(customer: Customer): Promise<Customer>;
    create(createCustomerDto: CreateCustomerDto): Promise<Customer>;
    findAll(): Promise<Customer[]>;
    findById(customerId: string): Promise<Customer | null>;
    findByIdWithFavoriterRestaurants(customerId: string): Promise<Customer | null>;
    findByUserId(userId: string): Promise<Customer>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer>;
    remove(id: string): Promise<void>;
    findOneBy(conditions: Partial<Customer>): Promise<Customer | null>;
    findAllPaginated(skip: number, limit: number): Promise<[Customer[], number]>;
}
