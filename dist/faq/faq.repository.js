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
exports.FAQsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const faq_entity_1 = require("./entities/faq.entity");
let FAQsRepository = class FAQsRepository {
    constructor(faqRepository) {
        this.faqRepository = faqRepository;
    }
    async create(faqData) {
        const newFAQ = this.faqRepository.create(faqData);
        return this.faqRepository.save(newFAQ);
    }
    async findAll() {
        return this.faqRepository.find();
    }
    async findActive() {
        return this.faqRepository.find({ where: { status: faq_entity_1.FAQStatus.ACTIVE } });
    }
    async findByType(type) {
        return this.faqRepository.find({
            where: { type, status: faq_entity_1.FAQStatus.ACTIVE }
        });
    }
    async findById(id) {
        return this.faqRepository.findOne({ where: { id } });
    }
    async update(id, updateData) {
        await this.faqRepository.update(id, updateData);
    }
    async delete(id) {
        return this.faqRepository.delete(id);
    }
    async findAllPaginated(skip, limit) {
        return await this.faqRepository.findAndCount({
            skip,
            take: limit
        });
    }
};
exports.FAQsRepository = FAQsRepository;
exports.FAQsRepository = FAQsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(faq_entity_1.FAQ)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FAQsRepository);
//# sourceMappingURL=faq.repository.js.map