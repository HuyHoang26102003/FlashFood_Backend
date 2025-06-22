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
exports.FWalletService = void 0;
const common_1 = require("@nestjs/common");
const fwallets_repository_1 = require("./fwallets.repository");
const createResponse_1 = require("../utils/createResponse");
let FWalletService = class FWalletService {
    constructor(fWalletsRepository) {
        this.fWalletsRepository = fWalletsRepository;
    }
    async create(createFWalletDto) {
        try {
            const existingWallet = await this.fWalletsRepository.findByUserId(createFWalletDto.user_id);
            if (existingWallet) {
                return (0, createResponse_1.createResponse)('DuplicatedRecord', null, 'Wallet for this user already exists');
            }
            const newWallet = await this.fWalletsRepository.create(createFWalletDto);
            return (0, createResponse_1.createResponse)('OK', newWallet, 'Wallet created successfully');
        }
        catch (error) {
            console.error('Error creating wallet:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error creating wallet');
        }
    }
    async findAll() {
        try {
            const wallets = await this.fWalletsRepository.findAll();
            return (0, createResponse_1.createResponse)('OK', wallets, 'Fetched all wallets');
        }
        catch (error) {
            console.error('Error fetching wallets:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching wallets');
        }
    }
    async findBySearchQuery(query) {
        try {
            const wallets = await this.fWalletsRepository.findBySearchQuery(query);
            return (0, createResponse_1.createResponse)('OK', wallets, 'Fetched wallets by search query');
        }
        catch (error) {
            console.error('Error fetching wallets by search query:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching wallets by search query');
        }
    }
    async findFWalletById(id) {
        try {
            const wallet = await this.fWalletsRepository.findById(id);
            if (!wallet) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Wallet not found');
            }
            return (0, createResponse_1.createResponse)('OK', wallet, 'Wallet retrieved successfully');
        }
        catch (error) {
            console.error('Error fetching wallet:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching wallet');
        }
    }
    async findOne(conditions) {
        try {
            const wallet = await this.fWalletsRepository.findByCondition(conditions);
            if (!wallet) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Wallet not found');
            }
            return (0, createResponse_1.createResponse)('OK', wallet, 'Wallet retrieved successfully');
        }
        catch (error) {
            console.error('Error fetching wallet:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching wallet');
        }
    }
    async update(id, updateFWalletDto) {
        try {
            const wallet = await this.fWalletsRepository.findById(id);
            if (!wallet) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Wallet not found');
            }
            const updatedWallet = await this.fWalletsRepository.update(id, updateFWalletDto);
            return (0, createResponse_1.createResponse)('OK', updatedWallet, 'Wallet updated successfully');
        }
        catch (error) {
            console.error('Error updating wallet:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error updating wallet');
        }
    }
    async remove(id) {
        try {
            const result = await this.fWalletsRepository.delete(id);
            if (!result) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Wallet not found');
            }
            return (0, createResponse_1.createResponse)('OK', null, 'Wallet deleted successfully');
        }
        catch (error) {
            console.error('Error deleting wallet:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error deleting wallet');
        }
    }
    async findHistoryTransaction(fWalletId) {
        try {
            const wallet = await this.fWalletsRepository.findById(fWalletId);
            if (!wallet) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Wallet not found');
            }
            const transactions = await this.fWalletsRepository.findHistoryTransaction(fWalletId);
            return (0, createResponse_1.createResponse)('OK', transactions, 'Fetched transaction history successfully');
        }
        catch (error) {
            console.error('Error fetching transaction history:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching transaction history');
        }
    }
    async findAllPaginated(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [wallets, total] = await this.fWalletsRepository.findAllPaginated(skip, limit);
            const totalPages = Math.ceil(total / limit);
            return (0, createResponse_1.createResponse)('OK', {
                totalPages,
                currentPage: page,
                totalItems: total,
                items: wallets
            }, 'Fetched paginated wallets');
        }
        catch (error) {
            console.error('Error fetching paginated wallets:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching paginated wallets');
        }
    }
};
exports.FWalletService = FWalletService;
exports.FWalletService = FWalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [fwallets_repository_1.FWalletsRepository])
], FWalletService);
//# sourceMappingURL=fwallets.service.js.map