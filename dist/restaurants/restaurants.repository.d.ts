import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { FoodCategory } from '../food_categories/entities/food_category.entity';
import { UserRepository } from 'src/users/users.repository';
import { AddressBookRepository } from 'src/address_book/address_book.repository';
export declare class RestaurantsRepository {
    repository: Repository<Restaurant>;
    private foodCategoryRepository;
    private userRepository;
    private addressRepository;
    constructor(repository: Repository<Restaurant>, foodCategoryRepository: Repository<FoodCategory>, userRepository: UserRepository, addressRepository: AddressBookRepository);
    findOne(conditions: any): Promise<Restaurant>;
    create(createDto: CreateRestaurantDto & {
        specialize_in?: FoodCategory[];
    }): Promise<any>;
    findAll(): Promise<Restaurant[]>;
    findById(id: string): Promise<Restaurant>;
    findByOwnerId(ownerId: string): Promise<Restaurant>;
    update(id: string, updateDto: UpdateRestaurantDto & {
        specialize_in?: FoodCategory[];
    }): Promise<Restaurant>;
    delete(id: string): Promise<boolean>;
    findByCondition(condition: any): Promise<Restaurant>;
    updateImgGallery(id: string, imagesGallery: Array<{
        key: string;
        url: string;
    }>): Promise<Restaurant>;
    incrementTotalOrders(restaurantId: string): Promise<void>;
    findAllPaginated(skip: number, limit: number): Promise<[Restaurant[], number]>;
}
