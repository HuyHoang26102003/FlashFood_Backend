import { Injectable, Logger } from '@nestjs/common';
import { CreateRatingsReviewDto } from './dto/create-ratings_review.dto';
import { UpdateRatingsReviewDto } from './dto/update-ratings_review.dto';
import { RatingsReviewsRepository } from './ratings_reviews.repository';
import { createResponse } from 'src/utils/createResponse';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RedisService } from 'src/redis/redis.service';

const logger = new Logger('RatingsReviewsService');

@Injectable()
export class RatingsReviewsService {
  constructor(
    private readonly ratingsReviewsRepository: RatingsReviewsRepository,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly redisService: RedisService
  ) {}

  /**
   * Cache invalidation helper method
   */
  private async invalidateRestaurantRatingsCache(
    restaurantId: string
  ): Promise<void> {
    try {
      const cacheKeys = [
        `restaurant:ratings:${restaurantId}`,
        `restaurant:details:${restaurantId}`
      ];
      await Promise.all(cacheKeys.map(key => this.redisService.del(key)));
      logger.log(`Invalidated ratings cache for restaurant: ${restaurantId}`);
    } catch (error) {
      logger.warn(
        `Failed to invalidate ratings cache for restaurant ${restaurantId}:`,
        error
      );
    }
  }

  async create(createRatingsReviewDto: CreateRatingsReviewDto) {
    try {
      // Validate Order
      const order = await this.orderRepository.findOne({
        where: { id: createRatingsReviewDto.order_id }
      });
      if (!order) {
        return createResponse('NotFound', null, 'Order not found');
      }

      // Validate Reviewer
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
          return createResponse(
            'InvalidFormatInput',
            null,
            'Invalid reviewer_type'
          );
      }
      if (!reviewerExists) {
        return createResponse('NotFound', null, 'Reviewer not found');
      }

      // Validate Recipient
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
          return createResponse(
            'InvalidFormatInput',
            null,
            'Invalid recipient_type'
          );
      }
      if (!recipientExists) {
        return createResponse('NotFound', null, 'Recipient not found');
      }

      // Tạo review
      const newReview = await this.ratingsReviewsRepository.create(
        createRatingsReviewDto
      );

      // Invalidate restaurant ratings cache if this is a restaurant review
      if (
        createRatingsReviewDto.recipient_type === 'restaurant' &&
        createRatingsReviewDto.rr_recipient_restaurant_id
      ) {
        await this.invalidateRestaurantRatingsCache(
          createRatingsReviewDto.rr_recipient_restaurant_id
        );
      }

      return createResponse('OK', newReview, 'Review created successfully');
    } catch (error: any) {
      console.error('Error creating review:', error);
      return createResponse('ServerError', null, 'Failed to create review');
    }
  }

  async findAll() {
    try {
      const reviews = await this.ratingsReviewsRepository.findAll();
      return createResponse('OK', reviews, 'Reviews fetched successfully');
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      return createResponse('ServerError', null, 'Failed to fetch reviews');
    }
  }

  async findOne(id: string) {
    try {
      const review = await this.ratingsReviewsRepository.findById(id);
      if (!review) {
        return createResponse('NotFound', null, 'Review not found');
      }
      return createResponse('OK', review, 'Review fetched successfully');
    } catch (error: any) {
      console.error('Error fetching review:', error);
      return createResponse('ServerError', null, 'Failed to fetch review');
    }
  }

  async update(id: string, updateRatingsReviewDto: UpdateRatingsReviewDto) {
    try {
      // Lấy review hiện tại
      const existingReview = await this.ratingsReviewsRepository.findById(id);
      if (!existingReview) {
        return createResponse('NotFound', null, 'Review not found');
      }

      // Validate Order nếu có thay đổi
      if (updateRatingsReviewDto.order_id) {
        const order = await this.orderRepository.findOne({
          where: { id: updateRatingsReviewDto.order_id }
        });
        if (!order) {
          return createResponse('NotFound', null, 'Order not found');
        }
      }

      // Validate Reviewer nếu có thay đổi
      if (
        updateRatingsReviewDto.reviewer_type &&
        (updateRatingsReviewDto.rr_reviewer_driver_id ||
          updateRatingsReviewDto.rr_reviewer_customer_id ||
          updateRatingsReviewDto.rr_reviewer_restaurant_id)
      ) {
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
            return createResponse(
              'InvalidFormatInput',
              null,
              'Invalid reviewer_type'
            );
        }
        if (!reviewerExists) {
          return createResponse('NotFound', null, 'Reviewer not found');
        }
      }

      // Validate Recipient nếu có thay đổi
      if (
        updateRatingsReviewDto.recipient_type &&
        (updateRatingsReviewDto.rr_recipient_driver_id ||
          updateRatingsReviewDto.rr_recipient_customer_id ||
          updateRatingsReviewDto.rr_recipient_restaurant_id)
      ) {
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
            return createResponse(
              'InvalidFormatInput',
              null,
              'Invalid recipient_type'
            );
        }
        if (!recipientExists) {
          return createResponse('NotFound', null, 'Recipient not found');
        }
      }

      // Xử lý images (gộp hoặc thay thế tùy logic)
      if (updateRatingsReviewDto.images) {
        updateRatingsReviewDto.images = updateRatingsReviewDto.images.length
          ? [...(existingReview.images || []), ...updateRatingsReviewDto.images] // Gộp nếu muốn giữ ảnh cũ
          : updateRatingsReviewDto.images; // Thay thế nếu gửi mảng rỗng hoặc mới
      }

      // Cập nhật thời gian nếu không có trong DTO
      updateRatingsReviewDto.updated_at =
        updateRatingsReviewDto.updated_at || Math.floor(Date.now() / 1000);

      // Cập nhật review
      const updatedReview = await this.ratingsReviewsRepository.update(
        id,
        updateRatingsReviewDto
      );

      // Invalidate restaurant ratings cache if this affects a restaurant
      const recipientRestaurantId =
        updateRatingsReviewDto.rr_recipient_restaurant_id ||
        existingReview.rr_recipient_restaurant_id;
      if (
        (updateRatingsReviewDto.recipient_type === 'restaurant' ||
          existingReview.recipient_type === 'restaurant') &&
        recipientRestaurantId
      ) {
        await this.invalidateRestaurantRatingsCache(recipientRestaurantId);
      }

      return createResponse('OK', updatedReview, 'Review updated successfully');
    } catch (error: any) {
      console.error('Error updating review:', error);
      return createResponse('ServerError', null, 'Failed to update review');
    }
  }

  async remove(id: string) {
    try {
      const result = await this.ratingsReviewsRepository.remove(id);
      if (!result) {
        return createResponse('NotFound', null, 'Review not found');
      }
      return createResponse('OK', null, 'Review deleted successfully');
    } catch (error: any) {
      console.error('Error deleting review:', error);
      return createResponse('ServerError', null, 'Failed to delete review');
    }
  }
}
