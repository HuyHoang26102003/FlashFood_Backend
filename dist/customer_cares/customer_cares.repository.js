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
exports.CustomerCaresRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const customer_care_entity_1 = require("./entities/customer_care.entity");
let CustomerCaresRepository = class CustomerCaresRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async create(createDto) {
        const customerCare = this.repository.create(createDto);
        return await this.repository.save(customerCare);
    }
    async findAll() {
        const result = await this.repository
            .createQueryBuilder('customerCare')
            .leftJoin('banned_accounts', 'ban', 'ban.entity_id = customerCare.id AND ban.entity_type = :entityType', {
            entityType: 'CustomerCare'
        })
            .addSelect('CASE WHEN ban.id IS NOT NULL THEN true ELSE false END', 'customer_care_is_banned')
            .getRawAndEntities();
        return result.entities.map((customerCare, index) => {
            customerCare.is_banned =
                result.raw[index]?.customer_care_is_banned || false;
            return customerCare;
        });
    }
    async findById(id) {
        const result = await this.repository
            .createQueryBuilder('customerCare')
            .leftJoin('banned_accounts', 'ban', 'ban.entity_id = customerCare.id AND ban.entity_type = :entityType', {
            entityType: 'CustomerCare'
        })
            .addSelect('CASE WHEN ban.id IS NOT NULL THEN true ELSE false END', 'customer_care_is_banned')
            .where('customerCare.id = :id', { id })
            .getRawAndEntities();
        const customerCare = result.entities[0];
        if (customerCare) {
            customerCare.is_banned =
                result.raw[0]?.customer_care_is_banned || false;
        }
        return customerCare || null;
    }
    async findOne(condition) {
        console.log('check condition', condition);
        const bla = await this.repository.findOne({ where: condition });
        console.log('check bla', bla);
        return bla;
    }
    async findByUserId(userId) {
        console.log('check condition', { user_id: userId });
        const bla = await this.repository
            .createQueryBuilder('customerCare')
            .where('customerCare.user_id = :userId', { userId })
            .getOne();
        console.log('check bla', bla);
        return bla;
    }
    async update(id, updateDto) {
        await this.repository.update(id, {
            ...updateDto,
            updated_at: Math.floor(Date.now() / 1000)
        });
        return await this.findById(id);
    }
    async remove(id) {
        const result = await this.repository.delete(id);
        return result.affected > 0;
    }
    async findAllPaginated(skip, limit) {
        return await this.repository.findAndCount({
            skip,
            take: limit,
            relations: ['user']
        });
    }
};
exports.CustomerCaresRepository = CustomerCaresRepository;
exports.CustomerCaresRepository = CustomerCaresRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(customer_care_entity_1.CustomerCare)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], CustomerCaresRepository);
//# sourceMappingURL=customer_cares.repository.js.map