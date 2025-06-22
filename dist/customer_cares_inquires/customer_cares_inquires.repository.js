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
var CustomerCareInquiriesRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerCareInquiriesRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const customer_care_inquiry_entity_1 = require("./entities/customer_care_inquiry.entity");
const inquiries_1 = require("../utils/rules/inquiries");
const order_entity_1 = require("../orders/entities/order.entity");
const customer_care_entity_1 = require("../customer_cares/entities/customer_care.entity");
const constants_1 = require("../utils/constants");
let CustomerCareInquiriesRepository = CustomerCareInquiriesRepository_1 = class CustomerCareInquiriesRepository {
    constructor(repository, orderRepository, customerCareRepository) {
        this.repository = repository;
        this.orderRepository = orderRepository;
        this.customerCareRepository = customerCareRepository;
        this.logger = new common_1.Logger(CustomerCareInquiriesRepository_1.name);
    }
    async create(createDto) {
        try {
            if (!['ADMIN', 'CUSTOMER_CARE'].includes(createDto.assignee_type)) {
                throw new Error(`Invalid assignee_type: ${createDto.assignee_type}`);
            }
            const priority = await (0, inquiries_1.calculateInquiryPriority)(createDto, this.orderRepository);
            console.log(`Calculated priority: ${priority}`);
            let assignedCustomerCareId = null;
            if (createDto.assignee_type === 'CUSTOMER_CARE' &&
                !createDto.assigned_to) {
                assignedCustomerCareId = await (0, inquiries_1.findAvailableCustomerCare)(this.customerCareRepository, this.repository);
                console.log(`Assigned CustomerCare ID: ${assignedCustomerCareId}`);
                if (assignedCustomerCareId) {
                    const points = (0, inquiries_1.getPriorityPoints)(priority);
                    await this.customerCareRepository.update(assignedCustomerCareId, {
                        active_point: () => `active_point + ${points}`,
                        active_workload: () => 'active_workload + 1',
                        is_assigned: true
                    });
                    console.log(`Incremented active_point by ${points} and active_workload by 1 for CustomerCare: ${assignedCustomerCareId}`);
                }
                else {
                    console.warn('No CustomerCare assigned, falling back to ADMIN');
                    createDto.assignee_type = 'ADMIN';
                    createDto.assigned_to = constants_1.ADMIN_MOCK.admin_id;
                }
            }
            const inquiryData = {
                ...createDto,
                priority,
                assigned_admin_id: createDto.assignee_type === 'ADMIN' ? createDto.assigned_to : null,
                assigned_customer_care: createDto.assignee_type === 'CUSTOMER_CARE' && assignedCustomerCareId
                    ? { id: assignedCustomerCareId }
                    : null,
                order: createDto.order_id ? { id: createDto.order_id } : null,
                escalation_history: createDto.escalation_history || [],
                rejection_history: createDto.rejection_history || [],
                transfer_history: createDto.transfer_history || [],
                escalation_count: 0,
                rejection_count: 0,
                transfer_count: 0,
                first_response_at: null,
                last_response_at: null
            };
            console.log('Final inquiryData before create:', JSON.stringify(inquiryData, null, 2));
            const inquiry = this.repository.create(inquiryData);
            const savedInquiry = await this.repository.save(inquiry);
            console.log('Saved inquiry:', JSON.stringify(savedInquiry, null, 2));
            const result = await this.repository.findOne({
                where: { id: savedInquiry.id },
                relations: [
                    'customer',
                    'assigned_admin',
                    'assigned_customer_care',
                    'order'
                ]
            });
            if (!result) {
                throw new Error('Failed to load saved inquiry');
            }
            return result;
        }
        catch (error) {
            console.error('Error in create method:', error);
            throw error;
        }
    }
    async update(id, updateDto) {
        try {
            const currentInquiry = await this.repository.findOne({
                where: { id },
                relations: ['assigned_customer_care']
            });
            if (!currentInquiry) {
                throw new Error('Inquiry not found');
            }
            if (updateDto.status &&
                ['RESOLVED', 'CLOSED'].includes(updateDto.status) &&
                currentInquiry.assigned_customer_care?.id) {
                const customerCareId = currentInquiry.assigned_customer_care.id;
                await this.customerCareRepository.update(customerCareId, {
                    active_workload: () => 'active_workload - 1'
                });
                const customerCare = await this.customerCareRepository.findOne({
                    where: { id: customerCareId }
                });
                if (customerCare && customerCare.active_workload <= 0) {
                    await this.customerCareRepository.update(customerCareId, {
                        is_assigned: false
                    });
                }
            }
            await this.repository.update(id, {
                ...updateDto,
                updated_at: Math.floor(Date.now() / 1000)
            });
            return this.findById(id);
        }
        catch (error) {
            console.error('Repository update error:', error);
            throw error;
        }
    }
    async findById(id) {
        try {
            return await this.repository
                .createQueryBuilder('inquiry')
                .leftJoinAndSelect('inquiry.customer', 'customer')
                .leftJoinAndSelect('inquiry.assigned_admin', 'assigned_admin')
                .leftJoinAndSelect('inquiry.assigned_customer_care', 'assigned_customer_care')
                .leftJoinAndSelect('inquiry.order', 'order')
                .where('inquiry.id = :id', { id })
                .getOne();
        }
        catch (error) {
            this.logger.error(`Error finding inquiry by id: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async findAll() {
        try {
            return await this.repository
                .createQueryBuilder('inquiry')
                .leftJoinAndSelect('inquiry.customer', 'customer')
                .leftJoinAndSelect('inquiry.assigned_admin', 'assigned_admin')
                .leftJoinAndSelect('inquiry.assigned_customer_care', 'assigned_customer_care')
                .leftJoinAndSelect('inquiry.order', 'order')
                .orderBy('inquiry.created_at', 'DESC')
                .getMany();
        }
        catch (error) {
            this.logger.error(`Error finding all inquiries: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async findAllInquiriesByCCId(customerCareId) {
        try {
            if (!customerCareId) {
                throw new Error('CustomerCare ID is required');
            }
            console.log(`Finding inquiries for CustomerCare ID: ${customerCareId}`);
            const inquiries = await this.repository
                .createQueryBuilder('inquiry')
                .leftJoinAndSelect('inquiry.customer', 'customer')
                .leftJoinAndSelect('inquiry.assigned_admin', 'assigned_admin')
                .leftJoinAndSelect('inquiry.assigned_customer_care', 'assigned_customer_care')
                .leftJoinAndSelect('inquiry.order', 'order')
                .where('inquiry.assigned_customer_care_id = :id', {
                id: customerCareId
            })
                .orderBy('inquiry.created_at', 'DESC')
                .getMany();
            console.log(`Found ${inquiries.length} inquiries for CustomerCare ID: ${customerCareId}`);
            return inquiries;
        }
        catch (error) {
            console.error(`Error finding inquiries for CustomerCare ID ${customerCareId}:`, error);
            throw error;
        }
    }
    async findAllInquiriesByCustomerId(customerId) {
        try {
            if (!customerId) {
                throw new Error('Customer ID is required');
            }
            console.log(`Finding inquiries for Customer ID: ${customerId}`);
            const inquiries = await this.repository
                .createQueryBuilder('inquiry')
                .leftJoinAndSelect('inquiry.customer', 'customer')
                .leftJoinAndSelect('inquiry.assigned_admin', 'assigned_admin')
                .leftJoinAndSelect('inquiry.assigned_customer_care', 'assigned_customer_care')
                .leftJoinAndSelect('inquiry.order', 'order')
                .where('inquiry.customer_id = :customerId', { customerId })
                .orderBy('inquiry.created_at', 'DESC')
                .getMany();
            console.log(`Found ${inquiries.length} inquiries for Customer ID: ${customerId}`);
            return inquiries;
        }
        catch (error) {
            console.error(`Error finding inquiries for Customer ID ${customerId}:`, error);
            throw error;
        }
    }
    async remove(id) {
        const result = await this.repository.delete(id);
        return result.affected > 0;
    }
    async escalateInquiry(id, customerCareId, reason, escalatedTo, escalatedToId) {
        try {
            const inquiry = await this.findById(id);
            if (!inquiry) {
                throw new Error('Inquiry not found');
            }
            const escalationHistory = inquiry.escalation_history || [];
            escalationHistory.push({
                customer_care_id: customerCareId,
                reason,
                timestamp: Math.floor(Date.now() / 1000),
                escalated_to: escalatedTo,
                escalated_to_id: escalatedToId
            });
            await this.update(id, {
                status: 'ESCALATE',
                escalation_history: escalationHistory,
                escalation_count: inquiry.escalation_count + 1
            });
            return await this.findById(id);
        }
        catch (error) {
            this.logger.error(`Error escalating inquiry: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async rejectInquiry(id, customerCareId, reason) {
        try {
            const inquiry = await this.findById(id);
            if (!inquiry) {
                throw new Error('Inquiry not found');
            }
            const rejectionHistory = inquiry.rejection_history || [];
            rejectionHistory.push({
                customer_care_id: customerCareId,
                reason,
                timestamp: Math.floor(Date.now() / 1000)
            });
            await this.update(id, {
                rejection_history: rejectionHistory,
                rejection_count: inquiry.rejection_count + 1
            });
            return await this.findById(id);
        }
        catch (error) {
            this.logger.error(`Error rejecting inquiry: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async transferInquiry(id, fromCustomerCareId, toCustomerCareId, reason) {
        try {
            const inquiry = await this.findById(id);
            if (!inquiry) {
                throw new Error('Inquiry not found');
            }
            const transferHistory = inquiry.transfer_history || [];
            transferHistory.push({
                from_customer_care_id: fromCustomerCareId,
                to_customer_care_id: toCustomerCareId,
                reason,
                timestamp: Math.floor(Date.now() / 1000)
            });
            await this.update(id, {
                assigned_customer_care_id: toCustomerCareId,
                transfer_history: transferHistory,
                transfer_count: inquiry.transfer_count + 1
            });
            return await this.findById(id);
        }
        catch (error) {
            this.logger.error(`Error transferring inquiry: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async recordResponse(id) {
        try {
            const inquiry = await this.findById(id);
            if (!inquiry) {
                throw new Error('Inquiry not found');
            }
            const now = Math.floor(Date.now() / 1000);
            const updates = {
                last_response_at: now
            };
            if (!inquiry.first_response_at) {
                updates.first_response_at = now;
                updates.response_time = now - inquiry.created_at;
            }
            await this.update(id, updates);
            return await this.findById(id);
        }
        catch (error) {
            this.logger.error(`Error recording response: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async resolveInquiry(id, resolutionType, resolutionNotes) {
        try {
            const inquiry = await this.findById(id);
            if (!inquiry) {
                throw new Error('Inquiry not found');
            }
            const now = Math.floor(Date.now() / 1000);
            await this.update(id, {
                status: 'RESOLVED',
                resolution_type: resolutionType,
                resolution_notes: resolutionNotes,
                resolved_at: now,
                resolution_time: now - inquiry.created_at
            });
            return await this.findById(id);
        }
        catch (error) {
            this.logger.error(`Error resolving inquiry: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async findAllEscalatedInquiries() {
        try {
            return await this.repository
                .createQueryBuilder('inquiry')
                .leftJoinAndSelect('inquiry.customer', 'customer')
                .leftJoinAndSelect('inquiry.assigned_admin', 'assigned_admin')
                .leftJoinAndSelect('inquiry.assigned_customer_care', 'assigned_customer_care')
                .leftJoinAndSelect('inquiry.order', 'order')
                .where('inquiry.status = :status', { status: 'ESCALATE' })
                .orderBy('inquiry.created_at', 'DESC')
                .getMany();
        }
        catch (error) {
            console.error('Error finding escalated inquiries:', error);
            throw error;
        }
    }
    async findAllPaginated(skip, limit) {
        try {
            return await this.repository
                .createQueryBuilder('inquiry')
                .leftJoinAndSelect('inquiry.customer', 'customer')
                .leftJoinAndSelect('inquiry.assigned_admin', 'assigned_admin')
                .leftJoinAndSelect('inquiry.assigned_customer_care', 'assigned_customer_care')
                .leftJoinAndSelect('inquiry.order', 'order')
                .orderBy('inquiry.created_at', 'DESC')
                .skip(skip)
                .take(limit)
                .getManyAndCount();
        }
        catch (error) {
            this.logger.error(`Error finding paginated inquiries: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
};
exports.CustomerCareInquiriesRepository = CustomerCareInquiriesRepository;
exports.CustomerCareInquiriesRepository = CustomerCareInquiriesRepository = CustomerCareInquiriesRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(customer_care_inquiry_entity_1.CustomerCareInquiry)),
    __param(1, (0, typeorm_2.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_2.InjectRepository)(customer_care_entity_1.CustomerCare)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], CustomerCareInquiriesRepository);
//# sourceMappingURL=customer_cares_inquires.repository.js.map