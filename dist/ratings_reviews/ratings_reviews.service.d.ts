import { CreateRatingsReviewDto } from './dto/create-ratings_review.dto';
import { UpdateRatingsReviewDto } from './dto/update-ratings_review.dto';
import { RatingsReviewsRepository } from './ratings_reviews.repository';
import { Repository } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
export declare class RatingsReviewsService {
    private readonly ratingsReviewsRepository;
    private readonly orderRepository;
    private readonly driverRepository;
    private readonly customerRepository;
    private readonly restaurantRepository;
    constructor(ratingsReviewsRepository: RatingsReviewsRepository, orderRepository: Repository<Order>, driverRepository: Repository<Driver>, customerRepository: Repository<Customer>, restaurantRepository: Repository<Restaurant>);
    create(createRatingsReviewDto: CreateRatingsReviewDto): Promise<import("src/utils/createResponse").ApiResponse<any>>;
    findAll(): Promise<import("src/utils/createResponse").ApiResponse<any>>;
    findOne(id: string): Promise<import("src/utils/createResponse").ApiResponse<any>>;
    update(id: string, updateRatingsReviewDto: UpdateRatingsReviewDto): Promise<import("src/utils/createResponse").ApiResponse<any>>;
    remove(id: string): Promise<import("src/utils/createResponse").ApiResponse<any>>;
}
