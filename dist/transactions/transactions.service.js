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
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const transaction_entity_1 = require("./entities/transaction.entity");
const createResponse_1 = require("../utils/createResponse");
const fwallets_repository_1 = require("../fwallets/fwallets.repository");
const transactions_repository_1 = require("./transactions.repository");
const fwallet_entity_1 = require("../fwallets/entities/fwallet.entity");
const typeorm_1 = require("typeorm");
const redis_1 = require("redis");
const orders_service_1 = require("../orders/orders.service");
const logger = new common_1.Logger('TransactionService');
const redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redis.connect().catch(err => logger.error('Redis connection error:', err));
let TransactionService = class TransactionService {
    constructor(transactionsRepository, fWalletsRepository, dataSource, ordersService) {
        this.transactionsRepository = transactionsRepository;
        this.fWalletsRepository = fWalletsRepository;
        this.dataSource = dataSource;
        this.ordersService = ordersService;
        logger.log('TransactionService constructor called');
        logger.log('Checking injected dependencies:');
        logger.log('- transactionsRepository:', !!this.transactionsRepository);
        logger.log('- fWalletsRepository:', !!this.fWalletsRepository);
        logger.log('- dataSource:', !!this.dataSource);
        logger.log('- ordersService:', !!this.ordersService);
    }
    handleError(message, error) {
        logger.error(`${message}:`, error);
        return (0, createResponse_1.createResponse)('ServerError', null, error.message || message);
    }
    async create(createTransactionDto, manager) {
        logger.log('Creating transaction with DTO:', createTransactionDto);
        try {
            const txManager = manager || this.dataSource.createEntityManager();
            logger.log('Using transaction manager:', !!manager ? 'provided' : 'new');
            const start = Date.now();
            const maxRetries = 3;
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    logger.log(`Attempt ${attempt}: Creating transaction`, createTransactionDto);
                    const isExternalManager = !!manager;
                    const result = isExternalManager
                        ? await this.processTransaction(createTransactionDto, txManager)
                        : await this.dataSource.transaction(async (txManager) => this.processTransaction(createTransactionDto, txManager));
                    logger.log(`Transaction service took ${Date.now() - start}ms`);
                    return result;
                }
                catch (error) {
                    if (error.name === 'OptimisticLockVersionMismatchError' &&
                        attempt < maxRetries) {
                        logger.warn(`Optimistic lock failed on attempt ${attempt}, retrying...`, error);
                        const wallet = await this.fWalletsRepository.findById(createTransactionDto.fwallet_id);
                        if (wallet) {
                            createTransactionDto.version = wallet.version || 0;
                            createTransactionDto.balance_after =
                                Number(wallet.balance) - createTransactionDto.amount;
                            await redis.del(`fwallet:${createTransactionDto.user_id}`);
                        }
                        else {
                            logger.error('Wallet not found for retry', createTransactionDto);
                            return (0, createResponse_1.createResponse)('NotFound', null, 'Wallet not found');
                        }
                    }
                    else {
                        logger.error(`Error creating transaction on attempt ${attempt}:`, error);
                        return (0, createResponse_1.createResponse)('ServerError', null, 'Error creating transaction');
                    }
                }
            }
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to create transaction after retries');
        }
        catch (error) {
            return this.handleError('Error creating transaction:', error);
        }
    }
    async processTransaction(createTransactionDto, manager) {
        const { transaction_type, amount, fwallet_id, destination } = createTransactionDto;
        logger.log('Processing transaction:', createTransactionDto);
        let newTransaction;
        try {
            newTransaction = await this.transactionsRepository.create({
                ...createTransactionDto,
                status: 'PENDING'
            }, manager);
            logger.log('Created initial transaction with PENDING status:', {
                id: newTransaction.id,
                status: newTransaction.status
            });
            if (transaction_type === 'WITHDRAW' || transaction_type === 'PURCHASE') {
                const sourceWallet = await manager
                    .createQueryBuilder(fwallet_entity_1.FWallet, 'wallet')
                    .where('wallet.id = :id', { id: fwallet_id })
                    .select([
                    'wallet.id',
                    'wallet.balance',
                    'wallet.version',
                    'wallet.user_id'
                ])
                    .getOne();
                logger.log('Found source wallet:', sourceWallet);
                if (!sourceWallet) {
                    return (0, createResponse_1.createResponse)('NotFound', null, 'Source wallet not found');
                }
                if (createTransactionDto.version !== undefined &&
                    sourceWallet.version !== createTransactionDto.version) {
                    logger.warn('Wallet version mismatch:', {
                        expected: createTransactionDto.version,
                        actual: sourceWallet.version
                    });
                    return (0, createResponse_1.createResponse)('InvalidFormatInput', null, 'Wallet version mismatch');
                }
                if (Number(sourceWallet.balance) < amount) {
                    return (0, createResponse_1.createResponse)('InsufficientBalance', null, 'Insufficient balance in the source wallet');
                }
                await this.handleSourceWalletTransaction(sourceWallet, amount, manager);
                logger.log('Successfully deducted from source wallet');
            }
            if (transaction_type === 'DEPOSIT' || transaction_type === 'PURCHASE') {
                await this.handleDestinationWalletTransaction(destination, amount, manager, transaction_type);
                logger.log('Successfully added to destination wallet');
            }
            if (transaction_type === 'PURCHASE' ||
                transaction_type === 'DEPOSIT' ||
                transaction_type === 'WITHDRAW') {
                logger.log('Both wallets updated successfully, marking transaction as COMPLETED');
                const updateData = {
                    status: 'COMPLETED',
                    updated_at: Math.floor(Date.now() / 1000)
                };
                await manager.update(transaction_entity_1.Transaction, { id: newTransaction.id }, updateData);
                logger.log('Transaction status updated to COMPLETED');
            }
            if (transaction_type === 'WITHDRAW' || transaction_type === 'PURCHASE') {
                const sourceWallet = await manager
                    .createQueryBuilder(fwallet_entity_1.FWallet, 'wallet')
                    .where('wallet.id = :id', { id: fwallet_id })
                    .select([
                    'wallet.id',
                    'wallet.balance',
                    'wallet.version',
                    'wallet.user_id'
                ])
                    .getOne();
                if (sourceWallet) {
                    await redis.setEx(`fwallet:${sourceWallet.user_id}`, 7200, JSON.stringify(sourceWallet));
                    logger.log('Updated Redis cache for source wallet');
                }
            }
            const updatedTransaction = await manager.findOne(transaction_entity_1.Transaction, {
                where: { id: newTransaction.id }
            });
            logger.log('Final transaction state:', {
                id: updatedTransaction.id,
                status: updatedTransaction.status,
                amount: updatedTransaction.amount
            });
            return (0, createResponse_1.createResponse)('OK', updatedTransaction, 'Transaction processed successfully');
        }
        catch (error) {
            logger.error('Error in processTransaction:', error);
            if (newTransaction?.id) {
                try {
                    const updateData = {
                        status: 'FAILED',
                        updated_at: Math.floor(Date.now() / 1000)
                    };
                    await manager.update(transaction_entity_1.Transaction, { id: newTransaction.id }, updateData);
                    logger.log('Marked transaction as FAILED due to error');
                }
                catch (updateError) {
                    logger.error('Error updating transaction status to FAILED:', updateError);
                }
            }
            throw error;
        }
    }
    async handleSourceWalletTransaction(sourceWallet, amount, manager) {
        const maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                logger.log(`Attempt ${attempt}: Updating source wallet:`, {
                    id: sourceWallet.id,
                    balance: sourceWallet.balance,
                    user_id: sourceWallet.user_id,
                    version: sourceWallet.version
                });
                const currentBalance = Number(parseFloat(sourceWallet.balance.toString()).toFixed(2));
                const amountToDeduct = Number(parseFloat(amount.toString()).toFixed(2));
                const newBalance = Number((currentBalance - amountToDeduct).toFixed(2));
                logger.log('Calculating new balance:', {
                    currentBalance,
                    amountToDeduct,
                    newBalance,
                    originalBalance: sourceWallet.balance,
                    originalAmount: amount
                });
                const updateResult = await manager
                    .createQueryBuilder()
                    .update(fwallet_entity_1.FWallet)
                    .set({
                    balance: newBalance,
                    updated_at: Math.floor(Date.now() / 1000),
                    version: (sourceWallet.version || 0) + 1
                })
                    .where('id = :id AND version = :version AND balance >= :amount', {
                    id: sourceWallet.id,
                    version: sourceWallet.version || 0,
                    amount: amountToDeduct
                })
                    .execute();
                logger.log('Source wallet update result:', {
                    affected: updateResult.affected,
                    raw: updateResult.raw
                });
                if (updateResult.affected === 0) {
                    const currentWallet = await manager.findOne(fwallet_entity_1.FWallet, {
                        where: { id: sourceWallet.id }
                    });
                    if (!currentWallet) {
                        throw new Error(`Source wallet ${sourceWallet.id} not found`);
                    }
                    const currentWalletBalance = Number(parseFloat(currentWallet.balance.toString()).toFixed(2));
                    if (currentWalletBalance < amountToDeduct) {
                        throw new Error('Insufficient balance');
                    }
                    throw new Error(`Failed to update source wallet ${sourceWallet.id} due to version conflict`);
                }
                sourceWallet.balance = newBalance;
                sourceWallet.updated_at = Math.floor(Date.now() / 1000);
                sourceWallet.version = (sourceWallet.version || 0) + 1;
                logger.log('Source wallet after update:', {
                    id: sourceWallet.id,
                    balance: sourceWallet.balance,
                    user_id: sourceWallet.user_id,
                    version: sourceWallet.version
                });
                await redis.del(`fwallet:${sourceWallet.user_id}`);
                return;
            }
            catch (error) {
                logger.error(`Error on attempt ${attempt}:`, error);
                if (error.message === 'Insufficient balance') {
                    throw error;
                }
                if (attempt === maxRetries) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }
    async handleDestinationWalletTransaction(destination, amount, manager, transaction_type) {
        const maxRetries = 3;
        let destinationWallet;
        let attempt = 1;
        while (attempt <= maxRetries) {
            try {
                if (transaction_type === 'PURCHASE') {
                    destinationWallet = await manager
                        .createQueryBuilder(fwallet_entity_1.FWallet, 'wallet')
                        .where('wallet.id = :id', { id: destination })
                        .select([
                        'wallet.id',
                        'wallet.balance',
                        'wallet.version',
                        'wallet.user_id'
                    ])
                        .getOne();
                }
                else {
                    destinationWallet = await manager
                        .createQueryBuilder(fwallet_entity_1.FWallet, 'wallet')
                        .where('wallet.id = :id', { id: destination })
                        .select([
                        'wallet.id',
                        'wallet.balance',
                        'wallet.version',
                        'wallet.user_id'
                    ])
                        .getOne();
                }
                if (!destinationWallet) {
                    const errorMessage = `Destination wallet ${destination} not found`;
                    logger.error(errorMessage);
                    throw new Error(errorMessage);
                }
                logger.log('Found destination wallet:', {
                    id: destinationWallet.id,
                    user_id: destinationWallet.user_id,
                    balance: destinationWallet.balance,
                    version: destinationWallet.version
                });
                const currentBalance = Number(parseFloat(destinationWallet.balance.toString()).toFixed(2));
                const amountToAdd = Number(parseFloat(amount.toString()).toFixed(2));
                const newBalance = Number((currentBalance + amountToAdd).toFixed(2));
                logger.log('Calculating new balance:', {
                    currentBalance,
                    amountToAdd,
                    newBalance,
                    originalBalance: destinationWallet.balance,
                    originalAmount: amount
                });
                const updateResult = await manager
                    .createQueryBuilder()
                    .update(fwallet_entity_1.FWallet)
                    .set({
                    balance: newBalance,
                    updated_at: Math.floor(Date.now() / 1000),
                    version: (destinationWallet.version || 0) + 1
                })
                    .where('id = :id AND version = :version', {
                    id: destinationWallet.id,
                    version: destinationWallet.version || 0
                })
                    .execute();
                logger.log('Destination wallet update result:', {
                    affected: updateResult.affected,
                    raw: updateResult.raw
                });
                if (updateResult.affected === 0) {
                    logger.warn(`Optimistic lock failed on destination wallet attempt ${attempt}, retrying...`);
                    attempt++;
                    continue;
                }
                destinationWallet.balance = newBalance;
                destinationWallet.updated_at = Math.floor(Date.now() / 1000);
                destinationWallet.version = (destinationWallet.version || 0) + 1;
                await redis.del(`fwallet:${destinationWallet.user_id}`);
                await redis.setEx(`fwallet:${destinationWallet.user_id}`, 7200, JSON.stringify(destinationWallet));
                return;
            }
            catch (error) {
                logger.error(`Error on attempt ${attempt}:`, error);
                if (attempt < maxRetries) {
                    attempt++;
                    await new Promise(resolve => setTimeout(resolve, 100));
                    continue;
                }
                throw new Error(`Failed to update destination wallet ${destination} after ${maxRetries} retries`);
            }
        }
        throw new Error(`Failed to update destination wallet ${destination} after ${maxRetries} retries`);
    }
    async findAll() {
        try {
            const transactions = await this.transactionsRepository.findAll();
            return (0, createResponse_1.createResponse)('OK', transactions, 'Fetched all transactions');
        }
        catch (error) {
            return this.handleError('Error fetching transactions:', error);
        }
    }
    async findTransactionById(id) {
        try {
            const transaction = await this.transactionsRepository.findById(id);
            return this.handleTransactionResponse(transaction);
        }
        catch (error) {
            return this.handleError('Error fetching transaction:', error);
        }
    }
    async findOne(conditions) {
        try {
            const transaction = await this.transactionsRepository.findByCondition(conditions);
            return this.handleTransactionResponse(transaction);
        }
        catch (error) {
            return this.handleError('Error fetching transaction:', error);
        }
    }
    async update(id, updateTransactionDto) {
        try {
            const updatedTransaction = await this.transactionsRepository.update(id, updateTransactionDto);
            return this.handleTransactionResponse(updatedTransaction);
        }
        catch (error) {
            return this.handleError('Error updating transaction:', error);
        }
    }
    async remove(id) {
        try {
            const result = await this.transactionsRepository.remove(id);
            if (!result) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Transaction not found');
            }
            return (0, createResponse_1.createResponse)('OK', null, 'Transaction deleted successfully');
        }
        catch (error) {
            return this.handleError('Error deleting transaction:', error);
        }
    }
    async findAllPaginated(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [transactions, total] = await this.transactionsRepository.findAllPaginated(skip, limit);
            const totalPages = Math.ceil(total / limit);
            return (0, createResponse_1.createResponse)('OK', {
                totalPages,
                currentPage: page,
                totalItems: total,
                items: transactions
            }, 'Fetched paginated transactions');
        }
        catch (error) {
            console.error('Error fetching paginated transactions:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching paginated transactions');
        }
    }
    handleTransactionResponse(transaction) {
        if (!transaction) {
            return (0, createResponse_1.createResponse)('NotFound', null, 'Transaction not found');
        }
        return (0, createResponse_1.createResponse)('OK', transaction, 'Transaction retrieved successfully');
    }
    async updateTransactionStatus(transactionId, newStatus, orderId, manager) {
        logger.log(`Updating transaction ${transactionId} status to ${newStatus}`);
        logger.log('OrderId provided:', orderId);
        const txManager = manager || this.dataSource.createEntityManager();
        logger.log('Using transaction manager:', !!manager ? 'provided' : 'new');
        try {
            const transaction = await this.transactionsRepository.findById(transactionId);
            if (!transaction) {
                logger.warn(`Transaction ${transactionId} not found`);
                return (0, createResponse_1.createResponse)('NotFound', null, 'Transaction not found');
            }
            logger.log('Found transaction:', transaction);
            transaction.status = newStatus;
            transaction.updated_at = Math.floor(Date.now() / 1000);
            logger.log('Updated transaction fields:', {
                status: transaction.status,
                updated_at: transaction.updated_at
            });
            if (transaction.transaction_type === 'PURCHASE' && orderId) {
                logger.log('Syncing order payment status for PURCHASE transaction');
                let orderPaymentStatus;
                switch (newStatus) {
                    case 'COMPLETED':
                        orderPaymentStatus = 'PAID';
                        break;
                    case 'FAILED':
                        orderPaymentStatus = 'FAILED';
                        break;
                    case 'CANCELLED':
                        orderPaymentStatus = 'FAILED';
                        break;
                    default:
                        orderPaymentStatus = 'PENDING';
                }
                logger.log('Mapped transaction status to order payment status:', {
                    transactionStatus: newStatus,
                    orderPaymentStatus
                });
                logger.log('Calling ordersService.updateOrderPaymentStatus');
                const orderUpdateResult = await this.ordersService.updateOrderPaymentStatus(orderId, orderPaymentStatus, txManager);
                logger.log('Order payment status update result:', orderUpdateResult);
            }
            if (newStatus === 'COMPLETED' && !transaction.balance_after) {
                logger.log('Updating wallet balance for completed transaction');
                const wallet = await this.fWalletsRepository.findById(transaction.fwallet_id);
                if (wallet) {
                    logger.log('Found wallet:', wallet);
                    const currentBalance = Number(wallet.balance);
                    transaction.balance_after =
                        transaction.transaction_type === 'WITHDRAW' ||
                            transaction.transaction_type === 'PURCHASE'
                            ? currentBalance - transaction.amount
                            : currentBalance + transaction.amount;
                    logger.log('Calculated new balance:', transaction.balance_after);
                }
                else {
                    logger.warn(`Wallet ${transaction.fwallet_id} not found`);
                }
            }
            logger.log('Saving updated transaction');
            await this.transactionsRepository.update(transactionId, {
                status: newStatus,
                balance_after: transaction.balance_after,
                updated_at: transaction.updated_at
            });
            const updatedTransaction = await this.transactionsRepository.findById(transactionId);
            logger.log('Retrieved updated transaction:', updatedTransaction);
            logger.log('Clearing Redis cache');
            await redis.del(`transaction:${transactionId}`);
            await redis.del(`fwallet:${transaction.user_id}`);
            logger.log('Redis cache cleared');
            return (0, createResponse_1.createResponse)('OK', updatedTransaction, 'Transaction status updated successfully');
        }
        catch (error) {
            logger.error('Error updating transaction status:', error);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Failed to update transaction status');
        }
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => orders_service_1.OrdersService))),
    __metadata("design:paramtypes", [transactions_repository_1.TransactionsRepository,
        fwallets_repository_1.FWalletsRepository,
        typeorm_1.DataSource,
        orders_service_1.OrdersService])
], TransactionService);
//# sourceMappingURL=transactions.service.js.map