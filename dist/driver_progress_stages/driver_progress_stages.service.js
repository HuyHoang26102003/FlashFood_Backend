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
exports.DriverProgressStagesService = void 0;
const common_1 = require("@nestjs/common");
const driver_progress_stages_repository_1 = require("./driver_progress_stages.repository");
const createResponse_1 = require("../utils/createResponse");
const driver_progress_stage_entity_1 = require("./entities/driver_progress_stage.entity");
const drivers_repository_1 = require("../drivers/drivers.repository");
const orders_repository_1 = require("../orders/orders.repository");
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
let DriverProgressStagesService = class DriverProgressStagesService {
    constructor(driverProgressStagesRepository, driversRepository, ordersRepository, dataSource) {
        this.driverProgressStagesRepository = driverProgressStagesRepository;
        this.driversRepository = driversRepository;
        this.ordersRepository = ordersRepository;
        this.dataSource = dataSource;
    }
    calculateTotalEarns(stages) {
        return stages.reduce((total, stage) => {
            const tip = stage.details?.tip || 0;
            return total + tip;
        }, 0);
    }
    calculateTotalDistance(orders) {
        return orders.reduce((total, order) => {
            const distance = Number(order.distance || '0');
            return total + distance;
        }, 0);
    }
    calculateTimeSpent(stages) {
        return stages.reduce((total, stage) => {
            return total + (stage.duration || 0);
        }, 0);
    }
    getAddressLocation(address) {
        if (!address)
            return { lat: 0, lng: 0 };
        if (Array.isArray(address)) {
            const defaultAddress = address.find(a => a.is_default) || address[0];
            return defaultAddress?.location || { lat: 0, lng: 0 };
        }
        return address.location || { lat: 0, lng: 0 };
    }
    async create(createDto, transactionalEntityManager) {
        const manager = transactionalEntityManager || this.dataSource.manager;
        try {
            const initialStages = this.generateStagesForOrders(createDto.orders);
            const totalDistance = this.calculateTotalDistance(createDto.orders);
            const totalEarns = createDto.total_earns || 0;
            const estimatedTime = createDto.estimated_time_remaining || 0;
            const now = Math.floor(Date.now() / 1000);
            const stages = initialStages || [];
            const events = [];
            const orders = createDto.orders || [];
            const dps = manager.create(driver_progress_stage_entity_1.DriverProgressStage, {
                id: `FF_DPS_${(0, uuid_1.v4)()}`,
                driver_id: createDto.driver_id,
                stages,
                events,
                estimated_time_remaining: estimatedTime,
                total_distance_travelled: totalDistance,
                total_tips: 0,
                total_earns: totalEarns,
                created_at: now,
                updated_at: now,
                orders,
                current_state: createDto.current_state || 'driver_ready_order_1',
                previous_state: null,
                next_state: null,
                actual_time_spent: 0,
                transactions_processed: false
            });
            const savedStage = await manager.save(driver_progress_stage_entity_1.DriverProgressStage, dps);
            return (0, createResponse_1.createResponse)('OK', savedStage, 'Driver progress stage created successfully');
        }
        catch (err) {
            console.error('Error creating driver progress stage:', err);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error creating driver progress stage');
        }
    }
    async updateStage(stageId, updateData, transactionalEntityManager) {
        try {
            const manager = transactionalEntityManager || this.dataSource.manager;
            const existingStage = await manager
                .getRepository(driver_progress_stage_entity_1.DriverProgressStage)
                .findOne({
                where: { id: stageId },
                relations: ['orders']
            });
            if (!existingStage) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Progress stage not found');
            }
            const stages = updateData.stages || existingStage.stages || [];
            const orders = updateData.orders || existingStage.orders || [];
            const events = existingStage.events || [];
            const totalDistance = updateData.orders
                ? this.calculateTotalDistance(orders)
                : existingStage.total_distance_travelled || 0;
            const actualTimeSpent = updateData.stages
                ? this.calculateTimeSpent(stages)
                : existingStage.actual_time_spent || 0;
            const inProgressStage = stages.find(stage => stage.status === 'in_progress');
            const completedStages = stages.filter(stage => stage.status === 'completed');
            const lastCompletedStage = completedStages.length > 0
                ? completedStages.sort((a, b) => b.timestamp - a.timestamp)[0]
                : null;
            const currentState = inProgressStage
                ? inProgressStage.state
                : updateData.current_state || existingStage.current_state;
            const previousState = lastCompletedStage
                ? lastCompletedStage.state
                : updateData.previous_state || existingStage.previous_state;
            console.log('FIXED STATE VALUES IN SERVICE:');
            console.log(`- CURRENT STATE: ${currentState} (from in-progress stage)`);
            console.log(`- PREVIOUS STATE: ${previousState} (from completed stage)`);
            const updatedStage = await manager
                .getRepository(driver_progress_stage_entity_1.DriverProgressStage)
                .save({
                ...existingStage,
                current_state: currentState,
                orders,
                previous_state: previousState,
                next_state: updateData.next_state ?? existingStage.next_state ?? null,
                stages,
                events,
                estimated_time_remaining: Number(updateData.estimated_time_remaining ??
                    (existingStage.estimated_time_remaining || 0)),
                actual_time_spent: Number(actualTimeSpent),
                total_distance_travelled: Number(totalDistance.toFixed(4)),
                total_tips: Number((updateData.total_tips ?? (existingStage.total_tips || 0))
                    .toString()
                    .replace(/[^\d.-]/g, '')),
                total_earns: Number((updateData.total_earns ?? (existingStage.total_earns || 0))
                    .toString()
                    .replace(/[^\d.-]/g, '')),
                updated_at: Math.floor(Date.now() / 1000),
                transactions_processed: existingStage.transactions_processed || false
            });
            return (0, createResponse_1.createResponse)('OK', updatedStage, 'Driver progress stage updated successfully');
        }
        catch (err) {
            console.error('Error updating driver progress stage:', err);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error updating driver progress stage');
        }
    }
    generateStagesForOrders(orders, orderIndex = 0, completed = false) {
        const stages = [];
        const now = Math.floor(Date.now() / 1000);
        orders.forEach((order, index) => {
            const orderNum = orderIndex + index + 1;
            const restaurantLocation = this.getAddressLocation(order.restaurant?.address);
            const customerLocation = this.getAddressLocation(order.customer?.address);
            const baseStages = [
                {
                    state: `driver_ready_order_${orderNum}`,
                    status: completed ? 'completed' : 'pending',
                    timestamp: now,
                    duration: 0,
                    details: {
                        location: { lat: 0, lng: 0 },
                        estimated_time: Number(order.distance || '0') * 2,
                        actual_time: 0,
                        tip: 0,
                        notes: ''
                    }
                },
                {
                    state: `waiting_for_pickup_order_${orderNum}`,
                    status: 'pending',
                    timestamp: now,
                    duration: 0,
                    details: {
                        location: restaurantLocation,
                        estimated_time: Number(order.distance || '0') * 2,
                        actual_time: 0,
                        tip: 0,
                        notes: '',
                        restaurantDetails: {
                            id: order.restaurant?.id || '',
                            restaurant_name: order.restaurant?.restaurant_name || '',
                            address: order.restaurant?.address || null,
                            avatar: order.restaurant?.avatar || { url: '', key: '' },
                            contact_phone: order.restaurant?.contact_phone || []
                        }
                    }
                },
                {
                    state: `restaurant_pickup_order_${orderNum}`,
                    status: 'pending',
                    timestamp: now,
                    duration: 0,
                    details: {
                        location: restaurantLocation,
                        estimated_time: Number(order.distance || '0') * 2,
                        actual_time: 0,
                        tip: 0,
                        notes: '',
                        restaurantDetails: {
                            id: order.restaurant?.id || '',
                            restaurant_name: order.restaurant?.restaurant_name || '',
                            address: order.restaurant?.address || null,
                            avatar: order.restaurant?.avatar || { url: '', key: '' },
                            contact_phone: order.restaurant?.contact_phone || []
                        }
                    }
                },
                {
                    state: `en_route_to_customer_order_${orderNum}`,
                    status: 'pending',
                    timestamp: now,
                    duration: 0,
                    details: {
                        location: customerLocation,
                        estimated_time: Number(order.distance || '0') * 2,
                        actual_time: 0,
                        tip: 0,
                        notes: '',
                        customerDetails: {
                            id: order.customer?.id || '',
                            first_name: order.customer?.first_name || '',
                            last_name: order.customer?.last_name || '',
                            address: order.customer?.address || null,
                            avatar: order.customer?.avatar || null
                        }
                    }
                },
                {
                    state: `delivery_complete_order_${orderNum}`,
                    status: 'pending',
                    timestamp: now,
                    duration: 0,
                    details: {
                        location: customerLocation,
                        estimated_time: Number(order.distance || '0') * 2,
                        actual_time: 0,
                        tip: Number(order.driver_tips || '0'),
                        notes: '',
                        customerDetails: {
                            id: order.customer?.id || '',
                            first_name: order.customer?.first_name || '',
                            last_name: order.customer?.last_name || '',
                            address: order.customer?.address || null,
                            avatar: order.customer?.avatar || null
                        }
                    }
                }
            ];
            stages.push(...baseStages);
        });
        return stages;
    }
    async addOrderToExistingDPS(dpsId, order, transactionalEntityManager) {
        try {
            console.log('🔍 Fetching DPS with id:', dpsId);
            const dps = await transactionalEntityManager
                .getRepository(driver_progress_stage_entity_1.DriverProgressStage)
                .findOne({
                where: { id: dpsId },
                relations: ['orders']
            });
            if (!dps) {
                console.log('❌ DPS not found:', dpsId);
                throw new Error('DPS not found');
            }
            console.log('✅ DPS found:', dps.id, 'with orders:', dps.orders?.length);
            dps.orders = dps.orders || [];
            if (!dps.orders.some(o => o.id === order.id)) {
                dps.orders.push(order);
                console.log('✅ Added new order to DPS:', order.id);
            }
            else {
                console.log('⚠️ Order already exists in DPS:', order.id);
            }
            const newStages = this.generateStagesForOrders([order], dps.orders.length - 1, false);
            dps.stages = [...dps.stages, ...newStages];
            dps.total_distance_travelled = this.calculateTotalDistance(dps.orders);
            dps.updated_at = Math.floor(Date.now() / 1000);
            console.log('📋 New stages added:', JSON.stringify(newStages, null, 2));
            const updatedDPS = await transactionalEntityManager.save(driver_progress_stage_entity_1.DriverProgressStage, dps);
            console.log(`Updated DPS with new order: ${updatedDPS.id}`);
            const exists = await transactionalEntityManager
                .createQueryBuilder()
                .select('1')
                .from('driver_progress_orders', 'dpo')
                .where('dpo.driver_progress_id = :dpsId AND dpo.order_id = :orderId', {
                dpsId: updatedDPS.id,
                orderId: order.id
            })
                .getRawOne();
            if (!exists) {
                await transactionalEntityManager
                    .createQueryBuilder()
                    .insert()
                    .into('driver_progress_orders')
                    .values({
                    driver_progress_id: updatedDPS.id,
                    order_id: order.id
                })
                    .execute();
                console.log(`Saved order relation for DPS: ${updatedDPS.id}, order: ${order.id}`);
            }
            else {
                console.log(`Relation already exists for DPS: ${updatedDPS.id}, order: ${order.id}`);
            }
            return (0, createResponse_1.createResponse)('OK', updatedDPS, 'Order added to existing DPS');
        }
        catch (err) {
            console.error('Error adding order to DPS:', err);
            throw err;
        }
    }
    async getActiveStageByDriver(driverId) {
        try {
            const stage = await this.driverProgressStagesRepository.findByDriverId(driverId);
            if (!stage) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'No active stage found');
            }
            return (0, createResponse_1.createResponse)('OK', stage, 'Active stage found');
        }
        catch (err) {
            console.error('Error finding active stage:', err);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error finding active stage');
        }
    }
    async findAll() {
        try {
            const stages = await this.driverProgressStagesRepository.findAll();
            return (0, createResponse_1.createResponse)('OK', stages, 'Driver progress stages retrieved successfully');
        }
        catch (err) {
            console.error('Error fetching driver progress stages:', err);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching driver progress stages');
        }
    }
    async findById(id) {
        try {
            const stage = await this.driverProgressStagesRepository.findById(id);
            if (!stage) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Driver progress stage not found');
            }
            return (0, createResponse_1.createResponse)('OK', stage, 'Driver progress stage found');
        }
        catch (err) {
            console.error('Error fetching driver progress stage:', err);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error fetching driver progress stage');
        }
    }
    async remove(id) {
        try {
            const result = await this.driverProgressStagesRepository.remove(id);
            if (!result) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Driver progress stage not found');
            }
            return (0, createResponse_1.createResponse)('OK', null, 'Driver progress stage deleted successfully');
        }
        catch (err) {
            console.error('Error deleting driver progress stage:', err);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error deleting driver progress stage');
        }
    }
    async updateStages(stageId, updatedStages) {
        try {
            const stage = await this.driverProgressStagesRepository.findById(stageId);
            if (!stage) {
                return (0, createResponse_1.createResponse)('NotFound', null, 'Stage not found');
            }
            const totalEarns = this.calculateTotalEarns(updatedStages);
            const actualTimeSpent = this.calculateTimeSpent(updatedStages);
            const updatedStage = await this.driverProgressStagesRepository.update(stageId, {
                stages: updatedStages,
                total_earns: totalEarns,
                actual_time_spent: actualTimeSpent,
                updated_at: Math.floor(Date.now() / 1000)
            });
            return (0, createResponse_1.createResponse)('OK', updatedStage, 'Stages updated successfully');
        }
        catch (err) {
            console.error('Error updating stages:', err);
            return (0, createResponse_1.createResponse)('ServerError', null, 'Error updating stages');
        }
    }
};
exports.DriverProgressStagesService = DriverProgressStagesService;
exports.DriverProgressStagesService = DriverProgressStagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [driver_progress_stages_repository_1.DriverProgressStagesRepository,
        drivers_repository_1.DriversRepository,
        orders_repository_1.OrdersRepository,
        typeorm_1.DataSource])
], DriverProgressStagesService);
//# sourceMappingURL=driver_progress_stages.service.js.map