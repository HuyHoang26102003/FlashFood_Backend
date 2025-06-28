import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsException
} from '@nestjs/websockets';
import { evaluate } from 'mathjs';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { DriversService } from './drivers.service';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OrdersService } from 'src/orders/orders.service';
import { DriverProgressStagesService } from 'src/driver_progress_stages/driver_progress_stages.service';
import {
  Order,
  OrderStatus,
  OrderTrackingInfo
} from 'src/orders/entities/order.entity';
import { DataSource, EntityManager } from 'typeorm';
import { DriverProgressStage } from 'src/driver_progress_stages/entities/driver_progress_stage.entity';
import { Driver } from './entities/driver.entity';
import { AddressBookRepository } from 'src/address_book/address_book.repository';
import { DriversRepository } from './drivers.repository';
import { StageDto } from 'src/driver_progress_stages/dto/create-driver-progress-stage.dto';
import { JwtService } from '@nestjs/jwt';
import { DriverStatsService } from 'src/driver_stats_records/driver_stats_records.service';
import { FinanceRulesService } from 'src/finance_rules/finance_rules.service';
import { FWalletsRepository } from 'src/fwallets/fwallets.repository';
import { TransactionService } from 'src/transactions/transactions.service';
import { FLASHFOOD_FINANCE, ADMIN_MOCK } from 'src/utils/constants';
import { createAdapter } from '@socket.io/redis-adapter';
import { NotificationsService } from 'src/notifications/notifications.service';
import { TargetUser } from 'src/notifications/entities/notification.entity';
import { RedisService } from 'src/redis/redis.service';
import { Logger } from '@nestjs/common';
import { UserRepository } from 'src/users/users.repository';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import * as fs from 'fs';
import * as path from 'path';
import { IMAGE_LINKS } from 'src/assets/image_urls';

const logger = new Logger('DriversGateway');

// Setup file logging
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, 'driver_gateway.log');

function logToFile(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
  fs.appendFileSync(logFile, logMessage);
}

