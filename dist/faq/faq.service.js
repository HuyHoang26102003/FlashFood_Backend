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
exports.FAQsService = void 0;
const common_1 = require("@nestjs/common");
const faq_repository_1 = require("./faq.repository");
const createResponse_1 = require("../utils/createResponse");
let FAQsService = class FAQsService {
    constructor(faqsRepository) {
        this.faqsRepository = faqsRepository;
    }
    async create(createFAQDto) {
        try {
            const savedFAQ = await this.faqsRepository.create({
                ...createFAQDto
            });
            return (0, createResponse_1.createResponse)('OK', savedFAQ, 'FAQ created successfully');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error creating FAQ');
        }
    }
    async findAll() {
        try {
            const faqs = await this.faqsRepository.findAll();
            return (0, createResponse_1.createResponse)('OK', faqs, 'FAQs retrieved successfully');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching FAQs');
        }
    }
    async findActive() {
        try {
            const faqs = await this.faqsRepository.findActive();
            return (0, createResponse_1.createResponse)('OK', faqs, 'Active FAQs retrieved successfully');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching active FAQs');
        }
    }
    async findByType(type) {
        try {
            const faqs = await this.faqsRepository.findByType(type);
            return (0, createResponse_1.createResponse)('OK', faqs, `FAQs of type ${type} retrieved successfully`);
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, `Error fetching FAQs of type ${type}`);
        }
    }
    async findOne(id) {
        try {
            const faq = await this.faqsRepository.findById(id);
            if (!faq) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'FAQ not found');
            }
            return (0, createResponse_1.createResponse)('OK', faq, 'FAQ retrieved successfully');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching FAQ');
        }
    }
    async update(id, updateFAQDto) {
        try {
            const faq = await this.faqsRepository.findById(id);
            if (!faq) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'FAQ not found');
            }
            await this.faqsRepository.update(id, updateFAQDto);
            const updatedFAQ = await this.faqsRepository.findById(id);
            return (0, createResponse_1.createResponse)('OK', updatedFAQ, 'FAQ updated successfully');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error updating FAQ');
        }
    }
    async remove(id) {
        try {
            const result = await this.faqsRepository.delete(id);
            if (result.affected === 0) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'FAQ not found');
            }
            return (0, createResponse_1.createResponse)('OK', null, 'FAQ deleted successfully');
        }
        catch (error) {
            console.log('error', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error deleting FAQ');
        }
    }
    async findAllPaginated(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [faqs, total] = await this.faqsRepository.findAllPaginated(skip, limit);
            const totalPages = Math.ceil(total / limit);
            return (0, createResponse_1.createResponse)('OK', {
                totalPages,
                currentPage: page,
                totalItems: total,
                items: faqs
            }, 'Fetched paginated FAQs');
        }
        catch (error) {
            console.error('Error fetching paginated FAQs:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching paginated FAQs');
        }
    }
};
exports.FAQsService = FAQsService;
exports.FAQsService = FAQsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [faq_repository_1.FAQsRepository])
], FAQsService);
//# sourceMappingURL=faq.service.js.map