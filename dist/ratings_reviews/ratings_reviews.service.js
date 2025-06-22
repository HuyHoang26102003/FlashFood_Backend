"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingsReviewsService = void 0;
const common_1 = require("@nestjs/common");
const ratings_reviews_repository_1 = require("./ratings_reviews.repository");
const createResponse_1 = require("../utils/createResponse");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../orders/entities/order.entity");
const driver_entity_1 = require("../drivers/entities/driver.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
let RatingsReviewsService = class RatingsReviewsService {
    constructor(ratingsReviewsRepository, orderRepository, driverRepository, customerRepository, restaurantRepository) {
        this.ratingsReviewsRepository = ratingsReviewsRepository;
        this.orderRepository = orderRepository;
        this.driverRepository = driverRepository;
        this.customerRepository = customerRepository;
        this.restaurantRepository = restaurantRepository;
    }
    async create(createRatingsReviewDto) {
        try {
            const order = await this.orderRepository.findOne({
                where: { id: createRatingsReviewDto.order_id }
            });
            if (!order) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Order not found');
            }
            let reviewerExists = false;
            switch (createRatingsReviewDto.reviewer_type) {
                case 'driver':
                    reviewerExists = !!(await this.driverRepository.findOne({
                        where: { id: createRatingsReviewDto.rr_reviewer_driver_id }
                    }));
                    break;
                case 'customer':
                    reviewerExists = !!(await this.customerRepository.findOne({
                        where: { id: createRatingsReviewDto.rr_reviewer_customer_id }
                    }));
                    break;
                case 'restaurant':
                    reviewerExists = !!(await this.restaurantRepository.findOne({
                        where: { id: createRatingsReviewDto.rr_reviewer_restaurant_id }
                    }));
                    break;
                default:
                    return (0, createResponse_1.createResponse)('InvalidFormatInput', null, 'Invalid reviewer_type');
            }
            if (!reviewerExists) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Reviewer not found');
            }
            let recipientExists = false;
            switch (createRatingsReviewDto.recipient_type) {
                case 'driver':
                    recipientExists = !!(await this.driverRepository.findOne({
                        where: { id: createRatingsReviewDto.rr_recipient_driver_id }
                    }));
                    break;
                case 'customer':
                    recipientExists = !!(await this.customerRepository.findOne({
                        where: { id: createRatingsReviewDto.rr_recipient_customer_id }
                    }));
                    break;
                case 'restaurant':
                    recipientExists = !!(await this.restaurantRepository.findOne({
                        where: { id: createRatingsReviewDto.rr_recipient_restaurant_id }
                    }));
                    break;
                default:
                    return (0, createResponse_1.createResponse)('InvalidFormatInput', null, 'Invalid recipient_type');
            }
            if (!recipientExists) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Recipient not found');
            }
            const newReview = await this.ratingsReviewsRepository.create(createRatingsReviewDto);
            return (0, createResponse_1.createResponse)('OK', newReview, 'Review created successfully');
        }
        catch (error) {
            console.error('Error creating review:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to create review');
        }
    }
    async findAll() {
        try {
            const reviews = await this.ratingsReviewsRepository.findAll();
            return (0, createResponse_1.createResponse)('OK', reviews, 'Reviews fetched successfully');
        }
        catch (error) {
            console.error('Error fetching reviews:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to fetch reviews');
        }
    }
    async findOne(id) {
        try {
            const review = await this.ratingsReviewsRepository.findById(id);
            if (!review) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Review not found');
            }
            return (0, createResponse_1.createResponse)('OK', review, 'Review fetched successfully');
        }
        catch (error) {
            console.error('Error fetching review:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to fetch review');
        }
    }
    async update(id, updateRatingsReviewDto) {
        try {
            const existingReview = await this.ratingsReviewsRepository.findById(id);
            if (!existingReview) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Review not found');
            }
            if (updateRatingsReviewDto.order_id) {
                const order = await this.orderRepository.findOne({
                    where: { id: updateRatingsReviewDto.order_id }
                });
                if (!order) {
                    return (0, createResponse_1.createResponse)('NotFound', null, 'Order not found');
                }
            }
            if (updateRatingsReviewDto.reviewer_type &&
                (updateRatingsReviewDto.rr_reviewer_driver_id ||
                    updateRatingsReviewDto.rr_reviewer_customer_id ||
                    updateRatingsReviewDto.rr_reviewer_restaurant_id)) {
                let reviewerExists = false;
                switch (updateRatingsReviewDto.reviewer_type) {
                    case 'driver':
                        reviewerExists = !!(await this.driverRepository.findOne({
                            where: { id: updateRatingsReviewDto.rr_reviewer_driver_id }
                        }));
                        break;
                    case 'customer':
                        reviewerExists = !!(await this.customerRepository.findOne({
                            where: { id: updateRatingsReviewDto.rr_reviewer_customer_id }
                        }));
                        break;
                    case 'restaurant':
                        reviewerExists = !!(await this.restaurantRepository.findOne({
                            where: { id: updateRatingsReviewDto.rr_reviewer_restaurant_id }
                        }));
                        break;
                    default:
                        return (0, createResponse_1.createResponse)('InvalidFormatInput', null, 'Invalid reviewer_type');
                }
                if (!reviewerExists) {
                    return (0, createResponse_1.createResponse)('NotFound', null, 'Reviewer not found');
                }
            }
            if (updateRatingsReviewDto.recipient_type &&
                (updateRatingsReviewDto.rr_recipient_driver_id ||
                    updateRatingsReviewDto.rr_recipient_customer_id ||
                    updateRatingsReviewDto.rr_recipient_restaurant_id)) {
                let recipientExists = false;
                switch (updateRatingsReviewDto.recipient_type) {
                    case 'driver':
                        recipientExists = !!(await this.driverRepository.findOne({
                            where: { id: updateRatingsReviewDto.rr_recipient_driver_id }
                        }));
                        break;
                    case 'customer':
                        recipientExists = !!(await this.customerRepository.findOne({
                            where: { id: updateRatingsReviewDto.rr_recipient_customer_id }
                        }));
                        break;
                    case 'restaurant':
                        recipientExists = !!(await this.restaurantRepository.findOne({
                            where: { id: updateRatingsReviewDto.rr_recipient_restaurant_id }
                        }));
                        break;
                    default:
                        return (0, createResponse_1.createResponse)('InvalidFormatInput', null, 'Invalid recipient_type');
                }
                if (!recipientExists) {
                    return (0, createResponse_1.createResponse)('NotFound', null, 'Recipient not found');
                }
            }
            if (updateRatingsReviewDto.images) {
                updateRatingsReviewDto.images = updateRatingsReviewDto.images.length
                    ? [...(existingReview.images || []), ...updateRatingsReviewDto.images]
                    : updateRatingsReviewDto.images;
            }
            updateRatingsReviewDto.updated_at =
                updateRatingsReviewDto.updated_at || Math.floor(Date.now() / 1000);
            const updatedReview = await this.ratingsReviewsRepository.update(id, updateRatingsReviewDto);
            return (0, createResponse_1.createResponse)('OK', updatedReview, 'Review updated successfully');
        }
        catch (error) {
            console.error('Error updating review:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to update review');
        }
    }
    async remove(id) {
        try {
            const result = await this.ratingsReviewsRepository.remove(id);
            if (!result) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Review not found');
            }
            return (0, createResponse_1.createResponse)('OK', null, 'Review deleted successfully');
        }
        catch (error) {
            console.error('Error deleting review:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to delete review');
        }
    }
};
exports.RatingsReviewsService = RatingsReviewsService;
exports.RatingsReviewsService = RatingsReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(driver_entity_1.Driver)),
    __param(3, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(4, (0, typeorm_1.InjectRepository)(restaurant_entity_1.Restaurant)),
    __metadata("design:paramtypes", [ratings_reviews_repository_1.RatingsReviewsRepository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RatingsReviewsService);
//# sourceMappingURL=ratings_reviews.service.js.map