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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerCareInquiriesService = void 0;
const common_1 = require("@nestjs/common");
const customer_cares_inquires_repository_1 = require("./customer_cares_inquires.repository");
const createResponse_1 = require("../utils/createResponse");
const redis_service_1 = require("../redis/redis.service");
const logger = new common_1.Logger('CustomerCareInquiriesService');
let CustomerCareInquiriesService = class CustomerCareInquiriesService {
    constructor(repository, redisService) {
        this.repository = repository;
        this.redisService = redisService;
    }
    async create(createDto) {
        const start = Date.now();
        try {
            if (!createDto.assignee_type) {
                createDto.assignee_type = 'ADMIN';
            }
            const inquiry = await this.repository.create(createDto);
            if (inquiry.assigned_customer_care) {
                await this.redisService.del(`inquiries:customer_care:${inquiry.assigned_customer_care.id}`);
            }
            await this.redisService.del('inquiries:all');
            logger.log(`Created inquiry in ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', inquiry, 'Inquiry created successfully');
        }
        catch (error) {
            logger.error('Error creating inquiry:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to create inquiry');
        }
    }
    async findAll() {
        const start = Date.now();
        const cacheKey = 'inquiries:all';
        try {
            const cachedInquiries = await this.redisService.get(cacheKey);
            if (cachedInquiries) {
                logger.log('Cache hit for all inquiries');
                return (0, createResponse_1.createResponse)('OK', JSON.parse(cachedInquiries), 'Fetched inquiries (from cache)');
            }
            logger.log('Cache miss for all inquiries');
            const inquiries = await this.repository.findAll();
            await this.redisService.set(cacheKey, JSON.stringify(inquiries), 300);
            logger.log(`Fetched all inquiries in ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', inquiries, 'Inquiries fetched successfully');
        }
        catch (error) {
            logger.error('Error fetching inquiries:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to fetch inquiries');
        }
    }
    async findById(id) {
        const start = Date.now();
        const cacheKey = `inquiry:${id}`;
        try {
            const cachedInquiry = await this.redisService.get(cacheKey);
            if (cachedInquiry) {
                logger.log(`Cache hit for inquiry ${id}`);
                return (0, createResponse_1.createResponse)('OK', JSON.parse(cachedInquiry), 'Fetched inquiry (from cache)');
            }
            logger.log(`Cache miss for inquiry ${id}`);
            const inquiry = await this.repository.findById(id);
            if (!inquiry) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Inquiry not found');
            }
            await this.redisService.set(cacheKey, JSON.stringify(inquiry), 300);
            logger.log(`Fetched inquiry ${id} in ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', inquiry, 'Inquiry fetched successfully');
        }
        catch (error) {
            logger.error(`Error fetching inquiry ${id}:`, error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to fetch inquiry');
        }
    }
    async findAllInquiriesByCCId(id) {
        const start = Date.now();
        const cacheKey = `inquiries:customer_care:${id}`;
        try {
            const cachedInquiries = await this.redisService.get(cacheKey);
            if (cachedInquiries) {
                logger.log(`Cache hit for customer care ${id} inquiries`);
                return (0, createResponse_1.createResponse)('OK', JSON.parse(cachedInquiries), 'Fetched inquiries (from cache)');
            }
            logger.log(`Cache miss for customer care ${id} inquiries`);
            const inquiries = await this.repository.findAllInquiriesByCCId(id);
            if (!inquiries) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Inquiries not found');
            }
            await this.redisService.set(cacheKey, JSON.stringify(inquiries), 300);
            logger.log(`Fetched inquiries for customer care ${id} in ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', inquiries, 'Inquiries fetched successfully');
        }
        catch (error) {
            logger.error(`Error fetching inquiries for customer care ${id}:`, error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to fetch inquiries');
        }
    }
    async findAllInquiriesByCustomerId(customerId) {
        const start = Date.now();
        const cacheKey = `inquiries:customer:${customerId}`;
        try {
            const cachedInquiries = await this.redisService.get(cacheKey);
            if (cachedInquiries) {
                logger.log(`Cache hit for customer ${customerId} inquiries`);
                return (0, createResponse_1.createResponse)('OK', JSON.parse(cachedInquiries), 'Fetched customer inquiries (from cache)');
            }
            logger.log(`Cache miss for customer ${customerId} inquiries`);
            const inquiries = await this.repository.findAllInquiriesByCustomerId(customerId);
            if (!inquiries) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Customer inquiries not found');
            }
            await this.redisService.set(cacheKey, JSON.stringify(inquiries), 300);
            logger.log(`Fetched inquiries for customer ${customerId} in ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', inquiries, 'Customer inquiries fetched successfully');
        }
        catch (error) {
            logger.error(`Error fetching inquiries for customer ${customerId}:`, error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to fetch customer inquiries');
        }
    }
    async update(id, updateDto) {
        const start = Date.now();
        try {
            const inquiry = await this.repository.findById(id);
            if (!inquiry) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Inquiry not found');
            }
            const updated = await this.repository.update(id, updateDto);
            await this.redisService.del(`inquiry:${id}`);
            if (inquiry.assigned_customer_care) {
                await this.redisService.del(`inquiries:customer_care:${inquiry.assigned_customer_care.id}`);
            }
            await this.redisService.del('inquiries:all');
            logger.log(`Updated inquiry ${id} in ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', updated, 'Inquiry updated successfully');
        }
        catch (error) {
            logger.error(`Error updating inquiry ${id}:`, error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to update inquiry');
        }
    }
    async remove(id) {
        const start = Date.now();
        try {
            const inquiry = await this.repository.findById(id);
            if (!inquiry) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Inquiry not found');
            }
            await this.repository.remove(id);
            await this.redisService.del(`inquiry:${id}`);
            if (inquiry.assigned_customer_care) {
                await this.redisService.del(`inquiries:customer_care:${inquiry.assigned_customer_care.id}`);
            }
            await this.redisService.del('inquiries:all');
            logger.log(`Removed inquiry ${id} in ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', null, 'Inquiry deleted successfully');
        }
        catch (error) {
            logger.error(`Error removing inquiry ${id}:`, error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to delete inquiry');
        }
    }
    async escalateInquiry(id, customerCareId, reason, escalatedTo, escalatedToId) {
        try {
            const inquiry = await this.repository.escalateInquiry(id, customerCareId, reason, escalatedTo, escalatedToId);
            return (0, createResponse_1.createResponse)('OK', inquiry, 'Inquiry escalated successfully');
        }
        catch (error) {
            console.error('Error escalating inquiry:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to escalate inquiry');
        }
    }
    async rejectInquiry(id, customerCareId, reason) {
        try {
            const inquiry = await this.repository.rejectInquiry(id, customerCareId, reason);
            return (0, createResponse_1.createResponse)('OK', inquiry, 'Inquiry rejected successfully');
        }
        catch (error) {
            console.error('Error rejecting inquiry:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to reject inquiry');
        }
    }
    async transferInquiry(id, fromCustomerCareId, toCustomerCareId, reason) {
        try {
            const inquiry = await this.repository.transferInquiry(id, fromCustomerCareId, toCustomerCareId, reason);
            return (0, createResponse_1.createResponse)('OK', inquiry, 'Inquiry transferred successfully');
        }
        catch (error) {
            console.error('Error transferring inquiry:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to transfer inquiry');
        }
    }
    async recordResponse(id) {
        try {
            const inquiry = await this.repository.recordResponse(id);
            return (0, createResponse_1.createResponse)('OK', inquiry, 'Response recorded successfully');
        }
        catch (error) {
            console.error('Error recording response:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to record response');
        }
    }
    async resolveInquiry(id, resolutionType, resolutionNotes) {
        try {
            const inquiry = await this.repository.resolveInquiry(id, resolutionType, resolutionNotes);
            return (0, createResponse_1.createResponse)('OK', inquiry, 'Inquiry resolved successfully');
        }
        catch (error) {
            console.error('Error resolving inquiry:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to resolve inquiry');
        }
    }
    async findAllEscalatedInquiries() {
        const start = Date.now();
        const cacheKey = 'inquiries:escalated';
        try {
            const cachedInquiries = await this.redisService.get(cacheKey);
            if (cachedInquiries) {
                logger.log('Cache hit for escalated inquiries');
                return (0, createResponse_1.createResponse)('OK', JSON.parse(cachedInquiries), 'Fetched escalated inquiries (from cache)');
            }
            logger.log('Cache miss for escalated inquiries');
            const inquiries = await this.repository.findAllEscalatedInquiries();
            if (!inquiries) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'No escalated inquiries found');
            }
            await this.redisService.set(cacheKey, JSON.stringify(inquiries), 300);
            logger.log(`Fetched escalated inquiries in ${Date.now() - start}ms`);
            return (0, createResponse_1.createResponse)('OK', inquiries, 'Escalated inquiries fetched successfully');
        }
        catch (error) {
            logger.error('Error fetching escalated inquiries:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to fetch escalated inquiries');
        }
    }
    async findAllPaginated(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [inquiries, total] = await this.repository.findAllPaginated(skip, limit);
            const totalPages = Math.ceil(total / limit);
            return (0, createResponse_1.createResponse)('OK', {
                totalPages,
                currentPage: page,
                totalItems: total,
                items: inquiries
            }, 'Fetched paginated customer care inquiries');
        }
        catch (error) {
            console.error('Error fetching paginated customer care inquiries:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching paginated customer care inquiries');
        }
    }
};
exports.CustomerCareInquiriesService = CustomerCareInquiriesService;
exports.CustomerCareInquiriesService = CustomerCareInquiriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [customer_cares_inquires_repository_1.CustomerCareInquiriesRepository,
        redis_service_1.RedisService])
], CustomerCareInquiriesService);
//# sourceMappingURL=customer_cares_inquires.service.js.map