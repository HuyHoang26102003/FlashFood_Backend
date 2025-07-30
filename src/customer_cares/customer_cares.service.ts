// customer-care.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { CreateCustomerCareDto } from './dto/create-customer_cares.dto';
import { ApiResponse, createResponse } from 'src/utils/createResponse';
import { CustomerCaresRepository } from './customer_cares.repository';
import { CustomerCareInquiriesRepository } from 'src/customer_cares_inquires/customer_cares_inquires.repository';
import { createClient } from 'redis';
import * as dotenv from 'dotenv';
import { RedisService } from 'src/redis/redis.service';
import { DataSource } from 'typeorm';
import { CustomerCareInquiry } from 'src/customer_cares_inquires/entities/customer_care_inquiry.entity';
import { CustomerCare } from './entities/customer_care.entity';

dotenv.config();

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redis.connect().catch(err => logger.error('Redis connection error:', err));

const logger = new Logger('CustomersService');

@Injectable()
export class CustomerCareService {
  constructor(
    private readonly repository: CustomerCaresRepository,
    private readonly inquiryRepository: CustomerCareInquiriesRepository,
    private readonly redisService: RedisService,
    private readonly dataSource: DataSource
  ) {}

  // Create a new customer care record
  async create(createCustomerCareDto: CreateCustomerCareDto): Promise<any> {
    const {
      user_id,
      first_name,
      last_name,
      contact_email,
      contact_phone,

      created_at,
      updated_at,
      avatar,
      last_login
    } = createCustomerCareDto;

    try {
      // Check if the customer care record already exists by user ID
      const existingRecord = await this.repository.findOne({ user_id });
      if (existingRecord) {
        return createResponse(
          'DuplicatedRecord',
          null,
          'Customer care record with this user ID already exists'
        );
      }

      // Create new customer care record
      const newRecord = await this.repository.create({
        user_id,
        first_name,
        last_name,
        contact_email,
        contact_phone,
        created_at,
        updated_at,
        avatar,
        last_login
      });

      await this.repository.create(newRecord);
      return createResponse(
        'OK',
        newRecord,
        'Customer care record created successfully'
      );
    } catch (error: any) {
      console.log('error', error);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while creating the customer care record'
      );
    }
  }

  // Get all customer care records
  async findAll(): Promise<ApiResponse<any>> {
    try {
      const records = await this.repository.findAll();
      return createResponse('OK', records, 'Fetched all customer care records');
    } catch (error: any) {
      console.log('error', error);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while fetching customer care records'
      );
    }
  }

  async findAllInquiriesByCCId(
    id: string,
    forceRefresh = false
  ): Promise<ApiResponse<any>> {
    const cacheKey = `inquiries:customer_care:${id}`;
    const ttl = 300; // Cache 5 minutes (300 seconds)
    const start = Date.now();

    try {
      if (forceRefresh) {
        await this.redisService.del(cacheKey);
        logger.log(`Forced cache refresh for ${cacheKey}`);
      }

      // 1. Check cache
      const cacheStart = Date.now();
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        logger.log(
          `Fetched inquiries from cache in ${Date.now() - cacheStart}ms`
        );
        logger.log(`Total time (cache): ${Date.now() - start}ms`);
        return createResponse(
          'OK',
          JSON.parse(cachedData),
          'Fetched inquiries from cache successfully'
        );
      }
      logger.log(`Cache miss for ${cacheKey}`);

      // 2. Check customer care record
      const customerCareStart = Date.now();
      const customerCare = await this.repository.findById(id);
      if (!customerCare) {
        logger.log(
          `Customer care fetch took ${Date.now() - customerCareStart}ms`
        );
        return createResponse(
          'NotFound',
          null,
          'Customer care record not found'
        );
      }
      logger.log(
        `Customer care fetch took ${Date.now() - customerCareStart}ms`
      );

      // 3. Fetch inquiries
      const inquiriesStart = Date.now();
      const inquiries = await this.dataSource
        .getRepository(CustomerCareInquiry)
        .createQueryBuilder('inquiry')
        .leftJoinAndSelect('inquiry.customer', 'customer')
        .leftJoinAndSelect('inquiry.order', 'order')
        .where(
          'inquiry.assigned_customer_care_id = :id OR inquiry.assigned_customer_care_id IS NULL',
          { id }
        )
        .select([
          'inquiry.id',
          'inquiry.customer_id',
          'inquiry.assignee_type',
          'inquiry.subject',
          'inquiry.description',
          'inquiry.status',
          'inquiry.priority',
          'inquiry.resolution_notes',
          'inquiry.created_at',
          'inquiry.updated_at',
          'inquiry.resolved_at',
          'customer.id',
          'customer.first_name',
          'customer.last_name',
          'customer.avatar',
          'order'
        ])
        .getMany();
      logger.log(`Inquiries fetch took ${Date.now() - inquiriesStart}ms`);

      if (!inquiries || inquiries.length === 0) {
        const response = createResponse(
          'OK',
          [],
          'No inquiries found for this customer care'
        );
        await this.redisService.setNx(cacheKey, JSON.stringify([]), ttl * 1000);
        logger.log(`Stored empty inquiries in cache: ${cacheKey}`);
        return response;
      }

      // 4. Populate inquiries
      const processingStart = Date.now();
      const populatedInquiries = inquiries.map(inquiry => ({
        ...inquiry,
        customer: inquiry.customer
          ? {
              id: inquiry.customer.id,
              first_name: inquiry.customer.first_name,
              last_name: inquiry.customer.last_name,
              avatar: inquiry.customer.avatar
            }
          : null,
        order: inquiry.order ? inquiry.order : null
      }));
      logger.log(`Inquiries processing took ${Date.now() - processingStart}ms`);

      // 5. Save to cache
      const cacheSaveStart = Date.now();
      const cacheSaved = await this.redisService.setNx(
        cacheKey,
        JSON.stringify(populatedInquiries),
        ttl * 1000
      );
      if (cacheSaved) {
        logger.log(
          `Stored inquiries in cache: ${cacheKey} (took ${Date.now() - cacheSaveStart}ms)`
        );
      } else {
        logger.warn(`Failed to store inquiries in cache: ${cacheKey}`);
      }

      logger.log(`Total DB fetch and processing took ${Date.now() - start}ms`);
      return createResponse(
        'OK',
        populatedInquiries,
        'Fetched inquiries successfully'
      );
    } catch (error: any) {
      logger.error(`Error fetching inquiries: ${error.message}`, error.stack);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while fetching inquiries'
      );
    }
  }

  // Get a customer care record by ID
  async findCustomerCareById(id: string): Promise<ApiResponse<any>> {
    try {
      const record = await this.repository.findById(id);
      if (!record) {
        return createResponse(
          'NotFound',
          null,
          'Customer care record not found'
        );
      }
      return createResponse(
        'OK',
        record,
        'Fetched customer care record successfully'
      );
    } catch (error: any) {
      console.log('error', error);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while fetching the customer care record'
      );
    }
  }

  // Get one customer care record by conditions
  async findOne(conditions: object): Promise<any> {
    const record = await this.repository.findOne(conditions);
    if (!record) {
      return createResponse('NotFound', null, 'Customer care record not found');
    }
    try {
      return createResponse(
        'OK',
        record,
        'Fetched customer care record successfully'
      );
    } catch (error: any) {
      console.log('error', error);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while fetching the customer care record'
      );
    }
  }

  // Update a customer care record by ID
  async update(
    id: string,
    updateData: Partial<CustomerCare>
  ): Promise<ApiResponse<any>> {
    try {
      // Check if customer care exists
      const customerCare = await this.repository.findById(id);
      if (!customerCare) {
        return createResponse('NotFound', null, 'Customer care not found');
      }

      // Update the customer care record
      const updatedCustomerCare = await this.repository.update(id, updateData);

      return createResponse(
        'OK',
        updatedCustomerCare,
        'Customer care updated successfully'
      );
    } catch (error: any) {
      logger.error(
        `Error updating customer care: ${error.message}`,
        error.stack
      );
      return createResponse(
        'ServerError',
        null,
        'An error occurred while updating the customer care'
      );
    }
  }

  // Toggle availability (if applicable for customer care)
  async setAvailability(id: string): Promise<any> {
    try {
      const record = await this.repository.findById(id);

      if (!record) {
        return createResponse(
          'NotFound',
          null,
          'Customer care record not found'
        );
      }

      // Toggle the available_for_work flag
      record.available_for_work = !record.available_for_work;

      const savedRecord = await this.repository.update(id, record);
      return createResponse(
        'OK',
        savedRecord,
        'Customer care record updated successfully'
      );
    } catch (error: any) {
      console.log('error', error);
      return createResponse(
        'ServerError',
        null,
        'An error occurred while updating the customer care record'
      );
    }
  }

  // Delete a customer care record by ID
  async remove(id: string): Promise<any> {
    try {
      const deletedRecord = await this.repository.remove(id);

      if (!deletedRecord) {
        return createResponse(
          'NotFound',
          null,
          'Customer care record not found'
        );
      }

      return createResponse(
        'OK',
        null,
        'Customer care record deleted successfully'
      );
    } catch (error: any) {
      console.log('error', error);

      return createResponse(
        'ServerError',
        null,
        'An error occurred while deleting the customer care record'
      );
    }
  }

  // Update the avatar for a customer care record
  async updateEntityAvatar(
    uploadResult: { url: string; public_id: string },
    entityId: string
  ) {
    const record = await this.repository.update(entityId, {
      avatar: { url: uploadResult.url, key: uploadResult.public_id }
    });

    if (!record) {
      return createResponse('NotFound', null, 'Customer care record not found');
    }

    return createResponse(
      'OK',
      record,
      'Customer care avatar updated successfully'
    );
  }

  async resetInquiriesCache(): Promise<ApiResponse<any>> {
    try {
      await this.redisService.deleteByPattern('inquiries:customer_care:*');
      return createResponse('OK', null, 'Inquiries cache reset successfully');
    } catch (error: any) {
      logger.error(
        `Error resetting inquiries cache: ${error.message}`,
        error.stack
      );
      return createResponse(
        'ServerError',
        null,
        'An error occurred while resetting inquiries cache'
      );
    }
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10
  ): Promise<
    ApiResponse<{
      totalPages: number;
      currentPage: number;
      totalItems: number;
      items: CustomerCare[];
    }>
  > {
    try {
      const skip = (page - 1) * limit;
      const [customerCares, total] = await this.repository.findAllPaginated(
        skip,
        limit
      );
      const totalPages = Math.ceil(total / limit);

      return createResponse(
        'OK',
        {
          totalPages,
          currentPage: page,
          totalItems: total,
          items: customerCares
        },
        'Fetched paginated customer cares'
      );
    } catch (error: any) {
      console.error('Error fetching paginated customer cares:', error);
      return createResponse(
        'ServerError',
        null,
        'Error fetching paginated customer cares'
      );
    }
  }
}
