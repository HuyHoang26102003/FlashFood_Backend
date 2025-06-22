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
exports.FWalletsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const fwallet_entity_1 = require("./entities/fwallet.entity");
const transaction_entity_1 = require("../transactions/entities/transaction.entity");
let FWalletsRepository = class FWalletsRepository {
    constructor(repository, transactionRepository) {
        this.repository = repository;
        this.transactionRepository = transactionRepository;
    }
    async create(createDto, manager) {
        const repo = manager ? manager.getRepository(fwallet_entity_1.FWallet) : this.repository;
        const wallet = repo.create(createDto);
        return await repo.save(wallet);
    }
    async findAll(manager) {
        const repo = manager ? manager.getRepository(fwallet_entity_1.FWallet) : this.repository;
        return await repo.find({ relations: ['user'] });
    }
    async findBySearchQuery(query, manager) {
        const repo = manager ? manager.getRepository(fwallet_entity_1.FWallet) : this.repository;
        return await repo.find({
            where: [
                { first_name: (0, typeorm_1.Like)(`%${query}%`) },
                { last_name: (0, typeorm_1.Like)(`%${query}%`) }
            ],
            relations: ['user']
        });
    }
    async findById(id, manager) {
        const repo = manager ? manager.getRepository(fwallet_entity_1.FWallet) : this.repository;
        return await repo.findOne({ where: { id } });
    }
    async findByUserId(userId, manager) {
        const repo = manager ? manager.getRepository(fwallet_entity_1.FWallet) : this.repository;
        return await repo.findOne({ where: { user_id: userId } });
    }
    async findByCondition(condition, manager) {
        const repo = manager ? manager.getRepository(fwallet_entity_1.FWallet) : this.repository;
        return await repo.findOne({ where: condition });
    }
    async update(id, updateDto, manager) {
        const repo = manager ? manager.getRepository(fwallet_entity_1.FWallet) : this.repository;
        const result = await repo.update(id, {
            ...updateDto,
            updated_at: Math.floor(Date.now() / 1000)
        });
        console.log('repository update result', result);
        return result;
    }
    async delete(id, manager) {
        const repo = manager ? manager.getRepository(fwallet_entity_1.FWallet) : this.repository;
        const result = await repo.delete(id);
        return result.affected > 0;
    }
    async findHistoryTransaction(fWalletId, manager) {
        const repo = manager
            ? manager.getRepository(transaction_entity_1.Transaction)
            : this.transactionRepository;
        return await repo.find({
            where: [
                { fwallet_id: fWalletId },
                { destination: fWalletId }
            ],
            order: { created_at: 'DESC' }
        });
    }
    async findAllPaginated(skip, limit) {
        return await this.repository.findAndCount({
            skip,
            take: limit,
            relations: ['user']
        });
    }
};
exports.FWalletsRepository = FWalletsRepository;
exports.FWalletsRepository = FWalletsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(fwallet_entity_1.FWallet)),
    __param(1, (0, typeorm_2.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository])
], FWalletsRepository);
//# sourceMappingURL=fwallets.repository.js.map