@Injectable()
@WebSocketGateway({
  namespace: 'driver',
  cors: {
    origin: ['*', process.env.FULL_BACKEND_URL],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket'],
  pingTimeout: 180000,
  pingInterval: 30000,
  maxHttpBufferSize: 1e6,
  logger: {
    error: (msg, context) =>
      console.error(`[Socket.IO Error] ${context}: ${msg}`),
    warn: (msg, context) => console.warn(`[Socket.IO Warn] ${context}: ${msg}`),
    info: (msg, context) => console.info(`[Socket.IO Info] ${context}: ${msg}`),
    debug: (msg, context) =>
      console.debug(`[Socket.IO Debug] ${context}: ${msg}`)
  }
})
export class DriversGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  private server: Server;
  private driverSockets: Map<string, Set<string>> = new Map();
  private notificationLock = new Map<string, boolean>();
  private activeConnections = new Map<string, Socket>();
  private dpsCreationLocks = new Set<string>();
  private processingOrders: Set<string> = new Set();
  private processedEvents = new Map<string, number>();
  private isListenerRegistered = false;
  private redisClient: any;

  constructor(
    @Inject('SOCKET_SERVER') private socketServer: any,
    @Inject(forwardRef(() => RestaurantsService))
    private readonly restaurantsService: RestaurantsService,
    @Inject(forwardRef(() => DriversService))
    private readonly driverService: DriversService,
    private readonly driverRepository: DriversRepository,
    private readonly driverStatsService: DriverStatsService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
    private readonly financeRulesService: FinanceRulesService,
    private readonly fWalletsRepository: FWalletsRepository,
    private readonly transactionsService: TransactionService,
    private readonly driverProgressStageService: DriverProgressStagesService,
    private readonly dataSource: DataSource,
    private readonly addressBookRepository: AddressBookRepository,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => UserRepository))
    private readonly userRepository: UserRepository,
    private readonly notificationsService: NotificationsService
  ) {
    logger.log('DriversGateway constructor called');
    logger.log('Checking injected dependencies:');
    logger.log(
      '- driverProgressStageRepository:',
      !!this.driverProgressStageService
    );
    logger.log(
      '- driverProgressStageService:',
      !!this.driverProgressStageService
    );
    logger.log('- transactionsService:', !!this.transactionsService);
    logger.log('- ordersService:', !!this.ordersService);
    logger.log('- fWalletsRepository:', !!this.fWalletsRepository);
    logger.log('- server:', !!this.server);
    this.redisClient = this.redisService.getClient();
  }

  afterInit() {
    console.log('[DriversGateway] Initialized');
    if (!this.server) {
      console.error(
        '[DriversGateway] WebSocket server is null after initialization'
      );
      return;
    }
    try {
      const pubClient = this.redisService.getClient();
      const subClient = pubClient.duplicate();
      let retryCount = 0;
      const maxRetries = 3;
      const connectRedis = async () => {
        try {
          if (subClient.isOpen) {
            console.log(
              '[DriversGateway] Redis subClient already open, skipping connect'
            );
          } else {
            await subClient.connect();
            console.log('[DriversGateway] Redis subClient connected');
          }
          const redisAdapter = createAdapter(pubClient, subClient);
          this.server.adapter(redisAdapter);
          console.log(
            '[DriversGateway] Socket.IO Redis adapter initialized successfully'
          );
        } catch (err: any) {
          if (retryCount < maxRetries) {
            retryCount++;
            console.warn(
              `[DriversGateway] Retrying Redis connection (${retryCount}/${maxRetries})...`
            );
            setTimeout(connectRedis, 2000);
          } else {
            console.error(
              '[DriversGateway] Failed to initialize Redis adapter after retries:',
              err.message
            );
          }
        }
      };
      connectRedis();
    } catch (err: any) {
      console.error(
        '[DriversGateway] Error setting up Redis adapter:',
        err.message
      );
    }
    // Set max listeners to prevent memory leak
    this.server.setMaxListeners(50); // Reduced to a reasonable limit
    this.registerEventListeners();
  }

  private registerEventListeners() {
    if (this.isListenerRegistered) {
      console.log(
        '[DriversGateway] Event listeners already registered, skipping'
      );
      return;
    }
    this.eventEmitter.removeAllListeners('order.assignedToDriver');
    this.eventEmitter.on(
      'order.assignedToDriver',
      this.handleOrderAssignedToDriver.bind(this)
    );

    this.eventEmitter.removeAllListeners('driver.receivedTip');
    this.eventEmitter.on(
      'driver.receivedTip',
      this.handleDriverReceivedTip.bind(this)
    );

    this.isListenerRegistered = true;
    console.log(
      '[DriversGateway] Registered event listeners for order.assignedToDriver and driver.receivedTip'
    );
  }

  async onModuleDestroy() {
    this.eventEmitter.removeListener(
      'order.assignedToDriver',
      this.handleOrderAssignedToDriver.bind(this)
    );
    this.eventEmitter.removeListener(
      'driver.receivedTip',
      this.handleDriverReceivedTip.bind(this)
    );
    this.isListenerRegistered = false;
    if (this.redisClient && this.redisClient.isOpen) {
      await this.redisClient.quit();
    }
    console.log(
      '[DriversGateway] Removed event listeners and closed Redis connection'
    );
  }

  private async validateToken(client: Socket): Promise<any> {
    try {
      const authHeader = client.handshake.headers.auth as string;
      if (!authHeader?.startsWith('Bearer ')) {
        throw new WsException('Invalid token');
      }
      const token = authHeader.slice(7);
      if (!token) {
        throw new WsException('No token provided');
      }
      const decoded = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET
      });
      return decoded;
    } catch (error: any) {
      console.error('[DriversGateway] Token validation error:', error.message);
      throw new WsException('Token validation failed');
    }
  }

  async handleConnection(client: Socket) {
    try {
      console.log('⚡️ Client connected to driver namespace: ID:', client.id);
      const driverData = await this.validateToken(client);
      if (!driverData) {
        console.log(
          '[DriversGateway] Invalid token, disconnecting:',
          client.id
        );
        client.disconnect(true);
        return false;
      }

      const driverId = driverData.id;
      console.log(
        `[DriversGateway] Driver ${driverId} attempting connection:`,
        client.id
      );

      // Lock for connection handling
      const lockKey = `lock:driver:connect:${driverId}`;
      const maxRetries = 8; // Increased for better contention handling
      const baseRetryDelay = 1500; // Increased base delay
      const lockTTL = 15000; // Increased TTL to 15 seconds

      let lockAcquired = false;
      let retryCount = 0;

      while (!lockAcquired && retryCount < maxRetries) {
        lockAcquired = await this.redisService.setNx(
          lockKey,
          client.id,
          lockTTL
        );
        if (!lockAcquired) {
          const existingId = await this.redisService.get(lockKey);
          if (existingId && existingId !== client.id) {
            const existingSocket = this.activeConnections.get(existingId);
            if (existingSocket?.connected) {
              console.log(
                `[DriversGateway] Existing connection for driver ${driverId} with socket ${existingId}, waiting`
              );
              // Add jitter to retry delay
              const jitter = Math.random() * 100;
              await new Promise(resolve =>
                setTimeout(resolve, baseRetryDelay + jitter)
              );
              retryCount++;
              console.log(
                `[DriversGateway] Retrying lock for driver ${driverId} (${retryCount}/${maxRetries})`
              );
              continue;
            }
            console.log(
              `[DriversGateway] Clearing stale lock for driver ${driverId}`
            );
            await this.redisService.del(lockKey); // Clear stale lock
          }
          retryCount++;
          const jitter = Math.random() * 100;
          console.log(
            `[DriversGateway] Retrying lock for driver ${driverId} (${retryCount}/${maxRetries})`
          );
          await new Promise(resolve =>
            setTimeout(resolve, baseRetryDelay + jitter)
          );
        }
      }

      if (!lockAcquired) {
        console.error(
          `[DriversGateway] Failed to acquire lock for driver ${driverId} after ${maxRetries} retries, disconnecting ${client.id}`
        );
        client.emit('connection_rejected', {
          reason: 'Too many connection attempts'
        });
        client.disconnect(true);
        return false;
      }

      try {
        // Check existing clients
        const clients = await this.server
          .in(`driver_${driverId}`)
          .fetchSockets();
        if (clients.length > 0) {
          console.log(
            `[DriversGateway] Existing clients in room driver_${driverId}, cleaning up`
          );
          await this.cleanupDriverConnections(driverId, client.id);
        }

        // Join room
        await client.join(`driver_${driverId}`);
        console.log(`Driver auto-joined driver_${driverId}`);

        // Update socket set
        let socketSet = this.driverSockets.get(driverId);
        if (!socketSet) {
          socketSet = new Set();
          this.driverSockets.set(driverId, socketSet);
        }
        socketSet.add(client.id);
        console.log(
          `[DriversGateway] Updated socket set for driver ${driverId}:`,
          socketSet
        );

        // Store active connection
        this.activeConnections.set(client.id, client);

        // Limit disconnect listeners to prevent memory leak
        client.setMaxListeners(10);

        // Log clients
        const updatedClients = await this.server
          .in(`driver_${driverId}`)
          .fetchSockets();
        console.log(
          `[DriversGateway] Clients in room driver_${driverId}:`,
          updatedClients.length
        );

        // Emit connected event
        client.emit('connected', { driverId, status: 'connected' });
        return true;
      } finally {
        await this.redisService.del(lockKey);
      }
    } catch (error: any) {
      console.error('[DriversGateway] Connection error:', error.message);
      client.emit('connection_error', { reason: error.message });
      client.disconnect(true);
      return false;
    }
  }

  // Replace cleanupDriverConnections
  async cleanupDriverConnections(driverId: string, newSocketId: string) {
    console.log(
      `[DriversGateway] Cleaning up connections for driver ${driverId}`
    );
    const socketSet = this.driverSockets.get(driverId) || new Set();
    const existingSockets = await this.server
      .in(`driver_${driverId}`)
      .fetchSockets();

    for (const socket of existingSockets) {
      if (socket.id !== newSocketId) {
        const activeSocket = this.activeConnections.get(socket.id);
        if (activeSocket?.connected) {
          console.log(
            `[DriversGateway] Disconnecting old socket ${socket.id} for driver ${driverId}`
          );
          activeSocket.emit('force_disconnect', {
            reason: 'New connection established'
          });
          await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay for event delivery
          activeSocket.leave(`driver_${driverId}`);
          activeSocket.disconnect(true);
          this.activeConnections.delete(socket.id);
          socketSet.delete(socket.id);
        }
      }
    }

    if (socketSet.size === 0) {
      this.driverSockets.delete(driverId);
    }
    console.log(
      `[DriversGateway] Updated socket set for driver ${driverId}:`,
      socketSet
    );

    this.notificationLock.delete(`notify_${driverId}`);
    this.processingOrders.forEach(lock => {
      if (lock.startsWith(`${driverId}_`)) {
        this.processingOrders.delete(lock);
      }
    });
    this.dpsCreationLocks.delete(driverId);
  }

  // Update handleDisconnect
  handleDisconnect(client: Socket) {
    console.log(`[DriversGateway] Driver disconnected: ${client.id}`);
    const driverId = Array.from(this.driverSockets.entries()).find(
      ([_, sockets]) => sockets.has(client.id)
    )?.[0];

    this.activeConnections.delete(client.id);

    if (driverId) {
      const socketSet = this.driverSockets.get(driverId);
      if (socketSet) {
        socketSet.delete(client.id);
        if (socketSet.size === 0) {
          this.driverSockets.delete(driverId);
        }
        console.log(
          `[DriversGateway] Updated socket set for driver ${driverId}:`,
          socketSet
        );
      }
      client.leave(`driver_${driverId}`);
      // Remove only specific listeners to prevent leaks
      client.removeAllListeners('updateDriverProgress');
      client.removeAllListeners('driverAcceptOrder');
      client.removeAllListeners('newOrderForDriver');

      this.processingOrders.forEach(lock => {
        if (lock.startsWith(`${driverId}_`)) {
          this.processingOrders.delete(lock);
        }
      });
      this.notificationLock.delete(`notify_${driverId}`);
      this.dpsCreationLocks.delete(driverId);
    }
  }

  // Replace deduplicateEvent
  private async deduplicateEvent(
    stageId: string,
    timeoutMs: number = 5000
  ): Promise<boolean> {
    const lockKey = `lock:dps:${stageId}`;
    const isLocked = await this.redisService.setNx(
      lockKey,
      'locked',
      Math.ceil(timeoutMs / 1000)
    );
    console.log(
      `[DriversGateway] Deduplicate event for stage ${stageId}: ${isLocked ? 'Locked' : 'Skipped'}`
    );
    return !!isLocked;
  }

  @SubscribeMessage('newOrderForDriver')
  async handleNewOrder(@MessageBody() order: any) {
    const driverId = order.driver_id;
    if (this.server) {
      this.server.to(driverId).emit('incomingOrder', order);
      console.log(
        '[DriversGateway] Emitted incomingOrder to driver:',
        driverId
      );
    } else {
      console.error(
        '[DriversGateway] WebSocket server is null, cannot emit incomingOrder'
      );
    }
    return order;
  }

  async notifyPartiesOnce(order: Order) {
    try {
      if (!order || !order.id) {
        console.error('[DriversGateway] Invalid order in notifyPartiesOnce');
        return;
      }

      const lockKey = `notify_${order.id}`;
      if (this.notificationLock.get(lockKey)) {
        console.log(
          `[DriversGateway] Notification for order ${order.id} already in progress, skipping`
        );
        return;
      }

      this.notificationLock.set(lockKey, true);

      try {
        // Fetch order without optimistic locking
        const orderData = await this.dataSource.getRepository(Order).findOne({
          where: { id: order.id },
          relations: [
            'restaurant',
            'driver',
            'customer',
            'restaurantAddress',
            'customerAddress'
          ]
        });

        if (!orderData) {
          console.error(
            `[DriversGateway] Order ${order.id} not found in notifyPartiesOnce`
          );
          return;
        }

        const { restaurant, driver, customer } = orderData;

        if (driver?.id && this.server) {
          const driverRoom = `driver_${driver.id}`;
          const driverClients = await this.server.in(driverRoom).fetchSockets();
          console.log(
            `[DriversGateway] Notifying driver ${driver.id}, clients in room: ${driverClients.length}`
          );
          await this.server.to(driverRoom).emit('driverStagesUpdated', {
            ...orderData,
            ...order,
            orderId: order.id,
            status: orderData.status,
            tracking_info: orderData.tracking_info
          });
        }

        if (restaurant?.id && this.server) {
          const restaurantRoom = `restaurant_${restaurant.id}`;
          const restaurantClients = await this.server
            .in(restaurantRoom)
            .fetchSockets();
          console.log(
            `[DriversGateway] Notifying restaurant ${restaurant.id}, clients in room: ${restaurantClients.length}`
          );
          await this.server.to(restaurantRoom).emit('orderStatusUpdated', {
            orderId: order.id,
            status: orderData.status,
            tracking_info: orderData.tracking_info
          });
        }

        if (customer?.id && this.server) {
          const customerRoom = `customer_${customer.id}`;
          const customerClients = await this.server
            .in(customerRoom)
            .fetchSockets();
          console.log(
            `[DriversGateway] Notifying customer ${customer.id}, clients in room: ${customerClients.length}`
          );
          await this.server.to(customerRoom).emit('orderStatusUpdated', {
            orderId: order.id,
            status: orderData.status,
            tracking_info: orderData.tracking_info
          });
        }
      } finally {
        this.notificationLock.delete(lockKey);
      }
    } catch (err: any) {
      console.error('[DriversGateway] Error in notifyPartiesOnce:', err);
    }
  }

  @SubscribeMessage('updateDriverProgress')
  async handleDriverProgressUpdate(
    @MessageBody() data: { stageId: string; orderId?: string }
  ) {
    const startTime = Date.now();
    const requestId = `${data.stageId}_${startTime}`;

    logToFile('=== DRIVER PROGRESS UPDATE START ===', {
      requestId,
      stageId: data.stageId,
      orderId: data.orderId,
      timestamp: new Date().toISOString(),
      startTime
    });

    logger.log('Received updateDriverProgress event:', {
      stageId: data.stageId,
      orderId: data.orderId
    });

    try {
      // Deduplicate events
      logToFile('[DEDUPLICATION] Checking for duplicate events', {
        requestId,
        stageId: data.stageId
      });

      const isUnique = await this.deduplicateEvent(data.stageId);
      if (!isUnique) {
        logToFile('[DEDUPLICATION] Duplicate event detected - SKIPPING', {
          requestId,
          stageId: data.stageId
        });
        logger.warn(
          `[DriversGateway] Duplicate updateDriverProgress event for stage ${data.stageId}, skipping`
        );
        return { success: false, message: 'Duplicate event' };
      }

      logToFile('[DEDUPLICATION] Event is unique - PROCEEDING', {
        requestId,
        stageId: data.stageId
      });

      const maxRetries = 3;
      let attempt = 0;

      while (attempt < maxRetries) {
        try {
          return await this.dataSource.transaction(
            async transactionalEntityManager => {
              logToFile(
                '[TRANSACTION] Starting transaction for driver progress update',
                {
                  requestId,
                  stageId: data.stageId,
                  attempt: attempt + 1,
                  maxRetries
                }
              );

              logger.log('Starting transaction for driver progress update', {
                stageId: data.stageId
              });

              // Fetch DPS
              logToFile('[DPS_FETCH] Fetching DPS with orders', {
                requestId,
                stageId: data.stageId
              });

              const dps = await transactionalEntityManager
                .getRepository(DriverProgressStage)
                .findOne({
                  where: { id: data.stageId },
                  relations: ['orders']
                });

              logToFile('[DPS_FETCH] DPS fetch result', {
                requestId,
                stageId: data.stageId,
                dpsExists: !!dps,
                dpsId: dps?.id,
                driverId: dps?.driver_id,
                ordersCount: dps?.orders?.length || 0,
                currentState: dps?.current_state,
                previousState: dps?.previous_state,
                nextState: dps?.next_state,
                estimatedTimeRemaining: dps?.estimated_time_remaining,
                actualTimeSpent: dps?.actual_time_spent,
                totalDistance: dps?.total_distance_travelled,
                totalTips: dps?.total_tips,
                totalEarns: dps?.total_earns,
                transactionsProcessed: dps?.transactions_processed
              });

              if (!dps || !dps.orders || dps.orders.length === 0) {
                logToFile('[DPS_FETCH] DPS or orders not found - ABORTING', {
                  requestId,
                  stageId: data.stageId,
                  dpsExists: !!dps,
                  ordersExist: dps?.orders?.length > 0
                });

                logger.warn('Stage or orders not found:', {
                  stageId: data.stageId,
                  dpsExists: !!dps,
                  ordersExist: dps?.orders?.length > 0
                });
                return {
                  success: false,
                  message: !dps
                    ? 'Stage not found'
                    : 'No orders associated with this stage'
                };
              }

              // Validate driver_id
              if (!dps.driver_id) {
                logger.error(
                  `[DriversGateway] No driver_id found for stage ${data.stageId}`
                );
                return { success: false, message: 'Invalid driver_id' };
              }

              // Load order relations
              logToFile('[ORDER_RELATIONS] Loading order relations', {
                requestId,
                orderIds: dps.orders.map(o => o.id),
                orderCount: dps.orders.length
              });

              for (const order of dps.orders) {
                logToFile('[ORDER_RELATIONS] Loading relations for order', {
                  requestId,
                  orderId: order.id,
                  currentStatus: order.status,
                  currentTrackingInfo: order.tracking_info
                });

                const loadedOrder = await transactionalEntityManager
                  .getRepository(Order)
                  .findOne({
                    where: { id: order.id },
                    relations: [
                      'restaurant',
                      'driver',
                      'customer',
                      'restaurantAddress',
                      'customerAddress'
                    ]
                  });
                if (loadedOrder) {
                  order.restaurant = loadedOrder.restaurant;
                  order.driver = loadedOrder.driver;
                  order.customer = loadedOrder.customer;
                  order.restaurantAddress = loadedOrder.restaurantAddress;
                  order.customerAddress = loadedOrder.customerAddress;

                  logToFile('[ORDER_RELATIONS] Relations loaded successfully', {
                    requestId,
                    orderId: order.id,
                    hasRestaurant: !!order.restaurant,
                    hasDriver: !!order.driver,
                    hasCustomer: !!order.customer,
                    hasRestaurantAddress: !!order.restaurantAddress,
                    hasCustomerAddress: !!order.customerAddress
                  });
                } else {
                  logToFile(
                    '[ORDER_RELATIONS] Failed to load order relations',
                    {
                      requestId,
                      orderId: order.id
                    }
                  );
                }
              }

              logToFile('[DPS_ORDERS] All orders with full details', {
                requestId,
                orders: dps.orders.map(order => ({
                  id: order.id,
                  status: order.status,
                  tracking_info: order.tracking_info,
                  distance: order.distance,
                  restaurant_id: order.restaurant_id,
                  customer_id: order.customer_id,
                  driver_id: order.driver_id,
                  created_at: order.created_at,
                  updated_at: order.updated_at
                }))
              });

              logger.log('Found driver progress stage:', {
                id: dps.id,
                driverId: dps.driver_id,
                ordersCount: dps.orders.length
              });

              const timestamp = Math.floor(Date.now() / 1000);
              const stageOrder = [
                'driver_ready',
                'waiting_for_pickup',
                'restaurant_pickup',
                'en_route_to_customer',
                'delivery_complete'
              ];
              // CRITICAL FIX: Different mappings for first order vs subsequent orders
              const getStatusForStage = (
                stageBase: string,
                orderSuffix: string
              ) => {
                const isFirstOrder = orderSuffix === 'order_1';

                if (isFirstOrder) {
                  // CRITICAL FIX: Map completed stage to resulting order status
                  switch (stageBase) {
                    case 'driver_ready':
                      return OrderStatus.READY_FOR_PICKUP; // driver_ready completes → READY_FOR_PICKUP
                    case 'waiting_for_pickup':
                      return OrderStatus.RESTAURANT_PICKUP; // waiting_for_pickup completes → RESTAURANT_PICKUP
                    case 'restaurant_pickup':
                      return OrderStatus.EN_ROUTE; // restaurant_pickup completes → EN_ROUTE
                    case 'en_route_to_customer':
                      return OrderStatus.DELIVERED; // en_route_to_customer completes → DELIVERED
                    case 'delivery_complete':
                      return OrderStatus.DELIVERED; // delivery_complete completes → DELIVERED
                    default:
                      return OrderStatus.DISPATCHED;
                  }
                } else {
                  // CRITICAL FIX: Subsequent orders progression mapping
                  switch (stageBase) {
                    case 'driver_ready':
                      return OrderStatus.RESTAURANT_PICKUP; // READY_FOR_PICKUP → RESTAURANT_PICKUP (subsequent orders)
                    case 'waiting_for_pickup':
                      return OrderStatus.EN_ROUTE; // RESTAURANT_PICKUP → EN_ROUTE (FIXED!)
                    case 'restaurant_pickup':
                      return OrderStatus.DELIVERED; // EN_ROUTE → DELIVERED (FIXED!)
                    case 'en_route_to_customer':
                      return OrderStatus.DELIVERED;
                    case 'delivery_complete':
                      return OrderStatus.DELIVERED;
                    default:
                      return OrderStatus.READY_FOR_PICKUP;
                  }
                }
              };

              const getTrackingInfoForStage = (
                stageBase: string,
                orderSuffix: string
              ) => {
                const isFirstOrder = orderSuffix === 'order_1';

                if (isFirstOrder) {
                  // CRITICAL FIX: Map completed stage to resulting tracking info
                  switch (stageBase) {
                    case 'driver_ready':
                      return OrderTrackingInfo.PREPARING; // driver_ready completes → PREPARING
                    case 'waiting_for_pickup':
                      return OrderTrackingInfo.RESTAURANT_PICKUP; // waiting_for_pickup completes → RESTAURANT_PICKUP
                    case 'restaurant_pickup':
                      return OrderTrackingInfo.EN_ROUTE; // restaurant_pickup completes → EN_ROUTE
                    case 'en_route_to_customer':
                      return OrderTrackingInfo.DELIVERED; // en_route_to_customer completes → DELIVERED
                    case 'delivery_complete':
                      return OrderTrackingInfo.DELIVERED; // delivery_complete completes → DELIVERED
                    default:
                      return OrderTrackingInfo.DISPATCHED;
                  }
                } else {
                  // CRITICAL FIX: Subsequent orders tracking progression mapping
                  switch (stageBase) {
                    case 'driver_ready':
                      return OrderTrackingInfo.RESTAURANT_PICKUP; // READY_FOR_PICKUP → RESTAURANT_PICKUP (subsequent orders)
                    case 'waiting_for_pickup':
                      return OrderTrackingInfo.EN_ROUTE; // RESTAURANT_PICKUP → EN_ROUTE (FIXED!)
                    case 'restaurant_pickup':
                      return OrderTrackingInfo.DELIVERED; // EN_ROUTE → DELIVERED (FIXED!)
                    case 'en_route_to_customer':
                      return OrderTrackingInfo.DELIVERED;
                    case 'delivery_complete':
                      return OrderTrackingInfo.DELIVERED;
                    default:
                      return OrderTrackingInfo.PREPARING;
                  }
                }
              };

              logToFile('[TARGET_ORDER] Determining target order', {
                requestId,
                providedOrderId: data.orderId,
                availableOrders: dps.orders.map(o => o.id),
                stagesSnapshot: dps.stages.map(s => ({
                  state: s.state,
                  status: s.status
                }))
              });

              // FIXED: Completely rewrite order targeting logic to avoid array index confusion
              let targetOrderId = data.orderId;

              // Create a mapping of order IDs to their stage suffixes based on creation order
              const orderStageMapping = new Map<string, string>();
              const sortedOrders = [...dps.orders].sort(
                (a, b) => a.created_at - b.created_at
              );

              for (const [index, order] of sortedOrders.entries()) {
                orderStageMapping.set(order.id, `order_${index + 1}`);
              }

              logToFile('[TARGET_ORDER] Order stage mapping created', {
                requestId,
                orderStageMapping: Array.from(orderStageMapping.entries()),
                sortedOrderIds: sortedOrders.map(o => o.id)
              });

              if (!targetOrderId) {
                // CRITICAL FIX: Prioritize orders that need progression
                // First, find orders with in-progress stages
                for (const order of sortedOrders) {
                  const orderSuffix = orderStageMapping.get(order.id);
                  const hasInProgressStage = dps.stages.some(
                    stage =>
                      stage.state.includes(orderSuffix) &&
                      stage.status === 'in_progress'
                  );

                  if (hasInProgressStage) {
                    targetOrderId = order.id;
                    logToFile(
                      '[TARGET_ORDER] Found order with in-progress stage',
                      {
                        requestId,
                        orderId: order.id,
                        orderSuffix
                      }
                    );
                    break;
                  }
                }

                // CRITICAL FIX: If no in-progress stage, find orders that can progress
                if (!targetOrderId) {
                  for (const order of sortedOrders) {
                    const orderSuffix = orderStageMapping.get(order.id);

                    // Check if this order has a stage that can be started based on its current status
                    let canProgress = false;
                    let expectedStage = '';

                    switch (order.status) {
                      case OrderStatus.READY_FOR_PICKUP:
                        expectedStage = `driver_ready_${orderSuffix}`;
                        break;
                      case OrderStatus.RESTAURANT_PICKUP:
                        expectedStage = `restaurant_pickup_${orderSuffix}`;
                        break;
                      case OrderStatus.EN_ROUTE:
                        expectedStage = `en_route_to_customer_${orderSuffix}`;
                        break;
                      case OrderStatus.DISPATCHED:
                        expectedStage = `driver_ready_${orderSuffix}`;
                        break;
                    }

                    if (expectedStage) {
                      const stage = dps.stages.find(
                        s => s.state === expectedStage
                      );
                      if (
                        stage &&
                        (stage.status === 'pending' ||
                          stage.status === 'in_progress')
                      ) {
                        canProgress = true;
                      }
                    }

                    if (canProgress) {
                      targetOrderId = order.id;
                      logToFile(
                        '[TARGET_ORDER] Found order that can progress',
                        {
                          requestId,
                          orderId: order.id,
                          orderSuffix,
                          orderStatus: order.status,
                          expectedStage,
                          stageStatus: dps.stages.find(
                            s => s.state === expectedStage
                          )?.status
                        }
                      );
                      break;
                    }
                  }
                }

                // If still no target, find first incomplete order
                if (!targetOrderId) {
                  for (const order of sortedOrders) {
                    const orderSuffix = orderStageMapping.get(order.id);
                    const finalState = `delivery_complete_${orderSuffix}`;
                    const finalStage = dps.stages.find(
                      s => s.state === finalState
                    );

                    if (!finalStage || finalStage.status !== 'completed') {
                      targetOrderId = order.id;
                      logToFile('[TARGET_ORDER] Found incomplete order', {
                        requestId,
                        orderId: order.id,
                        orderSuffix,
                        finalStageStatus: finalStage?.status || 'not_found'
                      });
                      break;
                    }
                  }
                }

                // Fallback to first order
                if (!targetOrderId) {
                  targetOrderId = sortedOrders[0].id;
                  logToFile('[TARGET_ORDER] Fallback to first order', {
                    requestId,
                    orderId: targetOrderId
                  });
                }
              }

              logToFile('[TARGET_ORDER] Target order determined', {
                requestId,
                targetOrderId,
                targetOrderSuffix: orderStageMapping.get(targetOrderId)
              });

              let updatedStages = [...dps.stages];
              let allCompleted = true;

              logToFile(
                '[STAGE_PROCESSING] Starting stage processing for all orders',
                {
                  requestId,
                  totalOrders: dps.orders.length,
                  initialStagesCount: updatedStages.length,
                  orderStageMapping: Array.from(orderStageMapping.entries())
                }
              );

              // FIXED: Process each order using consistent stage mapping
              for (const order of sortedOrders) {
                const orderSuffix = orderStageMapping.get(order.id);

                logToFile('[ORDER_PROCESSING] Processing order', {
                  requestId,
                  orderId: order.id,
                  orderSuffix,
                  isTargetOrder: order.id === targetOrderId,
                  currentStatus: order.status,
                  currentTrackingInfo: order.tracking_info
                });

                let currentStageIndex = stageOrder.findIndex(baseState => {
                  const state = `${baseState}_${orderSuffix}`;
                  const stage = updatedStages.find(s => s.state === state);
                  return stage && stage.status === 'in_progress';
                });

                logToFile('[STAGE_DETECTION] Current stage detection', {
                  requestId,
                  orderId: order.id,
                  currentStageIndex,
                  currentStageState:
                    currentStageIndex >= 0
                      ? `${stageOrder[currentStageIndex]}_${orderSuffix}`
                      : 'none',
                  allStagesForOrder: updatedStages
                    .filter(s => s.state.includes(orderSuffix))
                    .map(s => ({ state: s.state, status: s.status }))
                });

                // CRITICAL FIX: Handle stage detection for target order
                if (order.id === targetOrderId) {
                  logToFile(
                    '[TARGET_ORDER_STAGE_DETECTION] Processing target order stage detection',
                    {
                      requestId,
                      orderId: order.id,
                      orderSuffix,
                      currentStageIndex,
                      orderStatus: order.status,
                      orderTrackingInfo: order.tracking_info
                    }
                  );

                  // CRITICAL FIX: ALWAYS check if current stage matches order status (not just when currentStageIndex === -1)
                  // This fixes the async lag bug for subsequent orders
                  let shouldRecalculateStage = currentStageIndex === -1;
                  const isFirstOrder = orderSuffix === 'order_1';

                  // For subsequent orders, also check if the current stage matches the expected stage for the order status
                  if (!shouldRecalculateStage && !isFirstOrder) {
                    const currentStageBase =
                      currentStageIndex >= 0
                        ? stageOrder[currentStageIndex]
                        : '';
                    let expectedStageForStatus = '';

                    switch (order.status) {
                      case OrderStatus.READY_FOR_PICKUP:
                        expectedStageForStatus = 'driver_ready';
                        break;
                      case OrderStatus.RESTAURANT_PICKUP:
                        expectedStageForStatus = 'waiting_for_pickup';
                        break;
                      case OrderStatus.EN_ROUTE:
                        expectedStageForStatus = 'restaurant_pickup';
                        break;
                      case OrderStatus.DELIVERED:
                        expectedStageForStatus = 'en_route_to_customer';
                        break;
                    }

                    if (
                      expectedStageForStatus &&
                      currentStageBase !== expectedStageForStatus
                    ) {
                      shouldRecalculateStage = true;
                      logToFile(
                        '[STAGE_DETECTION] Stage mismatch detected for subsequent order',
                        {
                          requestId,
                          orderId: order.id,
                          orderStatus: order.status,
                          currentStageBase,
                          expectedStageForStatus,
                          willRecalculate: true
                        }
                      );
                    }
                  }

                  if (shouldRecalculateStage) {
                    logToFile(
                      '[STAGE_DETECTION] No in-progress stage found, determining from order status',
                      {
                        requestId,
                        orderId: order.id,
                        orderStatus: order.status,
                        orderTrackingInfo: order.tracking_info
                      }
                    );

                    // CRITICAL FIX: Map order status to the CORRECT stage based on order type
                    let expectedCurrentStage = '';
                    const isFirstOrder = orderSuffix === 'order_1';

                    if (isFirstOrder) {
                      // First order: status matches stage progression exactly
                      switch (order.status) {
                        case OrderStatus.DISPATCHED:
                          expectedCurrentStage = 'driver_ready';
                          break;
                        case OrderStatus.READY_FOR_PICKUP:
                          expectedCurrentStage = 'waiting_for_pickup';
                          break;
                        case OrderStatus.RESTAURANT_PICKUP:
                          expectedCurrentStage = 'restaurant_pickup';
                          break;
                        case OrderStatus.EN_ROUTE:
                          expectedCurrentStage = 'en_route_to_customer';
                          break;
                        case OrderStatus.DELIVERED:
                          expectedCurrentStage = 'delivery_complete';
                          break;
                        default:
                          expectedCurrentStage = 'driver_ready';
                      }
                    } else {
                      // CRITICAL FIX: Subsequent orders have different stage-to-status mapping
                      switch (order.status) {
                        case OrderStatus.READY_FOR_PICKUP:
                          expectedCurrentStage = 'driver_ready'; // Subsequent orders start with READY_FOR_PICKUP but driver_ready stage pending
                          break;
                        case OrderStatus.RESTAURANT_PICKUP:
                          expectedCurrentStage = 'waiting_for_pickup'; // RESTAURANT_PICKUP status means waiting_for_pickup stage should be active
                          break;
                        case OrderStatus.EN_ROUTE:
                          expectedCurrentStage = 'restaurant_pickup'; // EN_ROUTE status means restaurant_pickup stage should be active
                          break;
                        case OrderStatus.DELIVERED:
                          expectedCurrentStage = 'en_route_to_customer'; // DELIVERED status means en_route_to_customer stage should be active
                          break;
                        default:
                          expectedCurrentStage = 'driver_ready';
                      }
                    }

                    const expectedStageIndex =
                      stageOrder.indexOf(expectedCurrentStage);
                    const expectedStageState = `${expectedCurrentStage}_${orderSuffix}`;
                    const expectedStage = updatedStages.find(
                      s => s.state === expectedStageState
                    );

                    logToFile(
                      '[STAGE_DETECTION] Expected stage based on order status',
                      {
                        requestId,
                        orderId: order.id,
                        orderStatus: order.status,
                        expectedCurrentStage,
                        expectedStageIndex,
                        expectedStageState,
                        expectedStageExists: !!expectedStage,
                        expectedStageStatus: expectedStage?.status
                      }
                    );

                    if (expectedStage) {
                      if (expectedStage.status === 'pending') {
                        // Stage is pending, we should start it
                        currentStageIndex = expectedStageIndex;
                        logToFile(
                          '[STAGE_DETECTION] Found pending expected stage, will start it',
                          {
                            requestId,
                            orderId: order.id,
                            currentStageIndex,
                            expectedStageState
                          }
                        );
                      } else if (expectedStage.status === 'in_progress') {
                        // Stage is already in progress, this is our current stage
                        currentStageIndex = expectedStageIndex;
                        logToFile(
                          '[STAGE_DETECTION] Found in-progress expected stage',
                          {
                            requestId,
                            orderId: order.id,
                            currentStageIndex,
                            expectedStageState
                          }
                        );
                      } else if (expectedStage.status === 'completed') {
                        // Stage is completed, we should move to next stage
                        currentStageIndex = expectedStageIndex;
                        logToFile(
                          '[STAGE_DETECTION] Expected stage is completed, will progress to next',
                          {
                            requestId,
                            orderId: order.id,
                            currentStageIndex,
                            expectedStageState
                          }
                        );
                      }
                    }

                    // Fallback: check for pending driver_ready stage
                    if (currentStageIndex === -1) {
                      const driverReadyState = `driver_ready_${orderSuffix}`;
                      const driverReadyStage = updatedStages.find(
                        s => s.state === driverReadyState
                      );

                      if (
                        driverReadyStage &&
                        driverReadyStage.status === 'pending'
                      ) {
                        currentStageIndex = 0; // Start at driver_ready
                        logToFile(
                          '[FALLBACK] Setting initial stage to driver_ready',
                          {
                            requestId,
                            orderId: order.id,
                            newCurrentStageIndex: currentStageIndex
                          }
                        );
                      }
                    }
                  }
                }

                if (order.id === targetOrderId && currentStageIndex >= 0) {
                  const currentState = `${stageOrder[currentStageIndex]}_${orderSuffix}`;
                  const nextStateBase =
                    currentStageIndex < stageOrder.length - 1
                      ? stageOrder[currentStageIndex + 1]
                      : null;
                  const nextState = nextStateBase
                    ? `${nextStateBase}_${orderSuffix}`
                    : null;

                  logToFile(
                    '[STAGE_UPDATE] Processing stage update for target order',
                    {
                      requestId,
                      orderId: order.id,
                      currentState,
                      nextStateBase,
                      nextState,
                      currentStageIndex,
                      isDeliveryComplete: nextStateBase === 'delivery_complete'
                    }
                  );

                  if (nextStateBase === 'delivery_complete') {
                    // CRITICAL FIX: Find the CORRECT order that is completing delivery based on nextState
                    let completingOrder = null;

                    // Find the order that has the delivery_complete stage that is about to start
                    for (const checkOrder of sortedOrders) {
                      const checkOrderSuffix = orderStageMapping.get(
                        checkOrder.id
                      );
                      const expectedDeliveryStage = `delivery_complete_${checkOrderSuffix}`;

                      if (expectedDeliveryStage === nextState) {
                        completingOrder = checkOrder;
                        logToFile(
                          '[DELIVERY_COMPLETION] Found CORRECT completing order',
                          {
                            requestId,
                            nextState,
                            correctOrderId: checkOrder.id,
                            checkOrderSuffix,
                            expectedDeliveryStage
                          }
                        );
                        break;
                      }
                    }

                    if (completingOrder) {
                      logToFile(
                        '[DELIVERY_COMPLETION] Found correct completing order',
                        {
                          requestId,
                          nextState,
                          correctOrderId: completingOrder.id,
                          wrongOrderId: order.id
                        }
                      );

                      await this.handleDeliveryCompletion(
                        completingOrder, // ✅ CORRECT order that is completing
                        dps,
                        transactionalEntityManager
                      );
                    } else {
                      logToFile(
                        '[DELIVERY_COMPLETION] ERROR: Could not find completing order',
                        {
                          requestId,
                          nextState,
                          availableOrders: sortedOrders.map(o => o.id)
                        }
                      );
                    }
                  }

                  logToFile('[STAGE_UPDATE] Before stage updates', {
                    requestId,
                    orderId: order.id,
                    stagesBeforeUpdate: updatedStages.map(s => ({
                      state: s.state,
                      status: s.status,
                      timestamp: s.timestamp,
                      duration: s.duration
                    }))
                  });

                  updatedStages = updatedStages.map((stage): StageDto => {
                    if (stage.state === currentState) {
                      const actualTime =
                        stage.status === 'in_progress'
                          ? timestamp - stage.timestamp
                          : 0;
                      dps.actual_time_spent =
                        (dps.actual_time_spent || 0) + actualTime;
                      stage.details.actual_time = actualTime;

                      logToFile('[STAGE_UPDATE] Completing current stage', {
                        requestId,
                        orderId: order.id,
                        stageState: stage.state,
                        actualTime,
                        newTotalActualTime: dps.actual_time_spent
                      });

                      return {
                        ...stage,
                        status: 'completed',
                        duration: actualTime
                      };
                    }
                    if (nextState && stage.state === nextState) {
                      const estimatedTime = this.calculateEstimatedTime(
                        order.distance || 0
                      );
                      dps.estimated_time_remaining =
                        (dps.estimated_time_remaining || 0) -
                        (stage.details?.estimated_time || 0) +
                        estimatedTime;
                      stage.details.estimated_time = estimatedTime;

                      logToFile('[STAGE_UPDATE] Starting next stage', {
                        requestId,
                        orderId: order.id,
                        stageState: stage.state,
                        estimatedTime,
                        newEstimatedTimeRemaining: dps.estimated_time_remaining
                      });

                      return { ...stage, status: 'in_progress', timestamp };
                    }
                    return stage;
                  });

                  logToFile('[STAGE_UPDATE] After stage updates', {
                    requestId,
                    orderId: order.id,
                    stagesAfterUpdate: updatedStages.map(s => ({
                      state: s.state,
                      status: s.status,
                      timestamp: s.timestamp,
                      duration: s.duration
                    }))
                  });

                  // CRITICAL FIX: Handle delivery completion and next order progression
                  if (
                    currentState.includes('delivery_complete') &&
                    !nextStateBase
                  ) {
                    logToFile(
                      '[DELIVERY_COMPLETE] Order delivery completed, checking for next order',
                      {
                        requestId,
                        orderId: order.id,
                        currentState
                      }
                    );

                    // CRITICAL FIX: Find the CORRECT order directly from the current order being processed
                    // The currentState tells us which order completed: delivery_complete_order_X
                    // But we need to find the ACTUAL order that has this stage

                    let completedOrder = null;

                    // Find the order that has the delivery_complete stage that just completed
                    for (const checkOrder of sortedOrders) {
                      const checkOrderSuffix = orderStageMapping.get(
                        checkOrder.id
                      );
                      const expectedDeliveryStage = `delivery_complete_${checkOrderSuffix}`;

                      if (expectedDeliveryStage === currentState) {
                        completedOrder = checkOrder;
                        logToFile(
                          '[DELIVERY_COMPLETE] Found CORRECT completed order',
                          {
                            requestId,
                            currentState,
                            correctOrderId: checkOrder.id,
                            checkOrderSuffix,
                            expectedDeliveryStage
                          }
                        );
                        break;
                      }
                    }

                    if (!completedOrder) {
                      logToFile(
                        '[DELIVERY_COMPLETE] ERROR: Could not find any order for currentState',
                        {
                          requestId,
                          currentState,
                          availableOrders: sortedOrders.map(o => ({
                            id: o.id,
                            suffix: orderStageMapping.get(o.id),
                            expectedStage: `delivery_complete_${orderStageMapping.get(o.id)}`
                          }))
                        }
                      );
                    }

                    if (completedOrder) {
                      logToFile(
                        '[DELIVERY_COMPLETE] Found correct completed order',
                        {
                          requestId,
                          currentState,
                          correctOrderId: completedOrder.id,
                          wrongOrderId: order.id
                        }
                      );

                      await this.handleDeliveryCompletion(
                        completedOrder, // ✅ CORRECT order that just completed
                        dps,
                        transactionalEntityManager
                      );
                    } else {
                      logToFile(
                        '[DELIVERY_COMPLETE] ERROR: Could not find completed order',
                        {
                          requestId,
                          currentState,
                          availableOrders: sortedOrders.map(o => o.id)
                        }
                      );
                    }

                    // CRITICAL FIX: Emit for the completed order first
                    const completedOrderStatus = OrderStatus.DELIVERED;
                    const completedOrderTrackingInfo =
                      OrderTrackingInfo.DELIVERED;

                    logToFile(
                      '[DELIVERY_COMPLETE] Emitting for completed order',
                      {
                        requestId,
                        orderId: order.id,
                        status: completedOrderStatus,
                        trackingInfo: completedOrderTrackingInfo
                      }
                    );

                    // CRITICAL FIX: Apply same comprehensive emit pattern as driverAcceptOrder
                    this.eventEmitter.emit('listenUpdateOrderTracking', {
                      ...order,
                      orderId: order.id,
                      status: completedOrderStatus,
                      tracking_info: completedOrderTrackingInfo,
                      updated_at: timestamp,
                      customer_id: order.customer_id,
                      order_items: order.order_items,
                      driver_id: order.driver_id,
                      restaurant_id: order.restaurant_id,
                      restaurant_avatar: order.restaurant?.avatar || null,
                      driver_avatar: null, // Will be populated by the listener
                      restaurantAddress: order.restaurantAddress,
                      customerAddress: order.customerAddress,
                      driverDetails: null // Will be populated by the listener
                    });

                    try {
                      await this.notifyPartiesOnce(order);
                      logToFile(
                        '[DELIVERY_COMPLETE] Successfully notified parties for completed order',
                        {
                          requestId,
                          orderId: order.id
                        }
                      );
                    } catch (notifyError: any) {
                      logToFile(
                        '[DELIVERY_COMPLETE] Failed to notify parties for completed order',
                        {
                          requestId,
                          orderId: order.id,
                          error: notifyError?.message || 'Unknown error'
                        }
                      );
                    }

                    // This order is complete, find next order to start
                    for (const nextOrder of sortedOrders) {
                      if (nextOrder.id === order.id) continue; // Skip current order

                      const nextOrderSuffix = orderStageMapping.get(
                        nextOrder.id
                      );
                      const nextDriverReadyState = `driver_ready_${nextOrderSuffix}`;
                      const nextDriverReadyStage = updatedStages.find(
                        s => s.state === nextDriverReadyState
                      );

                      if (
                        nextDriverReadyStage &&
                        nextDriverReadyStage.status === 'pending'
                      ) {
                        logToFile('[DELIVERY_COMPLETE] Starting next order', {
                          requestId,
                          nextOrderId: nextOrder.id,
                          nextOrderSuffix,
                          nextDriverReadyState
                        });

                        // CRITICAL FIX: For subsequent orders, complete driver_ready and start waiting_for_pickup
                        const nextWaitingForPickupState = `waiting_for_pickup_${nextOrderSuffix}`;

                        updatedStages = updatedStages.map((stage): StageDto => {
                          if (stage.state === nextDriverReadyState) {
                            // Complete driver_ready stage immediately for subsequent orders
                            return {
                              ...stage,
                              status: 'completed',
                              duration: 0 // Instant completion
                            };
                          }
                          if (stage.state === nextWaitingForPickupState) {
                            // Start waiting_for_pickup stage for subsequent orders
                            const estimatedTime = this.calculateEstimatedTime(
                              nextOrder.distance || 0
                            );
                            dps.estimated_time_remaining =
                              (dps.estimated_time_remaining || 0) +
                              estimatedTime;
                            stage.details.estimated_time = estimatedTime;

                            return {
                              ...stage,
                              status: 'in_progress',
                              timestamp
                            };
                          }
                          return stage;
                        });

                        // Update next order to READY_FOR_PICKUP
                        const nextOrderNewStatus = OrderStatus.READY_FOR_PICKUP;
                        const nextOrderNewTrackingInfo =
                          OrderTrackingInfo.PREPARING;

                        logToFile(
                          '[DELIVERY_COMPLETE] Updating next order status',
                          {
                            requestId,
                            nextOrderId: nextOrder.id,
                            oldStatus: nextOrder.status,
                            newStatus: nextOrderNewStatus,
                            oldTrackingInfo: nextOrder.tracking_info,
                            newTrackingInfo: nextOrderNewTrackingInfo
                          }
                        );

                        // Force immediate update for next order
                        const nextOrderToUpdate =
                          await transactionalEntityManager
                            .getRepository(Order)
                            .findOne({ where: { id: nextOrder.id } });

                        if (nextOrderToUpdate) {
                          nextOrderToUpdate.status = nextOrderNewStatus;
                          nextOrderToUpdate.tracking_info =
                            nextOrderNewTrackingInfo;
                          nextOrderToUpdate.updated_at = timestamp;

                          const savedNextOrder =
                            await transactionalEntityManager
                              .getRepository(Order)
                              .save(nextOrderToUpdate);

                          // Update in-memory object
                          nextOrder.status = savedNextOrder.status;
                          nextOrder.tracking_info =
                            savedNextOrder.tracking_info;
                          nextOrder.updated_at = savedNextOrder.updated_at;

                          logToFile(
                            '[DELIVERY_COMPLETE] Next order updated successfully',
                            {
                              requestId,
                              nextOrderId: nextOrder.id,
                              newStatus: savedNextOrder.status,
                              newTrackingInfo: savedNextOrder.tracking_info
                            }
                          );

                          // Emit for next order
                          // CRITICAL FIX: Apply same comprehensive emit pattern as driverAcceptOrder
                          this.eventEmitter.emit('listenUpdateOrderTracking', {
                            ...order,
                            order_items: nextOrder.order_items,
                            orderId: nextOrder.id,
                            status: savedNextOrder.status,
                            tracking_info: savedNextOrder.tracking_info,
                            updated_at: savedNextOrder.updated_at,
                            customer_id: nextOrder.customer_id,
                            driver_id: nextOrder.driver_id,
                            restaurant_id: nextOrder.restaurant_id,
                            restaurant_avatar:
                              nextOrder.restaurant?.avatar || null,
                            driver_avatar: null, // Will be populated by the listener
                            restaurantAddress: nextOrder.restaurantAddress,
                            customerAddress: nextOrder.customerAddress,
                            driverDetails: null // Will be populated by the listener
                          });

                          try {
                            await this.notifyPartiesOnce(savedNextOrder);
                            logToFile(
                              '[DELIVERY_COMPLETE] Successfully notified parties for next order',
                              {
                                requestId,
                                nextOrderId: nextOrder.id
                              }
                            );
                          } catch (notifyError: any) {
                            logToFile(
                              '[DELIVERY_COMPLETE] Failed to notify parties for next order',
                              {
                                requestId,
                                nextOrderId: nextOrder.id,
                                error: notifyError?.message || 'Unknown error'
                              }
                            );
                          }
                        }
                        break; // Only start one order
                      }
                    }
                  }

                  // CRITICAL FIX: Update Order with CURRENT stage's completion status, not next stage
                  if (nextStateBase) {
                    const currentStateBase = stageOrder[currentStageIndex];
                    const newStatus = getStatusForStage(
                      currentStateBase,
                      orderSuffix
                    );
                    const newTrackingInfo = getTrackingInfoForStage(
                      currentStateBase,
                      orderSuffix
                    );

                    logToFile(
                      '[ORDER_UPDATE] Preparing to update order status',
                      {
                        requestId,
                        orderId: order.id,
                        oldStatus: order.status,
                        newStatus,
                        oldTrackingInfo: order.tracking_info,
                        newTrackingInfo,
                        currentStage: currentState,
                        nextStage: nextState
                      }
                    );

                    logger.log(`Preparing to update order ${order.id}`, {
                      newStatus,
                      newTrackingInfo,
                      currentStage: currentState,
                      nextStage: nextState
                    });

                    // FIXED: Force immediate update with explicit save to avoid async lag
                    const orderToUpdate = await transactionalEntityManager
                      .getRepository(Order)
                      .findOne({ where: { id: order.id } });

                    if (!orderToUpdate) {
                      throw new Error(`Order ${order.id} not found for update`);
                    }

                    // Update the order object directly
                    orderToUpdate.status = newStatus;
                    orderToUpdate.tracking_info = newTrackingInfo;
                    orderToUpdate.updated_at = timestamp;

                    // Save immediately to ensure synchronous update
                    const savedOrder = await transactionalEntityManager
                      .getRepository(Order)
                      .save(orderToUpdate);

                    logToFile(
                      '[ORDER_UPDATE] Order update result (IMMEDIATE SAVE)',
                      {
                        requestId,
                        orderId: order.id,
                        oldStatus: order.status,
                        newStatus: savedOrder.status,
                        oldTrackingInfo: order.tracking_info,
                        newTrackingInfo: savedOrder.tracking_info,
                        updateSuccess: true,
                        savedAt: savedOrder.updated_at
                      }
                    );

                    logger.log(`Order IMMEDIATELY updated for ${order.id}`, {
                      newStatus: savedOrder.status,
                      newTrackingInfo: savedOrder.tracking_info
                    });

                    // Update the order object in memory to reflect the change
                    order.status = savedOrder.status;
                    order.tracking_info = savedOrder.tracking_info;
                    order.updated_at = savedOrder.updated_at;

                    // CRITICAL FIX: For subsequent orders, ensure DPS stages are synchronized with order status
                    const isFirstOrder = orderSuffix === 'order_1';
                    if (!isFirstOrder) {
                      logToFile(
                        '[STAGE_SYNC] Synchronizing DPS stages with order status for subsequent order',
                        {
                          requestId,
                          orderId: order.id,
                          orderSuffix,
                          newOrderStatus: savedOrder.status,
                          currentStage: currentState,
                          nextStage: nextState
                        }
                      );

                      // Determine what stage should be active based on the new order status
                      let expectedActiveStage = '';
                      let expectedNextStage = '';

                      switch (savedOrder.status) {
                        case OrderStatus.RESTAURANT_PICKUP:
                          expectedActiveStage = `waiting_for_pickup_${orderSuffix}`;
                          expectedNextStage = `restaurant_pickup_${orderSuffix}`;
                          break;
                        case OrderStatus.EN_ROUTE:
                          expectedActiveStage = `restaurant_pickup_${orderSuffix}`;
                          expectedNextStage = `en_route_to_customer_${orderSuffix}`;
                          break;
                        case OrderStatus.DELIVERED:
                          expectedActiveStage = `en_route_to_customer_${orderSuffix}`;
                          expectedNextStage = `delivery_complete_${orderSuffix}`;

                          // CRITICAL FIX: Call handleDeliveryCompletion when order status becomes DELIVERED
                          logToFile(
                            '[DELIVERED_STATUS] Order status is DELIVERED - calling handleDeliveryCompletion',
                            {
                              requestId,
                              orderId: order.id,
                              orderSuffix,
                              orderStatus: savedOrder.status
                            }
                          );

                          await this.handleDeliveryCompletion(
                            order, // This is the correct order that just became DELIVERED
                            dps,
                            transactionalEntityManager
                          );
                          break;
                      }

                      if (expectedActiveStage && expectedNextStage) {
                        // Complete the expected active stage and start the next stage
                        updatedStages = updatedStages.map((stage): StageDto => {
                          if (
                            stage.state === expectedActiveStage &&
                            stage.status === 'in_progress'
                          ) {
                            // Complete the current stage
                            const actualTime = timestamp - stage.timestamp;
                            dps.actual_time_spent =
                              (dps.actual_time_spent || 0) + actualTime;
                            stage.details.actual_time = actualTime;

                            logToFile(
                              '[STAGE_SYNC] Completing expected active stage',
                              {
                                requestId,
                                orderId: order.id,
                                stageState: stage.state,
                                actualTime
                              }
                            );

                            return {
                              ...stage,
                              status: 'completed',
                              duration: actualTime
                            };
                          }
                          if (
                            stage.state === expectedNextStage &&
                            stage.status === 'pending'
                          ) {
                            // Start the next stage
                            const estimatedTime = this.calculateEstimatedTime(
                              order.distance || 0
                            );
                            dps.estimated_time_remaining =
                              (dps.estimated_time_remaining || 0) -
                              (stage.details?.estimated_time || 0) +
                              estimatedTime;
                            stage.details.estimated_time = estimatedTime;

                            logToFile(
                              '[STAGE_SYNC] Starting expected next stage',
                              {
                                requestId,
                                orderId: order.id,
                                stageState: stage.state,
                                estimatedTime
                              }
                            );

                            return {
                              ...stage,
                              status: 'in_progress',
                              timestamp
                            };
                          }
                          return stage;
                        });

                        logToFile(
                          '[STAGE_SYNC] DPS stages synchronized successfully',
                          {
                            requestId,
                            orderId: order.id,
                            expectedActiveStage,
                            expectedNextStage,
                            newOrderStatus: savedOrder.status
                          }
                        );
                      }
                    }

                    // FIXED: Restore missing emit for order tracking updates
                    logToFile('[EMIT] Emitting listenUpdateOrderTracking', {
                      requestId,
                      orderId: order.id,
                      newStatus: savedOrder.status,
                      newTrackingInfo: savedOrder.tracking_info
                    });

                    // CRITICAL FIX: Apply same comprehensive emit pattern as driverAcceptOrder
                    this.eventEmitter.emit('listenUpdateOrderTracking', {
                      ...order,
                      orderId: order.id,
                      status: savedOrder.status,
                      order_items: order.order_items,
                      tracking_info: savedOrder.tracking_info,
                      updated_at: savedOrder.updated_at,
                      customer_id: order.customer_id,
                      driver_id: order.driver_id,
                      restaurant_id: order.restaurant_id,
                      restaurant_avatar: order.restaurant?.avatar || null,
                      driver_avatar: null, // Will be populated by the listener
                      restaurantAddress: order.restaurantAddress,
                      customerAddress: order.customerAddress,
                      driverDetails: null // Will be populated by the listener
                    });

                    // FIXED: Also notify all parties immediately after order update
                    logToFile('[EMIT] Notifying parties for order update', {
                      requestId,
                      orderId: order.id,
                      newStatus: savedOrder.status,
                      newTrackingInfo: savedOrder.tracking_info
                    });

                    try {
                      await this.notifyPartiesOnce(savedOrder);
                      logToFile('[EMIT] Successfully notified parties', {
                        requestId,
                        orderId: order.id
                      });
                    } catch (notifyError: any) {
                      logToFile('[EMIT_ERROR] Failed to notify parties', {
                        requestId,
                        orderId: order.id,
                        error: notifyError?.message || 'Unknown notify error'
                      });
                      logger.error(
                        `Failed to notify parties for order ${order.id}:`,
                        notifyError
                      );
                    }
                  } else if (!nextStateBase) {
                    logToFile(
                      '[ORDER_UPDATE] No next stage - skipping order update',
                      {
                        requestId,
                        orderId: order.id,
                        currentStage: currentState
                      }
                    );
                    logger.log(
                      `No next stage for order ${order.id}, skipping Order update`,
                      {
                        currentStage: currentState
                      }
                    );
                  }
                }

                const finalState = `delivery_complete_${orderSuffix}`;
                const finalStage = updatedStages.find(
                  s => s.state === finalState
                );
                if (!finalStage || finalStage.status !== 'completed')
                  allCompleted = false;
              }

              // FIXED: Handle multi-order progression correctly
              if (!allCompleted) {
                logToFile('[MULTI_ORDER] Checking for next order to start', {
                  requestId,
                  allCompleted,
                  targetOrderId,
                  totalOrders: dps.orders.length
                });

                // Check if the current target order just completed delivery
                const targetOrderSuffix = orderStageMapping.get(targetOrderId);
                const targetDeliveryState = `delivery_complete_${targetOrderSuffix}`;
                const targetDeliveryStage = updatedStages.find(
                  s => s.state === targetDeliveryState
                );

                const targetOrderJustCompleted =
                  targetDeliveryStage &&
                  targetDeliveryStage.status === 'completed';

                logToFile('[MULTI_ORDER] Target order completion check', {
                  requestId,
                  targetOrderId,
                  targetOrderSuffix,
                  targetDeliveryState,
                  targetOrderJustCompleted,
                  targetDeliveryStageStatus: targetDeliveryStage?.status
                });

                if (targetOrderJustCompleted) {
                  // Find the next order that hasn't started yet
                  for (const order of sortedOrders) {
                    if (order.id === targetOrderId) continue; // Skip the just completed order

                    const orderSuffix = orderStageMapping.get(order.id);
                    const driverReadyState = `driver_ready_${orderSuffix}`;
                    const driverReadyStage = updatedStages.find(
                      s => s.state === driverReadyState
                    );

                    // Check if this order hasn't started yet (driver_ready is still pending)
                    if (
                      driverReadyStage &&
                      driverReadyStage.status === 'pending'
                    ) {
                      logToFile('[MULTI_ORDER] Starting next order', {
                        requestId,
                        nextOrderId: order.id,
                        nextOrderSuffix: orderSuffix,
                        driverReadyState
                      });

                      // CRITICAL FIX: For subsequent orders, complete driver_ready and start waiting_for_pickup
                      const waitingForPickupState = `waiting_for_pickup_${orderSuffix}`;

                      updatedStages = updatedStages.map((stage): StageDto => {
                        if (stage.state === driverReadyState) {
                          // Complete driver_ready stage immediately for subsequent orders
                          logToFile(
                            '[MULTI_ORDER] Completing driver_ready stage immediately',
                            {
                              requestId,
                              orderId: order.id,
                              stageState: stage.state
                            }
                          );

                          return { ...stage, status: 'completed', duration: 0 };
                        }
                        if (stage.state === waitingForPickupState) {
                          // Start waiting_for_pickup stage for subsequent orders
                          const estimatedTime = this.calculateEstimatedTime(
                            order.distance || 0
                          );
                          dps.estimated_time_remaining =
                            (dps.estimated_time_remaining || 0) + estimatedTime;
                          stage.details.estimated_time = estimatedTime;

                          logToFile(
                            '[MULTI_ORDER] Starting waiting_for_pickup stage',
                            {
                              requestId,
                              orderId: order.id,
                              stageState: stage.state,
                              estimatedTime
                            }
                          );

                          return { ...stage, status: 'in_progress', timestamp };
                        }
                        return stage;
                      });

                      // Update the order status to READY_FOR_PICKUP
                      const newStatus = OrderStatus.READY_FOR_PICKUP;
                      const newTrackingInfo = OrderTrackingInfo.PREPARING;

                      logToFile(
                        '[MULTI_ORDER] Updating next order to READY_FOR_PICKUP',
                        {
                          requestId,
                          orderId: order.id,
                          newStatus,
                          newTrackingInfo
                        }
                      );

                      // FIXED: Force immediate update for multi-order to avoid async lag
                      const nextOrderToUpdate = await transactionalEntityManager
                        .getRepository(Order)
                        .findOne({ where: { id: order.id } });

                      if (!nextOrderToUpdate) {
                        throw new Error(
                          `Next order ${order.id} not found for update`
                        );
                      }

                      // Update the order object directly
                      nextOrderToUpdate.status = newStatus;
                      nextOrderToUpdate.tracking_info = newTrackingInfo;
                      nextOrderToUpdate.updated_at = timestamp;

                      // Save immediately to ensure synchronous update
                      const savedNextOrder = await transactionalEntityManager
                        .getRepository(Order)
                        .save(nextOrderToUpdate);

                      logToFile(
                        '[MULTI_ORDER] Next order update result (IMMEDIATE SAVE)',
                        {
                          requestId,
                          orderId: order.id,
                          oldStatus: order.status,
                          newStatus: savedNextOrder.status,
                          oldTrackingInfo: order.tracking_info,
                          newTrackingInfo: savedNextOrder.tracking_info,
                          updateSuccess: true,
                          savedAt: savedNextOrder.updated_at
                        }
                      );

                      // Update the order object in memory to reflect the change
                      order.status = savedNextOrder.status;
                      order.tracking_info = savedNextOrder.tracking_info;
                      order.updated_at = savedNextOrder.updated_at;

                      // FIXED: Restore missing emit for multi-order tracking updates
                      logToFile(
                        '[MULTI_ORDER_EMIT] Emitting listenUpdateOrderTracking for next order',
                        {
                          requestId,
                          orderId: order.id,
                          newStatus: savedNextOrder.status,
                          newTrackingInfo: savedNextOrder.tracking_info
                        }
                      );

                      this.eventEmitter.emit('listenUpdateOrderTracking', {
                        order_items: order.order_items,
                        orderId: order.id,
                        status: savedNextOrder.status,
                        tracking_info: savedNextOrder.tracking_info,
                        updated_at: savedNextOrder.updated_at,
                        customer_id: order.customer_id,
                        driver_id: order.driver_id,
                        restaurant_id: order.restaurant_id,
                        restaurant_avatar: order.restaurant?.avatar || null,
                        driver_avatar: null,
                        restaurantAddress: order.restaurantAddress,
                        customerAddress: order.customerAddress,
                        driverDetails: null
                      });

                      // FIXED: Also notify all parties for multi-order updates
                      logToFile(
                        '[MULTI_ORDER_EMIT] Notifying parties for next order',
                        {
                          requestId,
                          orderId: order.id,
                          newStatus: savedNextOrder.status,
                          newTrackingInfo: savedNextOrder.tracking_info
                        }
                      );

                      try {
                        await this.notifyPartiesOnce(savedNextOrder);
                        logToFile(
                          '[MULTI_ORDER_EMIT] Successfully notified parties for next order',
                          {
                            requestId,
                            orderId: order.id
                          }
                        );
                      } catch (notifyError: any) {
                        logToFile(
                          '[MULTI_ORDER_EMIT_ERROR] Failed to notify parties for next order',
                          {
                            requestId,
                            orderId: order.id,
                            error:
                              notifyError?.message || 'Unknown notify error'
                          }
                        );
                        logger.error(
                          `Failed to notify parties for next order ${order.id}:`,
                          notifyError
                        );
                      }

                      break; // Only start one order at a time
                    }
                  }
                }
              }

              const inProgressStage = updatedStages.find(
                stage => stage.status === 'in_progress'
              );
              const currentState = inProgressStage
                ? inProgressStage.state
                : dps.current_state;
              const previousState = dps.current_state;
              let nextState: string | null = null;

              if (inProgressStage) {
                const currentIndex = stageOrder.findIndex(base =>
                  inProgressStage.state.startsWith(base)
                );
                nextState =
                  currentIndex < stageOrder.length - 1
                    ? `${stageOrder[currentIndex + 1]}_${inProgressStage.state.split('_order_')[1]}`
                    : null;
              }

              dps.current_state = currentState;
              dps.previous_state = previousState;
              dps.next_state = nextState;

              const allDeliveryCompleteStages = updatedStages.filter(stage =>
                stage.state.startsWith('delivery_complete_')
              );
              const isAllCompleted = allDeliveryCompleteStages.every(
                stage => stage.status === 'completed'
              );

              if (isAllCompleted) {
                dps.current_state =
                  allDeliveryCompleteStages[
                    allDeliveryCompleteStages.length - 1
                  ].state;
                dps.next_state = null;
              }

              logToFile('[DPS_UPDATE] Preparing to update DPS', {
                requestId,
                dpsId: data.stageId,
                finalCurrentState: dps.current_state,
                finalPreviousState: dps.previous_state,
                finalNextState: dps.next_state,
                finalEstimatedTimeRemaining: dps.estimated_time_remaining,
                finalActualTimeSpent: dps.actual_time_spent,
                finalTotalDistance: dps.total_distance_travelled,
                finalTotalTips: dps.total_tips,
                finalTotalEarns: dps.total_earns,
                finalTransactionsProcessed: dps.transactions_processed,
                finalStagesCount: updatedStages.length,
                finalOrdersCount: dps.orders.length
              });

              const updateResult =
                await this.driverProgressStageService.updateStage(
                  data.stageId,
                  {
                    current_state: dps.current_state,
                    previous_state: dps.previous_state,
                    next_state: dps.next_state,
                    stages: updatedStages,
                    orders: dps.orders,
                    estimated_time_remaining: Number(
                      dps.estimated_time_remaining || 0
                    ),
                    actual_time_spent: Number(dps.actual_time_spent || 0),
                    total_distance_travelled: Number(
                      Number(dps.total_distance_travelled || 0).toFixed(4)
                    ),
                    total_tips: Number(Number(dps.total_tips || 0).toFixed(2)),
                    total_earns: Number(
                      Number(dps.total_earns || 0).toFixed(2)
                    ),
                    transactions_processed: dps.transactions_processed || false
                  },
                  transactionalEntityManager
                );

              logToFile('[DPS_UPDATE] DPS update result', {
                requestId,
                dpsId: data.stageId,
                updateSuccess: updateResult.EC === 0 && !!updateResult.data,
                errorCode: updateResult.EC,
                errorMessage: updateResult.EM,
                hasData: !!updateResult.data
              });

              logToFile('Successfully updated DPS', {
                dpsId: data.stageId,
                total_earns: parseFloat(
                  Number(dps.total_earns || 0).toFixed(2)
                ),
                total_tips: parseFloat(Number(dps.total_tips || 0).toFixed(2)),
                total_distance: parseFloat(
                  Number(dps.total_distance_travelled || 0).toFixed(4)
                )
              });

              if (updateResult.EC !== 0 || !updateResult.data) {
                throw new Error(updateResult?.EM || 'Failed to update DPS');
              }

              // FIXED: Ensure driverStagesUpdated emit works properly
              if (this.server) {
                const driverRoom = `driver_${dps.driver_id}`;

                logToFile('[EMIT] Preparing to emit driverStagesUpdated', {
                  requestId,
                  driverId: dps.driver_id,
                  driverRoom,
                  hasUpdateData: !!updateResult.data
                });

                logger.log(
                  `Emitting driverStagesUpdated event to driver: ${dps.driver_id}`
                );

                const clients = await this.server.in(driverRoom).fetchSockets();
                logger.log(
                  `[DriversGateway] Clients in room ${driverRoom}: ${clients.length}`
                );

                if (clients.length === 0) {
                  logger.warn(
                    `[DriversGateway] No clients in room ${driverRoom}, event may not be delivered`
                  );
                }

                // Force emit with explicit await and error handling
                try {
                  this.server
                    .to(driverRoom)
                    .emit('driverStagesUpdated', updateResult.data);

                  logToFile('[EMIT] Successfully emitted driverStagesUpdated', {
                    requestId,
                    driverId: dps.driver_id,
                    driverRoom,
                    clientsCount: clients.length,
                    dataEmitted: !!updateResult.data
                  });

                  logger.log(
                    `[DriversGateway] Successfully emitted driverStagesUpdated to ${driverRoom}`
                  );
                } catch (emitError: any) {
                  logToFile('[EMIT_ERROR] Failed to emit driverStagesUpdated', {
                    requestId,
                    driverId: dps.driver_id,
                    error: emitError?.message || 'Unknown emit error'
                  });
                  logger.error(
                    `[DriversGateway] Failed to emit driverStagesUpdated:`,
                    emitError
                  );
                }
              } else {
                logToFile(
                  '[EMIT_ERROR] Server instance not available for driverStagesUpdated',
                  {
                    requestId,
                    driverId: dps.driver_id
                  }
                );
                logger.error(
                  '[DriversGateway] Server instance not available for emit'
                );
              }

              const updatedOrder = await transactionalEntityManager
                .getRepository(Order)
                .findOne({
                  where: { id: targetOrderId },
                  relations: [
                    'restaurant',
                    'driver',
                    'customer',
                    'restaurantAddress',
                    'customerAddress'
                  ]
                });

              if (updatedOrder) {
                logger.log(
                  `Notifying parties for updated order ${updatedOrder.id}`,
                  {
                    status: updatedOrder.status,
                    tracking_info: updatedOrder.tracking_info
                  }
                );
                await this.notifyPartiesOnce(updatedOrder);
              }

              return { success: true, stage: updateResult.data };
            }
          );
        } catch (error: any) {
          logToFile('[ERROR] Transaction error occurred', {
            requestId,
            stageId: data.stageId,
            attempt: attempt + 1,
            maxRetries,
            errorMessage: error.message,
            errorStack: error.stack,
            isDeadlock: error.message.includes('deadlock detected')
          });

          if (
            error.message.includes('deadlock detected') &&
            attempt < maxRetries - 1
          ) {
            attempt++;
            logToFile('[RETRY] Deadlock detected - retrying', {
              requestId,
              stageId: data.stageId,
              attempt,
              maxRetries,
              retryDelay: 100 * attempt
            });
            logger.warn(
              `Deadlock detected, retrying (${attempt}/${maxRetries})`
            );
            await new Promise(resolve => setTimeout(resolve, 100 * attempt));
            continue;
          }
          logger.error('Error in handleDriverProgressUpdate:', error);
          throw error;
        } finally {
          logToFile('[CLEANUP] Releasing Redis lock', {
            requestId,
            stageId: data.stageId,
            lockKey: `lock:dps:${data.stageId}`
          });
          await this.redisService.del(`lock:dps:${data.stageId}`);
        }
      }

      logToFile('[ERROR] Max retries reached', {
        requestId,
        stageId: data.stageId,
        maxRetries
      });
      throw new Error('Max retries reached for handleDriverProgressUpdate');
    } catch (error: any) {
      logToFile('[ERROR] Final error in handleDriverProgressUpdate', {
        requestId,
        stageId: data.stageId,
        errorMessage: error.message,
        errorStack: error.stack,
        endTime: Date.now(),
        totalDuration: Date.now() - startTime
      });

      logger.error('Error in handleDriverProgressUpdate:', error);
      return { success: false, message: error.message };
    } finally {
      logToFile('=== DRIVER PROGRESS UPDATE END ===', {
        requestId,
        stageId: data.stageId,
        endTime: Date.now(),
        totalDuration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    }
  }

  @SubscribeMessage('driverAcceptOrder')
  async handleDriverAcceptOrder(
    @MessageBody() data: { driverId: string; orderId: string }
  ) {
    console.log('[DriversGateway] Raw data received:', data);
    const { driverId, orderId } = data;

    // Add lock to prevent duplicate processing
    const lockKey = `driver_accept_order:${orderId}:${driverId}`;
    const lockAcquired = await this.redisService.setNx(
      lockKey,
      'locked',
      30000
    );
    if (!lockAcquired) {
      console.log('[DriversGateway] Order already being processed:', lockKey);
      return { success: false, message: 'Order already being processed' };
    }

    try {
      const result = await this.dataSource.transaction(
        async transactionalEntityManager => {
          console.log(
            '[DriversGateway] Starting transaction for driver accept order'
          );

          const orderWithRelations = await transactionalEntityManager
            .getRepository(Order)
            .findOne({
              where: { id: orderId },
              relations: [
                'customerAddress',
                'restaurantAddress',
                'customer',
                'customer.address',
                'restaurant',
                'restaurant.address'
              ]
            });

          if (!orderWithRelations) {
            throw new WsException('Order not found');
          }

          const driverWithRelations = await transactionalEntityManager
            .getRepository(Driver)
            .findOne({
              where: { id: driverId },
              relations: ['current_orders']
            });

          if (!driverWithRelations) {
            throw new WsException('Driver not found');
          }

          // Get restaurant and customer locations with proper validation
          const restaurantLocation =
            orderWithRelations.restaurantAddress?.location;
          const customerLocation = orderWithRelations.customerAddress?.location;

          // Validate location data
          if (!restaurantLocation || !customerLocation) {
            console.error('Missing location data:', {
              restaurant: restaurantLocation,
              customer: customerLocation
            });
            throw new WsException('Missing location data');
          }

          // Ensure location data has proper format
          const restaurantLat = Number(restaurantLocation.lat);
          const restaurantLng = Number(restaurantLocation.lng);
          const customerLat = Number(customerLocation.lat);
          const customerLng = Number(customerLocation.lng);

          if (
            isNaN(restaurantLat) ||
            isNaN(restaurantLng) ||
            isNaN(customerLat) ||
            isNaN(customerLng)
          ) {
            console.error('Invalid location coordinates:', {
              restaurant: { lat: restaurantLat, lng: restaurantLng },
              customer: { lat: customerLat, lng: customerLng }
            });
            throw new WsException('Invalid location coordinates');
          }

          // Calculate distance between restaurant and customer
          const distance = this.calculateDistance(
            restaurantLat,
            restaurantLng,
            customerLat,
            customerLng
          );

          console.log('[DriversGateway] Calculated distance:', distance);

          // Update order with calculated distance
          orderWithRelations.distance = distance;

          // Check for existing DPS with a lock
          const existingDPS = await transactionalEntityManager
            .getRepository(DriverProgressStage)
            .createQueryBuilder('dps')
            .leftJoinAndSelect('dps.orders', 'orders')
            .where('dps.driver_id = :driverId', { driverId })
            .orderBy('dps.created_at', 'DESC')
            .getOne();

          let shouldCreateNewDPS = true;
          if (existingDPS) {
            // Check if there are any orders still in progress (not DELIVERED)
            const hasActiveOrders = existingDPS.orders?.some(
              order => order.status !== OrderStatus.DELIVERED
            );

            // If we have any active orders, we should add to this DPS
            shouldCreateNewDPS = !hasActiveOrders;

            // Log DPS status for debugging
            logToFile('DPS Status Check', {
              dpsId: existingDPS.id,
              hasActiveOrders,
              shouldCreateNewDPS,
              orderStatuses: existingDPS.orders?.map(o => ({
                id: o.id,
                status: o.status
              }))
            });
          }

          const timestamp = Math.floor(Date.now() / 1000);
          const estimatedTime = this.calculateEstimatedTime(distance);
          const totalTips = orderWithRelations.driver_tips || 0;

          const latestFinanceRuleResponse =
            await this.financeRulesService.findOneLatest();
          const { EC, EM, data: financeRules } = latestFinanceRuleResponse;

          if (EC !== 0) throw new WsException(EM);

          // Calculate driver wage based on distance
          let driver_wage: number;
          if (distance >= 0 && distance <= 1) {
            driver_wage = Number(financeRules.driver_fixed_wage['0-1km']);
          } else if (distance > 1 && distance <= 2) {
            driver_wage = Number(financeRules.driver_fixed_wage['1-2km']);
          } else if (distance > 2 && distance <= 3) {
            driver_wage = Number(financeRules.driver_fixed_wage['2-3km']);
          } else if (distance > 4 && distance <= 5) {
            driver_wage = Number(financeRules.driver_fixed_wage['4-5km']);
          } else if (distance > 5) {
            const formula = financeRules.driver_fixed_wage['>5km'];
            try {
              driver_wage = evaluate(
                formula.replace('km', distance.toString())
              );
            } catch (error) {
              console.error('Error evaluating wage formula:', error);
              driver_wage = Number(financeRules.driver_fixed_wage['4-5km']);
            }
          } else {
            driver_wage = Number(financeRules.driver_fixed_wage['0-1km']);
          }

          // Fix: Ensure proper number formatting for totalEarns
          const totalEarns = Number(driver_wage) + Number(totalTips);

          let dps: DriverProgressStage;
          if (shouldCreateNewDPS) {
            console.log(
              `[DriversGateway] Creating new DPS for driver ${driverId} - all existing orders are delivered`
            );
            const dpsResponse = await this.driverProgressStageService.create(
              {
                driver_id: driverId,
                orders: [orderWithRelations],
                current_state: 'driver_ready_order_1',
                estimated_time_remaining: estimatedTime,
                total_distance_travelled: Number(distance.toFixed(4)),
                total_tips: Number(totalTips),
                total_earns: Number(totalEarns.toFixed(2)) // Fix: Format to 2 decimal places
              },
              transactionalEntityManager
            );

            if (dpsResponse.EC !== 0 || !dpsResponse.data) {
              throw new WsException('Failed to create DPS');
            }

            dps = dpsResponse.data;
            dps.stages = dps.stages.map(stage => ({
              ...stage,
              details: this.getStageDetails(
                stage.state,
                orderWithRelations,
                driverWithRelations,
                estimatedTime,
                totalTips
              )
            }));

            await transactionalEntityManager.save(DriverProgressStage, dps);
          } else {
            console.log(
              `[DriversGateway] Adding order to existing DPS ${existingDPS.id} - has active orders`
            );

            // Check if order already exists in DPS
            if (existingDPS.orders?.some(o => o.id === orderId)) {
              throw new WsException('Order already exists in DPS');
            }

            // Add order to existing DPS
            const dpsResponse =
              await this.driverProgressStageService.addOrderToExistingDPS(
                existingDPS.id,
                orderWithRelations,
                transactionalEntityManager
              );

            if (dpsResponse.EC !== 0 || !dpsResponse.data) {
              throw new WsException('Failed to update DPS');
            }

            dps = dpsResponse.data;

            // Update DPS totals
            dps.total_distance_travelled = Number(
              (Number(dps.total_distance_travelled || 0) + distance).toFixed(4)
            );
            dps.estimated_time_remaining =
              (dps.estimated_time_remaining || 0) + estimatedTime;
            dps.total_tips = Number(
              (Number(dps.total_tips || 0) + Number(totalTips)).toFixed(2)
            );
            dps.total_earns = Number(
              (Number(dps.total_earns || 0) + Number(totalEarns)).toFixed(2)
            );

            // Update stages with correct details
            dps.stages = dps.stages.map(stage => ({
              ...stage,
              details: this.getStageDetails(
                stage.state,
                orderWithRelations,
                driverWithRelations,
                estimatedTime,
                totalTips
              )
            }));

            // Update DPS state
            const orderIndex = dps.orders.length;
            const orderSuffix = `order_${orderIndex}`;
            const nextState = `driver_ready_${orderSuffix}`;

            dps.current_state = nextState;
            dps.previous_state = dps.current_state;
            dps.next_state = `waiting_for_pickup_${orderSuffix}`;

            await transactionalEntityManager.save(DriverProgressStage, dps);
          }

          // Update order
          orderWithRelations.driver_id = driverId;
          orderWithRelations.driver_wage = driver_wage;
          orderWithRelations.status = OrderStatus.DISPATCHED;
          orderWithRelations.tracking_info = OrderTrackingInfo.DISPATCHED;
          orderWithRelations.updated_at = timestamp;
          await transactionalEntityManager.save(Order, orderWithRelations);

          // Update driver's current orders
          if (
            !driverWithRelations.current_orders?.some(o => o.id === orderId)
          ) {
            driverWithRelations.current_orders = [
              ...(driverWithRelations.current_orders || []),
              orderWithRelations
            ];
            await transactionalEntityManager.save(Driver, driverWithRelations);
          }

          // Notify customer about order acceptance
          this.eventEmitter.emit('listenUpdateOrderTracking', {
            ...orderWithRelations,
            order_items: orderWithRelations.order_items,
            orderId: orderWithRelations.id,
            status: orderWithRelations.status,
            tracking_info: orderWithRelations.tracking_info,
            updated_at: orderWithRelations.updated_at,
            customer_id: orderWithRelations.customer_id,
            driver_id: orderWithRelations.driver_id,
            restaurant_id: orderWithRelations.restaurant_id,
            restaurant_avatar: orderWithRelations.restaurant?.avatar || null,
            driver_avatar: driverWithRelations.avatar || null,
            restaurantAddress: orderWithRelations.restaurantAddress,
            customerAddress: orderWithRelations.customerAddress,
            driverDetails: {
              id: driverWithRelations.id,
              first_name: driverWithRelations.first_name || 'N/A',
              last_name: driverWithRelations.last_name || 'N/A',
              avatar: driverWithRelations.avatar,
              rating: driverWithRelations.rating || { average_rating: '4.8' },
              vehicle: driverWithRelations.vehicle || {
                color: 'N/A',
                model: 'N/A',
                license_plate: 'N/A'
              }
            }
          });

          // Emit events
          this.server.to(`driver_${driverId}`).emit('driverStagesUpdated', {
            ...orderWithRelations,
            ...dps
          });
          this.eventEmitter.emit('order.statusUpdated', {
            orderId,
            status: OrderStatus.DISPATCHED,
            driverId
          });

          return {
            success: true,
            data: { order: orderWithRelations, dps }
          };
        }
      );

      return result;
    } catch (error) {
      console.error(
        '[DriversGateway] Error in handleDriverAcceptOrder:',
        error
      );
      throw error;
    } finally {
      await this.redisService.del(lockKey);
    }
  }

  private getStageDetails(
    state: string,
    order: Order,
    driver: Driver,
    estimatedTime: number,
    tip: number
  ): any {
    const baseDetails = {
      estimated_time: estimatedTime,
      actual_time: 0,
      notes: '',
      tip: state.includes('delivery_complete') ? tip : 0
    };

    if (
      state.startsWith('waiting_for_pickup_') ||
      state.startsWith('restaurant_pickup_')
    ) {
      return {
        ...baseDetails,
        location: order.restaurantAddress?.location,
        restaurantDetails: order.restaurant
          ? {
              id: order.restaurant.id,
              restaurant_name: order.restaurant.restaurant_name,
              address: order.restaurant.address,
              avatar: order.restaurant.avatar,
              contact_phone: order.restaurant.contact_phone
            }
          : undefined
      };
    } else if (
      state.startsWith('en_route_to_customer_') ||
      state.startsWith('delivery_complete_')
    ) {
      return {
        ...baseDetails,
        location: order.customerAddress?.location,
        customerDetails: order.customer
          ? {
              id: order.customer.id,
              first_name: order.customer.first_name,
              last_name: order.customer.last_name,
              address: order.customer.address,
              avatar: order.customer.avatar
            }
          : undefined
      };
    } else if (state.startsWith('driver_ready_')) {
      return {
        ...baseDetails,
        location: driver.current_location
      };
    }
    return baseDetails;
  }

  @OnEvent('order.assignedToDriver')
  async handleOrderAssignedToDriver(orderAssignment: any) {
    try {
      const driverId = orderAssignment.driverListenerId;
      if (!driverId) throw new WsException('Driver ID is required');
      console.log('cehck what order here in dg', orderAssignment);

      const order = await this.ordersService.findOne(orderAssignment.id);

      if (!order?.data) throw new WsException('Order not found');

      const driverNotificationData = this.prepareDriverNotificationData(
        order.data
      );

      const clients = await this.server.in(`driver_${driverId}`).fetchSockets();
      console.log(
        `[DriversGateway] Emitting to room driver_${driverId}, clients: ${clients.length}`
      );

      await this.server
        .to(`driver_${driverId}`)
        .emit('incomingOrderForDriver', {
          event: 'incomingOrderForDriver',
          data: {
            ...driverNotificationData,
            distance: orderAssignment.distance,
            driver_wage: orderAssignment.driver_wage,
            driver_earn: orderAssignment.driver_wage
          },
          message: 'Order received successfully'
        });

      console.log(
        `[DriversGateway] Emitted incomingOrderForDriver to driver ${driverId}`
      );

      return { event: 'orderAssigned', data: { success: true } };
    } catch (error: any) {
      console.error(
        '[DriversGateway] Error handling order.assignedToDriver:',
        error
      );
      throw new WsException(
        error instanceof WsException ? error.message : 'Internal server error'
      );
    }
  }

  @OnEvent('driver.receivedTip')
  async handleDriverReceivedTip(tipData: any) {
    try {
      const { driverId, orderId, tipAmount, tipTime, totalTips, orderDetails } =
        tipData;

      if (!driverId) {
        console.error(
          '[DriversGateway] Driver ID is required for tip notification'
        );
        return;
      }

      console.log(
        `[DriversGateway] Processing tip notification for driver ${driverId}:`,
        {
          orderId,
          tipAmount,
          totalTips
        }
      );

      // Get connected clients for the driver
      const clients = await this.server.in(`driver_${driverId}`).fetchSockets();
      console.log(
        `[DriversGateway] Emitting tip notification to room driver_${driverId}, clients: ${clients.length}`
      );

      if (clients.length === 0) {
        console.log(
          `[DriversGateway] No connected clients for driver ${driverId}, tip notification not sent`
        );
        return;
      }

      // Emit tip notification to the driver
      this.server.to(`driver_${driverId}`).emit('tipReceived', {
        event: 'tipReceived',
        data: {
          orderId,
          tipAmount,
          tipTime,
          totalTips,
          orderDetails,
          message: `You received a tip of $${tipAmount}! 🎉`
        },
        message: `Tip received: $${tipAmount}`
      });

      console.log(
        `[DriversGateway] Successfully emitted tip notification to driver ${driverId} - Amount: $${tipAmount}`
      );

      return { event: 'tipNotified', data: { success: true } };
    } catch (error: any) {
      console.error(
        '[DriversGateway] Error handling driver.receivedTip:',
        error
      );
      // Don't throw error to avoid breaking the tip flow
    }
  }

  private async handleDeliveryCompletion(
    order: Order,
    dps: DriverProgressStage,
    transactionalEntityManager: EntityManager
  ): Promise<void> {
    logToFile('CRITICAL DEBUG: Starting handleDeliveryCompletion', {
      orderId: order.id,
      dpsId: dps.id,
      orderStatus: order.status,
      driverId: order.driver_id,
      isSubsequentOrder: !order.id.includes('order_1') // Debug flag
    });

    const timestamp = Math.floor(Date.now() / 1000);

    // Update order status without optimistic locking
    await transactionalEntityManager.update(
      Order,
      { id: order.id },
      {
        status: OrderStatus.DELIVERED,
        tracking_info: OrderTrackingInfo.DELIVERED,
        updated_at: timestamp
      }
    );

    logToFile('[CRITICAL FIX] Updated order status to DELIVERED', {
      orderId: order.id,
      status: OrderStatus.DELIVERED
    });

    // Fetch driver
    const driver = await transactionalEntityManager
      .getRepository(Driver)
      .findOne({
        where: { id: order.driver_id },
        relations: ['current_orders']
      });

    if (!driver) {
      throw new Error(`Driver ${order.driver_id} not found`);
    }

    // CRITICAL FIX: Remove order from driver's current_orders with detailed logging
    logToFile('BEFORE deleting from driver_current_orders', {
      driverId: driver.id,
      orderId: order.id,
      orderStatus: order.status
    });

    // CRITICAL FIX: Use proper repository deletion method instead of raw query
    const deleteResult = await transactionalEntityManager
      .createQueryBuilder()
      .delete()
      .from('driver_current_orders')
      .where('driver_id = :driverId AND order_id = :orderId', {
        driverId: driver.id,
        orderId: order.id
      })
      .execute();

    // BACKUP FIX: If above fails, try alternative deletion method
    if (deleteResult.affected === 0) {
      logToFile('Primary deletion failed, trying backup method', {
        driverId: driver.id,
        orderId: order.id
      });

      const backupDeleteResult = await transactionalEntityManager.query(
        'DELETE FROM driver_current_orders WHERE driver_id = $1 AND order_id = $2',
        [driver.id, order.id]
      );

      logToFile('Backup deletion result', {
        driverId: driver.id,
        orderId: order.id,
        backupResult: backupDeleteResult
      });
    }

    logToFile('AFTER deleting from driver_current_orders', {
      driverId: driver.id,
      orderId: order.id,
      deleteResult: deleteResult.affected,
      deletedRows: deleteResult.affected
    });

    // CRITICAL FIX: Verify deletion by checking if record still exists
    const remainingRecords = await transactionalEntityManager
      .createQueryBuilder()
      .select('*')
      .from('driver_current_orders', 'dco')
      .where('dco.driver_id = :driverId AND dco.order_id = :orderId', {
        driverId: driver.id,
        orderId: order.id
      })
      .getRawMany();

    // BACKUP VERIFICATION: Try alternative column names if above fails
    if (remainingRecords.length === 0) {
      const backupVerification = await transactionalEntityManager.query(
        'SELECT * FROM driver_current_orders WHERE driver_id = $1 AND order_id = $2',
        [driver.id, order.id]
      );

      logToFile('Backup verification result', {
        driverId: driver.id,
        orderId: order.id,
        backupRecords: backupVerification.length,
        backupData: backupVerification
      });
    }

    logToFile('VERIFICATION: Remaining driver_current_orders records', {
      driverId: driver.id,
      orderId: order.id,
      remainingRecords: remainingRecords.length,
      records: remainingRecords
    });

    // Calculate distance
    let distance = order.distance || 0;
    if (order.customerAddress?.location && order.restaurantAddress?.location) {
      const cLoc = order.customerAddress.location;
      const rLoc = order.restaurantAddress.location;
      distance = this.calculateDistance(cLoc.lat, cLoc.lng, rLoc.lat, rLoc.lng);
    }

    // Update order distance
    await transactionalEntityManager.update(
      Order,
      { id: order.id },
      { distance, updated_at: timestamp }
    );

    // Update DPS total distance
    dps.total_distance_travelled = Number(
      (Number(dps.total_distance_travelled || 0) + Number(distance)).toFixed(4)
    );
    await transactionalEntityManager.save(DriverProgressStage, dps);

    logToFile('Updated DPS total distance', {
      dpsId: dps.id,
      totalDistance: dps.total_distance_travelled
    });

    // Process transaction with Redis lock
    const lockKey = `order_transaction:${order.id}`;
    const lockAcquired = await this.redisService.setNx(lockKey, 'locked', 3000);
    await this.redisService.del(`orders:customer:${order.customer_id}`);
    try {
      if (!lockAcquired) {
        logToFile('Failed to acquire lock for transaction', {
          orderId: order.id
        });
        return;
      }

      const existingTx = await transactionalEntityManager
        .getRepository(Transaction)
        .findOne({
          where: {
            source: 'FWALLET',
            destination_type: 'FWALLET',
            reference_order_id: order.id,
            transaction_type: 'PURCHASE'
          }
        });

      if (existingTx) {
        logToFile('Transaction already exists, skipping', {
          orderId: order.id,
          transactionId: existingTx.id
        });
        return;
      }

      const driverWallet = await this.fWalletsRepository.findByUserId(
        driver.user_id,
        transactionalEntityManager
      );
      if (!driverWallet) {
        throw new Error(`Wallet not found for driver ${driver.id}`);
      }

      let financeWallet = await this.fWalletsRepository.findById(
        FLASHFOOD_FINANCE.id,
        transactionalEntityManager
      );
      if (!financeWallet) {
        throw new Error('Finance wallet not found');
      }

      let transactionResponse;
      let attempt = 0;
      while (attempt < 3) {
        transactionResponse = await this.transactionsService.create(
          {
            user_id: driver.user_id,
            fwallet_id: financeWallet.id,
            transaction_type: 'PURCHASE',
            amount: order.delivery_fee,
            balance_after:
              Number(financeWallet.balance) - Number(order.delivery_fee),
            version: financeWallet.version || 0,
            status: 'PENDING',
            source: 'FWALLET',
            destination_type: 'FWALLET',
            destination: driverWallet.id,
            reference_order_id: order.id
          },
          transactionalEntityManager
        );
        if (transactionResponse.EC === 0) {
          break;
        }
        if (transactionResponse.EM?.includes('Wallet version mismatch')) {
          financeWallet = await this.fWalletsRepository.findById(
            FLASHFOOD_FINANCE.id,
            transactionalEntityManager
          );
          attempt++;
          continue;
        }
        throw new Error(transactionResponse.EM || 'Transaction failed');
      }

      this.redisService.del(`fwallet:${driver.user_id}`);
      this.redisService.del(
        `orders:restaurant:${order.restaurant_id}:page:1:limit:50`
      );

      if (order.customer_id) {
        await this.redisService.del(`orders:customer:${order.customer_id}`);
      }
      this.redisService.del(`orders:customer:${order.customer_id}`);

      logToFile('Created transaction', {
        orderId: order.id,
        transactionId: transactionResponse.data.id,
        amount: transactionResponse.data.amount
      });
    } finally {
      if (lockAcquired) {
        await this.redisService.del(lockKey);
      }
    }

    // Create notifications for order completion
    await this.createDeliveryCompletionNotifications(
      order,
      transactionalEntityManager
    );
  }

  private async createDeliveryCompletionNotifications(
    order: Order,
    transactionalEntityManager: EntityManager
  ): Promise<void> {
    try {
      logToFile('Creating delivery completion notifications', {
        orderId: order.id,
        customerId: order.customer_id,
        restaurantId: order.restaurant_id
      });

      // Get order with relations for notification content
      const orderWithRelations = await transactionalEntityManager
        .getRepository(Order)
        .findOne({
          where: { id: order.id },
          relations: ['customer', 'restaurant']
        });

      if (!orderWithRelations) {
        logToFile('Order not found for notifications', { orderId: order.id });
        return;
      }

      const timestamp = Date.now(); // Use milliseconds for notifications

      // Create customer notification
      if (orderWithRelations.customer) {
        const customerNotificationData = {
          avatar: {
            url: IMAGE_LINKS.ORDER_DELIVERED,
            key: 'delivery-success'
          },
          title: 'Order Delivered Successfully! 🎉',
          desc: `Your order #${order.id} has been delivered successfully. Thank you for choosing FlashFood!`,
          image: null,
          link: `/orders/${order.id}`,
          target_user: [TargetUser.CUSTOMER],
          created_by_id: ADMIN_MOCK.admin_id,
          target_user_id: orderWithRelations.customer.id
        };

        const customerNotificationResponse =
          await this.notificationsService.create(customerNotificationData);

        if (customerNotificationResponse.EC === 0) {
          logToFile('Customer notification created successfully', {
            orderId: order.id,
            customerId: orderWithRelations.customer.id,
            notificationId: customerNotificationResponse.data.id
          });
        } else {
          logToFile('Failed to create customer notification', {
            orderId: order.id,
            customerId: orderWithRelations.customer.id,
            error: customerNotificationResponse.EM
          });
        }
      }

      // Create restaurant notification
      if (orderWithRelations.restaurant) {
        const restaurantNotificationData = {
          avatar: {
            url: IMAGE_LINKS.ORDER_DELIVERED,
            key: 'delivery-complete'
          },
          title: 'Order Delivered to Customer! ✅',
          desc: `Order #${order.id} has been successfully delivered to your customer. Great job!`,
          image: null,
          link: `/orders/${order.id}`,
          target_user: [TargetUser.RESTAURANT],
          created_by_id: ADMIN_MOCK.admin_id,
          target_user_id: orderWithRelations.restaurant.id
        };

        const restaurantNotificationResponse =
          await this.notificationsService.create(restaurantNotificationData);

        if (restaurantNotificationResponse.EC === 0) {
          logToFile('Restaurant notification created successfully', {
            orderId: order.id,
            restaurantId: orderWithRelations.restaurant.id,
            notificationId: restaurantNotificationResponse.data.id
          });
        } else {
          logToFile('Failed to create restaurant notification', {
            orderId: order.id,
            restaurantId: orderWithRelations.restaurant.id,
            error: restaurantNotificationResponse.EM
          });
        }
      }
    } catch (error: any) {
      logToFile('Error creating delivery completion notifications', {
        orderId: order.id,
        error: error.message,
        stack: error.stack
      });
      // Don't throw error to avoid breaking the main delivery completion flow
      console.error('Error creating delivery completion notifications:', error);
    }
  }

  private prepareDriverNotificationData(order: any) {
    return {
      orderId: order.id,
      customer_id: order.customer_id,
      restaurant_id: order.restaurant_id,
      driver_id: order.driver_id,
      status: order.status,
      tracking_info: order.tracking_info,
      updated_at: order.updated_at,
      order_items: order.order_items,
      restaurantAddress: order.restaurantAddress,
      customerAddress: order.customerAddress,
      restaurant: order.restaurant
        ? { id: order.restaurant.id, name: order.restaurant.name }
        : null,
      customer: order.customer
        ? { id: order.customer.id, name: order.customer.name }
        : null,
      driver: order.driver
        ? {
            id: order.driver.id,
            name: order.driver.name,
            avatar: order.driver.avatar
          }
        : null
    };
  }

  private prepareAddressData(address: any) {
    const defaultAddress = {
      id: '',
      street: 'N/A',
      city: '',
      nationality: '',
      is_default: false,
      created_at: 0,
      updated_at: 0,
      postal_code: 0,
      location: { lat: 0, lng: 0 },
      title: ''
    };

    if (!address) return defaultAddress;

    // Ensure location data exists and is valid
    if (
      !address.location ||
      !address.location.lat ||
      !address.location.lng ||
      isNaN(address.location.lat) ||
      isNaN(address.location.lng)
    ) {
      console.warn('Invalid location data in address:', address);
      address.location = defaultAddress.location;
    }

    return address;
  }

  private prepareDriverDetails(driver: any) {
    if (!driver) return null;

    return {
      id: driver.id,
      first_name: driver.first_name || 'N/A',
      last_name: driver.last_name || 'N/A',
      avatar: driver.avatar,
      rating: driver.rating || { average_rating: '4.8' },
      vehicle: driver.vehicle || {
        color: 'N/A',
        model: 'N/A',
        license_plate: 'N/A'
      }
    };
  }

  private formatFullAddress(address: any) {
    if (!address) return 'N/A';
    return `${address.street}, ${address.city}, ${address.nationality}`;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    // Validate inputs
    if (
      !lat1 ||
      !lon1 ||
      !lat2 ||
      !lon2 ||
      isNaN(lat1) ||
      isNaN(lon1) ||
      isNaN(lat2) ||
      isNaN(lon2)
    ) {
      console.warn('Invalid coordinates:', { lat1, lon1, lat2, lon2 });
      return 0;
    }

    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return Number(distance.toFixed(4));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private calculateEstimatedTime(distance: number): number {
    return (distance / 30) * 60;
  }
}
