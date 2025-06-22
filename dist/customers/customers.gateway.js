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
var CustomersGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const customers_service_1 = require("./customers.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
let CustomersGateway = CustomersGateway_1 = class CustomersGateway {
    constructor(customersService, jwtService, eventEmitter) {
        this.customersService = customersService;
        this.jwtService = jwtService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(CustomersGateway_1.name);
        this.isListenerRegistered = false;
        this.logger.log('CustomersGateway initialized');
    }
    afterInit() {
        this.logger.log('CustomersGateway afterInit called');
        const listenerCount = this.eventEmitter.listenerCount('listenUpdateOrderTracking');
        this.logger.log(`Current listenUpdateOrderTracking listeners: ${listenerCount}`);
        if (listenerCount > 1) {
            this.logger.warn('Multiple listeners detected, removing all');
            this.eventEmitter.removeAllListeners('listenUpdateOrderTracking');
        }
        if (!this.isListenerRegistered) {
            this.eventEmitter.on('listenUpdateOrderTracking', this.handleListenUpdateOrderTracking.bind(this));
            this.isListenerRegistered = true;
            this.logger.log('Registered listener for listenUpdateOrderTracking');
        }
        this.server.setMaxListeners(300);
    }
    async onModuleDestroy() {
        this.eventEmitter.removeListener('listenUpdateOrderTracking', this.handleListenUpdateOrderTracking.bind(this));
        this.isListenerRegistered = false;
        this.logger.log('Removed listener for listenUpdateOrderTracking');
    }
    async validateToken(client) {
        try {
            const authHeader = client.handshake.headers.auth;
            if (!authHeader?.startsWith('Bearer ')) {
                this.logger.error('Invalid token format');
                client.disconnect();
                return null;
            }
            const token = authHeader.slice(7);
            if (!token) {
                this.logger.error('No token provided');
                client.disconnect();
                return null;
            }
            const decoded = await this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET
            });
            return decoded;
        }
        catch (error) {
            this.logger.error('Token validation error:', error.message);
            client.disconnect();
            return null;
        }
    }
    async handleConnection(client) {
        this.logger.log(`Client connected to customer namespace: ${client.id}`);
        const customerData = await this.validateToken(client);
        if (!customerData)
            return;
        const customerId = customerData.id;
        if (customerId) {
            client.join(`customer_${customerId}`);
            this.logger.log(`Customer auto-joined customer_${customerId} via token`);
        }
    }
    async handleCustomerPlaceOrder(order) {
        const customerId = order.customer_id;
        const trackingUpdate = {
            orderId: order.id,
            status: order.status,
            tracking_info: order.tracking_info,
            updated_at: order.updated_at,
            customer_id: order.customer_id,
            driver_id: order.driver_id,
            restaurant_id: order.restaurant_id,
            restaurantAddress: order.restaurantAddress,
            customerAddress: order.customerAddress,
            driverDetails: order.driverDetails
        };
        await this.server
            .to(`customer_${customerId}`)
            .emit('notifyOrderStatus', trackingUpdate);
        this.logger.log('Emitted newOrderForRestaurant via EventEmitter2:', {
            restaurant_id: order.restaurant_id,
            order: trackingUpdate
        });
        return {
            event: 'customerPlaceOrder',
            data: trackingUpdate,
            message: `customerPlaceOrder processed successfully`
        };
    }
    async handleListenUpdateOrderTracking(order) {
        this.logger.log('Received listenUpdateOrderTracking:', order);
        try {
            const customerId = order.customer_id;
            if (!customerId) {
                this.logger.error('Missing customer_id in order:', order);
                return;
            }
            const trackingUpdate = {
                ...order,
                orderId: order.orderId,
                status: order.status,
                tracking_info: order.tracking_info,
                updated_at: order.updated_at || Math.floor(Date.now() / 1000),
                customer_id: order.customer_id,
                driver_id: order.driver_id,
                restaurant_id: order.restaurant_id,
                restaurant_avatar: order.restaurant_avatar || null,
                driver_avatar: order.driver_avatar || null,
                restaurantAddress: order.restaurantAddress || null,
                customerAddress: order.customerAddress || null,
                driverDetails: order.driverDetails || null
            };
            await this.server
                .to(`customer_${customerId}`)
                .emit('notifyOrderStatus', trackingUpdate);
            this.logger.log(`Emitted notifyOrderStatus to customer_${customerId}`);
            return {
                event: 'notifyOrderStatus',
                data: trackingUpdate,
                message: `Notified customer ${customerId}`
            };
        }
        catch (error) {
            this.logger.error('Error in handleListenUpdateOrderTracking:', error);
        }
    }
};
exports.CustomersGateway = CustomersGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], CustomersGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('customerPlaceOrder'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomersGateway.prototype, "handleCustomerPlaceOrder", null);
__decorate([
    (0, event_emitter_1.OnEvent)('listenUpdateOrderTracking'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomersGateway.prototype, "handleListenUpdateOrderTracking", null);
exports.CustomersGateway = CustomersGateway = CustomersGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: 'customer',
        cors: {
            origin: ['*', process.env.FULL_BACKEND_URL],
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket']
    }),
    __metadata("design:paramtypes", [customers_service_1.CustomersService,
        jwt_1.JwtService,
        event_emitter_1.EventEmitter2])
], CustomersGateway);
//# sourceMappingURL=customers.gateway.js.map