"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerCareService = void 0;
const common_1 = require("@nestjs/common");
const createResponse_1 = require("../utils/createResponse");
const customer_cares_repository_1 = require("./customer_cares.repository");
const customer_cares_inquires_repository_1 = require("../customer_cares_inquires/customer_cares_inquires.repository");
const redis_1 = require("redis");
const dotenv = __importStar(require("dotenv"));
const redis_service_1 = require("../redis/redis.service");
const typeorm_1 = require("typeorm");
const customer_care_inquiry_entity_1 = require("../customer_cares_inquires/entities/customer_care_inquiry.entity");
dotenv.config();
const redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redis.connect().catch(err => logger.error('Redis connection error:', err));
const logger = new common_1.Logger('CustomersService');
let CustomerCareService = class CustomerCareService {
    constructor(repository, inquiryRepository, redisService, dataSource) {
        this.repository = repository;
        this.inquiryRepository = inquiryRepository;
        this.redisService = redisService;
        this.dataSource = dataSource;
    }
    async create(createCustomerCareDto) {
        const { user_id, first_name, last_name, contact_email, contact_phone, created_at, updated_at, avatar, last_login } = createCustomerCareDto;
        try {
            const existingRecord = await this.repository.findOne({ user_id });
            if (existingRecord) {
                return (0, createResponse_1.createResponse)('DuplicatedRecord', null, 'Customer care record with this user ID already exists');
            }
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
            return (0, createResponse_1.createResponse)('OK', newRecord, 'Customer care record created successfully');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while creating the customer care record');
        }
    }
    async findAll() {
        try {
            const records = await this.repository.findAll();
            return (0, createResponse_1.createResponse)('OK', records, 'Fetched all customer care records');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while fetching customer care records');
        }
    }
    async findAllInquiriesByCCId(id, forceRefresh = false) {
        const cacheKey = `inquiries:customer_care:${id}`;
        const ttl = 300;
        const start = Date.now();
        try {
            if (forceRefresh) {
                await this.redisService.del(cacheKey);
                logger.log(`Forced cache refresh for ${cacheKey}`);
            }
            const cacheStart = Date.now();
            const cachedData = await this.redisService.get(cacheKey);
            if (cachedData) {
                logger.log(`Fetched inquiries from cache in ${Date.now() - cacheStart}ms`);
                logger.log(`Total time (cache): ${Date.now() - start}ms`);
                return (0, createResponse_1.createResponse)('OK', JSON.parse(cachedData), 'Fetched inquiries from cache successfully');
            }
            logger.log(`Cache miss for ${cacheKey}`);
            const customerCareStart = Date.now();
            const customerCare = await this.repository.findById(id);
            if (!customerCare) {
                logger.log(`Customer care fetch took ${Date.now() - customerCareStart}ms`);
                return (0, createResponse_1.createResponse)('NotFound', null, 'Customer care record not found');
            }
            logger.log(`Customer care fetch took ${Date.now() - customerCareStart}ms`);
            const inquiriesStart = Date.now();
            const inquiries = await this.dataSource
                .getRepository(customer_care_inquiry_entity_1.CustomerCareInquiry)
                .find({
                where: { assigned_customer_care: { id } },
                relations: ['customer', 'order'],
                select: {
                    id: true,
                    customer_id: true,
                    assignee_type: true,
                    subject: true,
                    description: true,
                    status: true,
                    priority: true,
                    resolution_notes: true,
                    created_at: true,
                    updated_at: true,
                    resolved_at: true,
                    customer: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        avatar: true
                    },
                    order: true
                }
            });
            logger.log(`Inquiries fetch took ${Date.now() - inquiriesStart}ms`);
            if (!inquiries || inquiries.length === 0) {
                const response = (0, createResponse_1.createResponse)('OK', [], 'No inquiries found for this customer care');
                await this.redisService.setNx(cacheKey, JSON.stringify([]), ttl * 1000);
                logger.log(`Stored empty inquiries in cache: ${cacheKey}`);
                return response;
            }
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
            const cacheSaveStart = Date.now();
            const cacheSaved = await this.redisService.setNx(cacheKey, JSON.stringify(populatedInquiries), ttl * 1000);
            if (cacheSaved) {
                logger.log(`Stored inquiries in cache: ${cacheKey} (took ${Date.now() - cacheSaveStart}ms)`);
            }
            else {
                logger.warn(`Failed to store inquiries in cache: ${cacheKey}`);
            }
            logger.log(`Total DB fetch and processing took ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', populatedInquiries, 'Fetched inquiries successfully');
        }
        catch (error) {
            logger.error(`Error fetching inquiries: ${error.message}`, error.stack);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while fetching inquiries');
        }
    }
    async findCustomerCareById(id) {
        try {
            const record = await this.repository.findById(id);
            if (!record) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Customer care record not found');
            }
            return (0, createResponse_1.createResponse)('OK', record, 'Fetched customer care record successfully');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while fetching the customer care record');
        }
    }
    async findOne(conditions) {
        const record = await this.repository.findOne(conditions);
        if (!record) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'Customer care record not found');
        }
        try {
            return (0, createResponse_1.createResponse)('OK', record, 'Fetched customer care record successfully');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while fetching the customer care record');
        }
    }
    async update(inquiryId, updateData) {
        const ttl = 300;
        try {
            const inquiry = await this.inquiryRepository.findById(inquiryId);
            if (!inquiry) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Inquiry not found');
            }
            const updatedInquiry = await this.inquiryRepository.update(inquiryId, updateData);
            const refreshedInquiry = await this.dataSource
                .getRepository(customer_care_inquiry_entity_1.CustomerCareInquiry)
                .findOne({
                where: { id: inquiryId },
                relations: ['customer', 'order'],
                select: {
                    id: true,
                    customer_id: true,
                    assignee_type: true,
                    subject: true,
                    description: true,
                    status: true,
                    priority: true,
                    resolution_notes: true,
                    created_at: true,
                    updated_at: true,
                    resolved_at: true,
                    customer: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        avatar: true
                    },
                    order: true
                }
            });
            const cacheKey = `inquiries:customer_care:${inquiry.assigned_customer_care.id}`;
            const cachedData = await this.redisService.get(cacheKey);
            const inquiries = cachedData ? JSON.parse(cachedData) : [];
            const inquiryIndex = inquiries.findIndex((i) => i.id === inquiryId);
            const populatedInquiry = {
                ...refreshedInquiry,
                customer: refreshedInquiry.customer
                    ? {
                        id: refreshedInquiry.customer.id,
                        first_name: refreshedInquiry.customer.first_name,
                        last_name: refreshedInquiry.customer.last_name,
                        avatar: refreshedInquiry.customer.avatar
                    }
                    : null,
                order: refreshedInquiry.order ? refreshedInquiry.order : null
            };
            if (inquiryIndex !== -1) {
                inquiries[inquiryIndex] = populatedInquiry;
            }
            else {
                inquiries.push(populatedInquiry);
            }
            await this.redisService.setNx(cacheKey, JSON.stringify(inquiries), ttl * 1000);
            logger.log(`Updated cache for ${cacheKey}`);
            return (0, createResponse_1.createResponse)('OK', updatedInquiry, 'Inquiry updated successfully');
        }
        catch (error) {
            logger.error(`Error updating inquiry: ${error.message}`, error.stack);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while updating the inquiry');
        }
    }
    async setAvailability(id) {
        try {
            const record = await this.repository.findById(id);
            if (!record) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Customer care record not found');
            }
            record.available_for_work = !record.available_for_work;
            const savedRecord = await this.repository.update(id, record);
            return (0, createResponse_1.createResponse)('OK', savedRecord, 'Customer care record updated successfully');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while updating the customer care record');
        }
    }
    async remove(id) {
        try {
            const deletedRecord = await this.repository.remove(id);
            if (!deletedRecord) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Customer care record not found');
            }
            return (0, createResponse_1.createResponse)('OK', null, 'Customer care record deleted successfully');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while deleting the customer care record');
        }
    }
    async updateEntityAvatar(uploadResult, entityId) {
        const record = await this.repository.update(entityId, {
            avatar: { url: uploadResult.url, key: uploadResult.public_id }
        });
        if (!record) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'Customer care record not found');
        }
        return (0, createResponse_1.createResponse)('OK', record, 'Customer care avatar updated successfully');
    }
    async resetInquiriesCache() {
        try {
            await this.redisService.deleteByPattern('inquiries:customer_care:*');
            return (0, createResponse_1.createResponse)('OK', null, 'Inquiries cache reset successfully');
        }
        catch (error) {
            logger.error(`Error resetting inquiries cache: ${error.message}`, error.stack);
            return (0, createResponse_1.createResponse)('ServerError', null, 'An error occurred while resetting inquiries cache');
        }
    }
    async findAllPaginated(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [customerCares, total] = await this.repository.findAllPaginated(skip, limit);
            const totalPages = Math.ceil(total / limit);
            return (0, createResponse_1.createResponse)('OK', {
                totalPages,
                currentPage: page,
                totalItems: total,
                items: customerCares
            }, 'Fetched paginated customer cares');
        }
        catch (error) {
            console.error('Error fetching paginated customer cares:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching paginated customer cares');
        }
    }
};
exports.CustomerCareService = CustomerCareService;
exports.CustomerCareService = CustomerCareService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [customer_cares_repository_1.CustomerCaresRepository,
        customer_cares_inquires_repository_1.CustomerCareInquiriesRepository,
        redis_service_1.RedisService,
        typeorm_1.DataSource])
], CustomerCareService);
//# sourceMappingURL=customer_cares.service.js.map