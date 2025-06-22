import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AdminChartRecord } from './entities/admin_chart_record.entity';
import { Order, OrderStatus } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RatingsReview } from 'src/ratings_reviews/entities/ratings_review.entity';
import { createResponse, ApiResponse } from 'src/utils/createResponse';
import { PeriodType } from './dto/admin_chart_query.dto';
import * as Redis from 'redis';

@Injectable()
export class AdminChartService {
  private readonly redisClient: Redis.RedisClientType;

  constructor(
    @InjectRepository(AdminChartRecord)
    private adminChartRepo: Repository<AdminChartRecord>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Promotion)
    private promotionRepo: Repository<Promotion>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(Driver)
    private driverRepo: Repository<Driver>,
    @InjectRepository(Restaurant)
    private restaurantRepo: Repository<Restaurant>,
    @InjectRepository(RatingsReview)
    private ratingsReviewRepo: Repository<RatingsReview>
  ) {
    // Initialize Redis client
    this.redisClient = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.redisClient.connect().catch(err => {
      console.error('Redis connection error:', err);
    });
  }

  // Add a helper method for caching
  private async getCachedData(key: string): Promise<any | null> {
    try {
      const cached = await this.redisClient.get(key);
      if (cached) {
        console.log(
          `[CACHE HIT] Using cached admin chart data for key: ${key}`
        );
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error(`Error getting cached admin chart data: ${error}`);
      return null;
    }
  }

  // Add a helper method for storing cache
  private async setCachedData(
    key: string,
    data: any,
    ttlSeconds: number = 3600
  ): Promise<void> {
    try {
      await this.redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
      console.log(
        `[CACHE STORE] Stored admin chart data in cache with key: ${key}`
      );
    } catch (error) {
      console.error(`Error storing cached admin chart data: ${error}`);
    }
  }

  async getChartData(
    startDate: number,
    endDate: number,
    periodType: PeriodType = PeriodType.DAILY,
    forceRefresh: boolean = false
  ): Promise<ApiResponse<any>> {
    try {
      // Generate cache key
      const cacheKey = `admin_chart:${startDate}:${endDate}:${periodType}`;

      // Try to get from cache first (unless force refresh is true)
      if (!forceRefresh) {
        const cachedData = await this.getCachedData(cacheKey);
        if (cachedData) {
          return createResponse(
            'OK',
            cachedData,
            'Admin chart data retrieved successfully (cached)'
          );
        }
      }

      // If force refresh or not in cache, generate data
      if (forceRefresh) {
        // Generate new chart data
        await this.generateChartData(startDate, endDate, periodType);
      }

      // Fetch the chart data
      let chartData = await this.adminChartRepo.findOne({
        where: {
          period_start: startDate,
          period_end: endDate,
          period_type: periodType
        }
      });

      // If no data found, generate it
      if (!chartData) {
        await this.generateChartData(startDate, endDate, periodType);

        // Try fetching again
        chartData = await this.adminChartRepo.findOne({
          where: {
            period_start: startDate,
            period_end: endDate,
            period_type: periodType
          }
        });

        // If still no data, return empty response
        if (!chartData) {
          return createResponse(
            'NotFound',
            null,
            'No chart data available for the requested period'
          );
        }
      }

      // Cache the result
      await this.setCachedData(cacheKey, chartData);

      return createResponse(
        'OK',
        chartData,
        'Admin chart data retrieved successfully'
      );
    } catch (error) {
      console.error('Error retrieving admin chart data:', error);
      return createResponse(
        'ServerError',
        null,
        'Error retrieving admin chart data'
      );
    }
  }

  async generateChartData(
    startDate: number,
    endDate: number,
    periodType: PeriodType = PeriodType.DAILY
  ): Promise<void> {
    try {
      console.log(
        `Generating admin chart data for period ${startDate} - ${endDate}`
      );

      // Delete existing chart data for this period if any
      await this.adminChartRepo.delete({
        period_start: startDate,
        period_end: endDate,
        period_type: periodType
      });

      // Calculate all required metrics
      const [
        totalUsers,
        soldPromotions,
        netIncome,
        grossIncome,
        orderStats,
        userGrowthRate,
        grossFromPromotion,
        avgCustomerSatisfaction,
        avgDeliveryTime,
        orderCancellationRate,
        orderVolume,
        churnRate
      ] = await Promise.all([
        this.calculateTotalUsers(startDate, endDate),
        this.calculateSoldPromotions(startDate, endDate),
        this.calculateNetIncome(startDate, endDate),
        this.calculateGrossIncome(startDate, endDate),
        this.calculateOrderStats(startDate, endDate),
        this.calculateUserGrowthRate(startDate, endDate),
        this.calculateGrossFromPromotion(startDate, endDate),
        this.calculateAvgCustomerSatisfaction(startDate, endDate),
        this.calculateAvgDeliveryTime(startDate, endDate),
        this.calculateOrderCancellationRate(startDate, endDate),
        this.calculateOrderVolume(startDate, endDate),
        this.calculateChurnRate(startDate, endDate)
      ]);

      // Create new chart record
      const chartData = this.adminChartRepo.create({
        period_type: periodType,
        period_start: startDate,
        period_end: endDate,
        total_users: totalUsers,
        sold_promotions: soldPromotions,
        net_income: netIncome,
        gross_income: grossIncome,
        order_stats: orderStats,
        user_growth_rate: userGrowthRate,
        gross_from_promotion: grossFromPromotion,
        average_customer_satisfaction: avgCustomerSatisfaction,
        average_delivery_time: avgDeliveryTime,
        order_cancellation_rate: orderCancellationRate,
        order_volume: orderVolume,
        churn_rate: churnRate
      });

      // Save chart data
      await this.adminChartRepo.save(chartData);
      console.log(
        `Admin chart data generated successfully for period ${startDate} - ${endDate}`
      );
    } catch (error) {
      console.error('Error generating admin chart data:', error);
      throw new Error('Failed to generate admin chart data');
    }
  }

  // Helper methods to calculate each metric
  private async calculateTotalUsers(
    startDate: number,
    endDate: number
  ): Promise<number> {
    try {
      const totalUsers = await this.userRepo.count({
        where: {
          created_at: Between(new Date(0), new Date(endDate * 1000)) // All users created before end date
        }
      });
      return totalUsers;
    } catch (error) {
      console.error('Error calculating total users:', error);
      return 0;
    }
  }

  private async calculateSoldPromotions(
    startDate: number,
    endDate: number
  ): Promise<number> {
    try {
      const soldPromotions = await this.promotionRepo.count({
        where: {
          created_at: Between(
            new Date(startDate * 1000),
            new Date(endDate * 1000)
          )
        }
      });
      return soldPromotions;
    } catch (error) {
      console.error('Error calculating sold promotions:', error);
      return 0;
    }
  }

  private async calculateNetIncome(
    startDate: number,
    endDate: number
  ): Promise<any[]> {
    try {
      // Group orders by date and calculate daily net income (revenue - costs)
      const result = await this.orderRepo
        .createQueryBuilder('order')
        .select([
          "TO_CHAR(TO_TIMESTAMP(order.created_at), 'YYYY-MM-DD') as date",
          'SUM(order.total_amount - order.delivery_fee - order.service_fee) as total_amount'
        ])
        .where('order.status = :status', { status: OrderStatus.DELIVERED })
        .andWhere('order.created_at BETWEEN :startDate AND :endDate', {
          startDate,
          endDate
        })
        .groupBy("TO_CHAR(TO_TIMESTAMP(order.created_at), 'YYYY-MM-DD')")
        .orderBy("TO_CHAR(TO_TIMESTAMP(order.created_at), 'YYYY-MM-DD')")
        .limit(90) // Limit to 90 days for performance
        .getRawMany();

      return result.map(item => ({
        date: item.date,
        total_amount: parseFloat(item.total_amount) || 0
      }));
    } catch (error) {
      console.error('Error calculating net income:', error);
      return [];
    }
  }

  private async calculateGrossIncome(
    startDate: number,
    endDate: number
  ): Promise<any[]> {
    try {
      // Group orders by date and calculate daily gross income (total revenue)
      const result = await this.orderRepo
        .createQueryBuilder('order')
        .select([
          "TO_CHAR(TO_TIMESTAMP(order.created_at), 'YYYY-MM-DD') as date",
          'SUM(order.total_amount) as total_amount'
        ])
        .where('order.status = :status', { status: OrderStatus.DELIVERED })
        .andWhere('order.created_at BETWEEN :startDate AND :endDate', {
          startDate,
          endDate
        })
        .groupBy("TO_CHAR(TO_TIMESTAMP(order.created_at), 'YYYY-MM-DD')")
        .orderBy("TO_CHAR(TO_TIMESTAMP(order.created_at), 'YYYY-MM-DD')")
        .limit(90) // Limit to 90 days for performance
        .getRawMany();

      return result.map(item => ({
        date: item.date,
        total_amount: parseFloat(item.total_amount) || 0
      }));
    } catch (error) {
      console.error('Error calculating gross income:', error);
      return [];
    }
  }

  private async calculateOrderStats(
    startDate: number,
    endDate: number
  ): Promise<any[]> {
    try {
      // Group orders by date and status
      const completedOrders = await this.orderRepo
        .createQueryBuilder('order')
        .select([
          "TO_CHAR(TO_TIMESTAMP(order.created_at), 'YYYY-MM-DD') as date",
          'COUNT(*) as count'
        ])
        .where('order.status = :status', { status: OrderStatus.DELIVERED })
        .andWhere('order.created_at BETWEEN :startDate AND :endDate', {
          startDate,
          endDate
        })
        .groupBy("TO_CHAR(TO_TIMESTAMP(order.created_at), 'YYYY-MM-DD')")
        .orderBy("TO_CHAR(TO_TIMESTAMP(order.created_at), 'YYYY-MM-DD')")
        .limit(90)
        .getRawMany();

      const cancelledOrders = await this.orderRepo
        .createQueryBuilder('order')
        .select([
          "TO_CHAR(TO_TIMESTAMP(order.created_at), 'YYYY-MM-DD') as date",
          'COUNT(*) as count'
        ])
        .where('order.status = :status', { status: OrderStatus.CANCELLED })
        .andWhere('order.created_at BETWEEN :startDate AND :endDate', {
          startDate,
          endDate
        })
        .groupBy("TO_CHAR(TO_TIMESTAMP(order.created_at), 'YYYY-MM-DD')")
        .orderBy("TO_CHAR(TO_TIMESTAMP(order.created_at), 'YYYY-MM-DD')")
        .limit(90)
        .getRawMany();

      // Combine the results
      const dateSet = new Set([
        ...completedOrders.map(o => o.date),
        ...cancelledOrders.map(o => o.date)
      ]);

      return Array.from(dateSet)
        .map(date => {
          const completed =
            completedOrders.find(o => o.date === date)?.count || 0;
          const cancelled =
            cancelledOrders.find(o => o.date === date)?.count || 0;

          return {
            date,
            completed: parseInt(completed),
            cancelled: parseInt(cancelled)
          };
        })
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error calculating order stats:', error);
      return [];
    }
  }

  private async calculateUserGrowthRate(
    startDate: number,
    endDate: number
  ): Promise<any[]> {
    try {
      // Calculate new users by type for each day
      const driverGrowth = await this.driverRepo
        .createQueryBuilder('driver')
        .select([
          "TO_CHAR(TO_TIMESTAMP(driver.created_at), 'YYYY-MM-DD') as date",
          'COUNT(*) as count'
        ])
        .where('driver.created_at BETWEEN :startDate AND :endDate', {
          startDate,
          endDate
        })
        .groupBy("TO_CHAR(TO_TIMESTAMP(driver.created_at), 'YYYY-MM-DD')")
        .orderBy("TO_CHAR(TO_TIMESTAMP(driver.created_at), 'YYYY-MM-DD')")
        .getRawMany();

      const restaurantGrowth = await this.restaurantRepo
        .createQueryBuilder('restaurant')
        .select([
          "TO_CHAR(TO_TIMESTAMP(restaurant.created_at), 'YYYY-MM-DD') as date",
          'COUNT(*) as count'
        ])
        .where('restaurant.created_at BETWEEN :startDate AND :endDate', {
          startDate,
          endDate
        })
        .groupBy("TO_CHAR(TO_TIMESTAMP(restaurant.created_at), 'YYYY-MM-DD')")
        .orderBy("TO_CHAR(TO_TIMESTAMP(restaurant.created_at), 'YYYY-MM-DD')")
        .getRawMany();

      const customerGrowth = await this.customerRepo
        .createQueryBuilder('customer')
        .select([
          "TO_CHAR(TO_TIMESTAMP(customer.created_at), 'YYYY-MM-DD') as date",
          'COUNT(*) as count'
        ])
        .where('customer.created_at BETWEEN :startDate AND :endDate', {
          startDate,
          endDate
        })
        .groupBy("TO_CHAR(TO_TIMESTAMP(customer.created_at), 'YYYY-MM-DD')")
        .orderBy("TO_CHAR(TO_TIMESTAMP(customer.created_at), 'YYYY-MM-DD')")
        .getRawMany();

      // Get unique dates
      const dateSet = new Set([
        ...driverGrowth.map(d => d.date),
        ...restaurantGrowth.map(r => r.date),
        ...customerGrowth.map(c => c.date)
      ]);

      return Array.from(dateSet)
        .map(date => {
          return {
            date,
            driver: parseInt(
              driverGrowth.find(d => d.date === date)?.count || 0
            ),
            restaurant: parseInt(
              restaurantGrowth.find(r => r.date === date)?.count || 0
            ),
            customer: parseInt(
              customerGrowth.find(c => c.date === date)?.count || 0
            ),
            customer_care: 0 // Placeholder since customer_care is not in your schema
          };
        })
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error calculating user growth rate:', error);
      return [];
    }
  }

  private async calculateGrossFromPromotion(
    startDate: number,
    endDate: number
  ): Promise<number> {
    try {
      const result = await this.promotionRepo
        .createQueryBuilder('promotion')
        .select('SUM(promotion.value)', 'total')
        .where('promotion.created_at BETWEEN :startDate AND :endDate', {
          startDate,
          endDate
        })
        .getRawOne();

      return parseFloat(result?.total || '0');
    } catch (error) {
      console.error('Error calculating gross from promotions:', error);
      return 0;
    }
  }

  private async calculateAvgCustomerSatisfaction(
    startDate: number,
    endDate: number
  ): Promise<number> {
    try {
      const result = await this.ratingsReviewRepo
        .createQueryBuilder('review')
        .select('AVG(review.overall_rating)', 'average')
        .where('review.created_at BETWEEN :startDate AND :endDate', {
          startDate,
          endDate
        })
        .getRawOne();

      return parseFloat(result?.average || '0');
    } catch (error) {
      console.error('Error calculating average customer satisfaction:', error);
      return 0;
    }
  }

  private async calculateAvgDeliveryTime(
    startDate: number,
    endDate: number
  ): Promise<number> {
    try {
      const result = await this.orderRepo
        .createQueryBuilder('order')
        .select('AVG(order.delivery_time - order.order_time)', 'average')
        .where('order.status = :status', { status: OrderStatus.DELIVERED })
        .andWhere('order.created_at BETWEEN :startDate AND :endDate', {
          startDate,
          endDate
        })
        .getRawOne();

      return Math.round(parseFloat(result?.average || '0'));
    } catch (error) {
      console.error('Error calculating average delivery time:', error);
      return 0;
    }
  }

  private async calculateOrderCancellationRate(
    startDate: number,
    endDate: number
  ): Promise<number> {
    try {
      const [totalOrders, cancelledOrders] = await Promise.all([
        this.orderRepo.count({
          where: {
            created_at: Between(startDate, endDate)
          }
        }),
        this.orderRepo.count({
          where: {
            created_at: Between(startDate, endDate),
            status: OrderStatus.CANCELLED
          }
        })
      ]);

      return totalOrders > 0
        ? parseFloat((cancelledOrders / totalOrders).toFixed(2))
        : 0;
    } catch (error) {
      console.error('Error calculating order cancellation rate:', error);
      return 0;
    }
  }

  private async calculateOrderVolume(
    startDate: number,
    endDate: number
  ): Promise<number> {
    try {
      return await this.orderRepo.count({
        where: {
          created_at: Between(startDate, endDate)
        }
      });
    } catch (error) {
      console.error('Error calculating order volume:', error);
      return 0;
    }
  }

  private async calculateChurnRate(
    startDate: number,
    endDate: number
  ): Promise<number> {
    try {
      // Simplified churn rate calculation: (customers who didn't place orders in period) / (total customers)
      // This requires customer order history which may not be directly accessible
      // As a placeholder, returning a fixed value of 0.1 (10%)
      return 0.1;
    } catch (error) {
      console.error('Error calculating churn rate:', error);
      return 0;
    }
  }
}
