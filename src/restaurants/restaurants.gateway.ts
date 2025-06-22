import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsResponse,
  WsException,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RestaurantsService } from './restaurants.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { DriversService } from 'src/drivers/drivers.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Type_Delivery_Order } from 'src/types/Driver';
import { calculateDistance } from 'src/utils/commonFunctions';
import {
  OrderStatus,
  OrderTrackingInfo
} from 'src/orders/entities/order.entity';
import { OrdersRepository } from 'src/orders/orders.repository';
import { JwtService } from '@nestjs/jwt';
import { FinanceRulesService } from 'src/finance_rules/finance_rules.service';
import { evaluate } from 'mathjs';
import { DriverStatsService } from 'src/driver_stats_records/driver_stats_records.service';
import { RedisService } from 'src/redis/redis.service';
import { createAdapter } from '@socket.io/redis-adapter';
import { OrdersService } from 'src/orders/orders.service';
import { Logger } from '@nestjs/common';

interface AvailableDriver {
  id: string;
  lat: number;
  lng: number;
}

interface RestaurantAcceptData {
  availableDrivers: AvailableDriver[];
  orderDetails: string; // orderId
}

@Injectable()
@WebSocketGateway({
  namespace: 'restaurant',
  cors: {
    origin: ['*', process.env.FULL_BACKEND_URL],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket'],
  pingTimeout: 180000,
  pingInterval: 30000,
  maxHttpBufferSize: 1e6
})
export class RestaurantsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  private server: Server;
  private notificationLock = new Map<string, boolean>();
  private activeConnections = new Map<string, Socket>();
  private restaurantSockets = new Map<string, Set<string>>();
  private redisClient: any;
  private isListenerRegistered = false;
  private readonly logger = new Logger(RestaurantsGateway.name);

  constructor(
    @Inject('SOCKET_SERVER') private socketServer: any,
    @Inject(forwardRef(() => RestaurantsService))
    private readonly restaurantsService: RestaurantsService,
    @Inject(forwardRef(() => DriversService))
    private readonly driverService: DriversService,
    private eventEmitter: EventEmitter2,
    private readonly ordersRepository: OrdersRepository,
    private readonly jwtService: JwtService,
    private readonly driverStatsService: DriverStatsService,
    private readonly financeRulesService: FinanceRulesService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService
  ) {
    this.redisClient = this.redisService.getClient();
    this.logger.log(
      '[RestaurantsGateway] Constructor called, instance ID:',
      Math.random()
    );
  }

  afterInit() {
    this.logger.log('[RestaurantsGateway] Initialized');
    if (!this.server) {
      this.logger.error(
        '[RestaurantsGateway] WebSocket server is null after initialization'
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
            this.logger.log(
              '[RestaurantsGateway] Redis subClient already open, skipping connect'
            );
          } else {
            await subClient.connect();
            this.logger.log('[RestaurantsGateway] Redis subClient connected');
          }
          const redisAdapter = createAdapter(pubClient, subClient);
          this.server.adapter(redisAdapter);
          this.logger.log(
            '[RestaurantsGateway] Socket.IO Redis adapter initialized successfully'
          );
        } catch (err: any) {
          if (retryCount < maxRetries) {
            retryCount++;
            this.logger.warn(
              `[RestaurantsGateway] Retrying Redis connection (${retryCount}/${maxRetries})...`
            );
            setTimeout(connectRedis, 2000);
          } else {
            this.logger.error(
              '[RestaurantsGateway] Failed to initialize Redis adapter after retries:',
              err.message
            );
          }
        }
      };
      connectRedis();
    } catch (err: any) {
      this.logger.error(
        '[RestaurantsGateway] Error setting up Redis adapter:',
        err.message
      );
    }

    // Kiểm tra và cleanup listeners cũ
    const listenerCount = this.eventEmitter.listenerCount(
      'listenUpdateOrderTracking'
    );
    this.logger.log(
      `[RestaurantsGateway] Current listenUpdateOrderTracking listeners: ${listenerCount}`
    );
    if (listenerCount > 1) {
      this.logger.warn(
        '[RestaurantsGateway] Multiple listeners detected, removing all'
      );
      this.eventEmitter.removeAllListeners('listenUpdateOrderTracking');
    }

    // Check and cleanup newOrderForRestaurant listeners
    const newOrderListenerCount = this.eventEmitter.listenerCount(
      'newOrderForRestaurant'
    );
    this.logger.log(
      `[RestaurantsGateway] Current newOrderForRestaurant listeners: ${newOrderListenerCount}`
    );
    if (newOrderListenerCount > 1) {
      this.logger.warn(
        '[RestaurantsGateway] Multiple newOrderForRestaurant listeners detected, removing all'
      );
      this.eventEmitter.removeAllListeners('newOrderForRestaurant');
    }

    // Đăng ký listener chỉ 1 lần
    if (!this.isListenerRegistered) {
      this.eventEmitter.on(
        'listenUpdateOrderTracking',
        this.handleOrderTrackingUpdate.bind(this)
      );
      this.eventEmitter.on(
        'newOrderForRestaurant',
        this.handleNewOrder.bind(this)
      );
      this.isListenerRegistered = true;
      this.logger.log(
        '[RestaurantsGateway] Registered listeners for listenUpdateOrderTracking and newOrderForRestaurant'
      );
    }

    this.server.setMaxListeners(300);
  }

  async onModuleDestroy() {
    this.eventEmitter.removeListener(
      'listenUpdateOrderTracking',
      this.handleOrderTrackingUpdate.bind(this)
    );
    this.eventEmitter.removeListener(
      'newOrderForRestaurant',
      this.handleNewOrder.bind(this)
    );
    this.isListenerRegistered = false;
    if (this.redisClient && this.redisClient.isOpen) {
      await this.redisClient.quit();
    }
    this.logger.log(
      '[RestaurantsGateway] Removed listeners and closed Redis connection'
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
      this.logger.error(
        '[RestaurantsGateway] Token validation error:',
        error.message
      );
      throw new WsException('Token validation failed');
    }
  }

  async handleConnection(client: Socket) {
    try {
      this.logger.log(
        '⚡️ Client connected to restaurant namespace:',
        client.id
      );
      const restaurantData = await this.validateToken(client);
      if (!restaurantData) {
        this.logger.log(
          '[RestaurantsGateway] Invalid token, disconnecting:',
          client.id
        );
        client.disconnect(true);
        return;
      }

      const restaurantId = restaurantData.id;
      this.logger.log(
        `[RestaurantsGateway] Restaurant ${restaurantId} attempting connection:`,
        client.id
      );

      // Lock để tránh nhiều kết nối đồng thời
      const lockKey = `lock:restaurant:connect:${restaurantId}`;
      let lockAcquired = false;
      let retryCount = 0;
      const maxRetries = 10;
      const retryDelay = 100;
      const lockTTL = 30000;

      while (!lockAcquired && retryCount < maxRetries) {
        lockAcquired = await this.redisService.setNx(
          lockKey,
          client.id,
          lockTTL
        );
        if (!lockAcquired) {
          const existingSocketId = await this.redisService.get(lockKey);
          if (existingSocketId && existingSocketId !== client.id) {
            const existingSocket = this.activeConnections.get(existingSocketId);
            if (existingSocket && existingSocket.connected) {
              this.logger.log(
                `[RestaurantsGateway] Active connection exists for restaurant ${restaurantId} with socket ${existingSocketId}, disconnecting ${client.id}`
              );
              client.disconnect(true);
              return;
            }
            await this.redisService.del(lockKey);
          }
          retryCount++;
          this.logger.log(
            `[RestaurantsGateway] Retrying lock for restaurant ${restaurantId} (${retryCount}/${maxRetries})`
          );
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }

      if (!lockAcquired) {
        this.logger.log(
          `[RestaurantsGateway] Failed to acquire lock for restaurant ${restaurantId}, disconnecting ${client.id}`
        );
        client.disconnect(true);
        return;
      }

      try {
        const clients = await this.server
          .in(`restaurant_${restaurantId}`)
          .fetchSockets();
        if (clients.length > 0) {
          this.logger.warn(
            `[RestaurantsGateway] Multiple clients detected in room restaurant_${restaurantId}, cleaning up`
          );
          await this.cleanupRestaurantConnections(restaurantId, client.id);
        }

        await client.join(`restaurant_${restaurantId}`);
        this.logger.log(
          `Restaurant auto-joined restaurant_${restaurantId} via token`
        );

        this.restaurantSockets.set(restaurantId, new Set([client.id]));
        this.logger.log(
          `[RestaurantsGateway] Updated socket set for restaurant ${restaurantId}:`,
          this.restaurantSockets.get(restaurantId)
        );

        this.activeConnections.set(client.id, client);

        const updatedClients = await this.server
          .in(`restaurant_${restaurantId}`)
          .fetchSockets();
        this.logger.log(
          `[RestaurantsGateway] Clients in room restaurant_${restaurantId}:`,
          updatedClients.length
        );

        client.emit('connected', { restaurantId, status: 'connected' });
      } finally {
        await this.redisService.del(lockKey);
      }
    } catch (error: any) {
      this.logger.error(
        '[RestaurantsGateway] Error handling connection:',
        error.message
      );
      client.disconnect(true);
    }
  }

  async cleanupRestaurantConnections(
    restaurantId: string,
    newSocketId: string
  ) {
    this.logger.log(
      `[RestaurantsGateway] Cleaning up connections for restaurant ${restaurantId}`
    );
    const socketIds = this.restaurantSockets.get(restaurantId) || new Set();
    const existingSockets = await this.server
      .in(`restaurant_${restaurantId}`)
      .fetchSockets();

    for (const socket of existingSockets) {
      if (socket.id !== newSocketId) {
        const activeSocket = this.activeConnections.get(socket.id);
        if (activeSocket) {
          this.logger.log(
            `[RestaurantsGateway] Disconnecting old socket ${socket.id} for restaurant ${restaurantId}`
          );
          activeSocket.removeAllListeners();
          activeSocket.leave(`restaurant_${restaurantId}`);
          activeSocket.disconnect(true);
          this.activeConnections.delete(socket.id);
        }
      }
    }

    for (const socketId of socketIds) {
      if (socketId !== newSocketId) {
        this.activeConnections.delete(socketId);
      }
    }
    this.restaurantSockets.delete(restaurantId);
    this.logger.log(
      `[RestaurantsGateway] Removed socket set for restaurant ${restaurantId}`
    );

    this.notificationLock.delete(`notify_${restaurantId}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(
      '❌ Client disconnected from restaurant namespace:',
      client.id
    );
    const restaurantId = Array.from(this.restaurantSockets.keys()).find(key => {
      const socketSet = this.restaurantSockets.get(key);
      return socketSet && socketSet.has(client.id);
    });

    this.activeConnections.delete(client.id);

    if (restaurantId) {
      const socketSet = this.restaurantSockets.get(restaurantId);
      if (socketSet) {
        socketSet.delete(client.id);
        if (socketSet.size === 0) {
          this.restaurantSockets.delete(restaurantId);
        }
      }
      client.leave(`restaurant_${restaurantId}`);
      client.removeAllListeners();
    }
  }

  @SubscribeMessage('updateRestaurant')
  async handleUpdateRestaurant(
    @MessageBody() updateRestaurantDto: UpdateRestaurantDto
  ) {
    const restaurant = await this.restaurantsService.update(
      updateRestaurantDto.id,
      updateRestaurantDto
    );
    this.server.emit('restaurantUpdated', restaurant);
    return restaurant;
  }

  @OnEvent('newOrderForRestaurant')
  async handleNewOrder(@MessageBody() order: any) {
    this.logger.log('Received newOrderForRestaurant:', order);
    await this.server
      .to(`restaurant_${order.restaurant_id}`)
      .emit('incomingOrderForRestaurant', {
        orderId: order.order.orderId,
        status: order.order.status,
        tracking_info: order.order.tracking_info,
        updated_at: order.order.updated_at,
        customer_id: order.order.customer_id,
        total_amount: order.order.total_amount,
        order_items: order.order.order_items,
        driver_id: order.order.driver_id,
        restaurant_id: order.order.restaurant_id,
        restaurant_avatar: order.order.restaurant_avatar || null,
        driver_avatar: order.order.driver_avatar || null,
        restaurantAddress: order.order.restaurantAddress,
        customerAddress: order.order.customerAddress
      });
    this.logger.log(
      `Emitted incomingOrderForRestaurant to restaurant_${order.restaurant_id}`
    );
    return {
      event: 'newOrderForRestaurant',
      data: order,
      message: `Notified restaurant ${order.restaurant_id}`
    };
  }

  @SubscribeMessage('restaurantAcceptWithAvailableDrivers')
  async handleRestaurantAccept(
    @MessageBody() data: RestaurantAcceptData,
    @ConnectedSocket() client: Socket
  ): Promise<WsResponse<any>> {
    const { orderDetails: orderId, availableDrivers } = data;
    const restaurantId = Array.from(this.restaurantSockets.keys()).find(key => {
      const socketSet = this.restaurantSockets.get(key);
      return socketSet && socketSet.has(client.id);
    });

    if (!restaurantId) {
      throw new WsException('Restaurant not authorized');
    }
    const lockKey = `event:restaurant:accept:${orderId}`;
    const lockAcquired = await this.redisService.setNx(
      lockKey,
      client.id,
      300000
    );
    if (!lockAcquired) {
      this.logger.log(
        `[RestaurantsGateway] Skipping duplicated restaurantAccept for order ${orderId}`
      );
      return { event: 'restaurantAcceptWithAvailableDrivers', data: undefined };
    }

    try {
      const order = await this.ordersService.findOne(orderId);
      if (!order?.data) {
        throw new WsException(`Order ${orderId} not found`);
      }

      if (order.data.restaurant_id !== restaurantId) {
        throw new WsException('Restaurant not authorized for this order');
      }

      await this.ordersService.update(orderId, {
        status: OrderStatus.PREPARING,
        tracking_info: OrderTrackingInfo.PREPARING
      });

      const mappedDrivers = this.prepareDriverData(availableDrivers);
      const responsePrioritizeDrivers =
        await this.driverService.prioritizeAndAssignDriver(
          mappedDrivers,
          order.data as unknown as Type_Delivery_Order
        );

      if (!this.isValidDriverResponse(responsePrioritizeDrivers)) {
        this.logger.log(
          '[RestaurantsGateway] No suitable driver found for order:',
          orderId
        );
        return {
          event: 'noDriver',
          data: { message: 'No suitable driver found' }
        };
      }

      const selectedDriver = responsePrioritizeDrivers.data[0];
      const { distance, driver_wage } = await this.calculateOrderMetrics(
        order.data
      );
      if (driver_wage === null) {
        throw new WsException('Failed to calculate driver wage');
      }

      await this.updateOrderWithMetrics(orderId, distance, driver_wage);
      const updatedOrder = await this.getUpdatedOrder(orderId);

      this.eventEmitter.emit('listenUpdateOrderTracking', {
        orderId: updatedOrder.id,
        status: updatedOrder.status,
        tracking_info: updatedOrder.tracking_info,
        updated_at: updatedOrder.updated_at,
        customer_id: updatedOrder.customer_id,
        driver_id: updatedOrder.driver_id,
        restaurant_id: updatedOrder.restaurant_id,
        restaurant_avatar: updatedOrder.restaurant?.avatar || null,
        driver_avatar: updatedOrder.driver?.avatar || null,
        restaurantAddress: updatedOrder.restaurantAddress,
        customerAddress: updatedOrder.customerAddress
      });

      await this.notifyDriverAndParties(
        updatedOrder,
        selectedDriver.id,
        driver_wage
      );

      await this.notifyPartiesOnce(updatedOrder);

      this.logger.log(
        '[RestaurantsGateway] Successfully handled restaurantAccept for order:',
        orderId
      );
      return { event: 'restaurantAcceptWithAvailableDrivers', data: undefined };
    } catch (error: any) {
      this.logger.error(
        '[RestaurantsGateway] Error handling restaurantAccept:',
        error
      );
      throw new WsException(error.message);
    } finally {
      await this.redisService.del(lockKey);
    }
  }

  private prepareDriverData(availableDrivers: AvailableDriver[]) {
    this.logger.log('Preparing driver data:', availableDrivers);
    return availableDrivers.map(item => ({
      id: item.id,
      location: { lat: item.lat, lng: item.lng },
      active_points: 0,
      current_order_id: []
    }));
  }

  private isValidDriverResponse(response: any) {
    return response.EC === 0 && response.data.length > 0;
  }

  private async calculateOrderMetrics(order: any) {
    const res_location = order.restaurantAddress as unknown as {
      location: { lat: number; lng: number };
    };
    const customer_location = order.customerAddress as unknown as {
      location: { lat: number; lng: number };
    };

    const distance = calculateDistance(
      customer_location?.location?.lat ?? 0,
      customer_location?.location?.lng ?? 0,
      res_location?.location?.lat ?? 0,
      res_location?.location?.lng ?? 0
    );

    const driver_wage = await this.calculateDriverWage(distance);
    return { distance, driver_wage };
  }

  private async calculateDriverWage(distance: number) {
    const latestFinanceRuleResponse =
      await this.financeRulesService.findOneLatest();
    const { EC, EM, data } = latestFinanceRuleResponse;

    if (EC !== 0) {
      this.logger.error('Error getting finance rules:', EM);
      return null;
    }

    try {
      if (distance >= 0 && distance <= 1) {
        return data.driver_fixed_wage['0-1km'];
      } else if (distance > 1 && distance <= 2) {
        return data.driver_fixed_wage['1-2km'];
      } else if (distance > 2 && distance <= 3) {
        return data.driver_fixed_wage['2-3km'];
      } else if (distance > 3 && distance <= 5) {
        return data.driver_fixed_wage['4-5km'];
      } else if (distance > 5) {
        const formula = data.driver_fixed_wage['>5km'];
        return evaluate(formula.replace('km', distance.toString()));
      }
      return null;
    } catch (error: any) {
      this.logger.error('Error calculating driver wage:', error);
      return null;
    }
  }

  private async updateOrderWithMetrics(
    orderId: string,
    distance: number,
    driver_wage: number
  ) {
    const updatedFields = {
      distance: +distance,
      status: OrderStatus.PREPARING,
      tracking_info: OrderTrackingInfo.PREPARING,
      driver_wage: +driver_wage
    };
    this.logger.log('Updating order with fields:', updatedFields);

    await this.ordersRepository.update(orderId, updatedFields);
  }

  private async getUpdatedOrder(orderId: string) {
    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new Error('Failed to retrieve updated order');
    }
    return order;
  }

  private async notifyDriverAndParties(
    order: any,
    driverId: string,
    driver_wage: number
  ) {
    this.logger.log(
      '[RestaurantsGateway] Preparing driver notification for driver:',
      driverId,
      'with wage:',
      driver_wage
    );

    const driverNotificationData = {
      ...order,
      driver_wage,
      total_amount: order.total_amount,
      order_items: order.order_items,
      driver_earn: driver_wage,
      restaurantAddress: order.restaurantAddress,
      customerAddress: order.customerAddress,
      driverListenerId: driverId
    };

    const lockKey = `lock:order:notify:${order.id}`;
    const lockAcquired = await this.redisService.setNx(
      lockKey,
      'locked',
      10000
    );
    if (!lockAcquired) {
      this.logger.log(
        '[RestaurantsGateway] Skipping notify due to existing lock for order:',
        order.id
      );
      return;
    }

    try {
      await this.eventEmitter.emitAsync(
        'order.assignedToDriver',
        driverNotificationData
      );
      this.logger.log(
        '[RestaurantsGateway] Emitted order.assignedToDriver for order:',
        order.id
      );

      await this.notifyPartiesOnce(order);
    } catch (err) {
      this.logger.error(
        '[RestaurantsGateway] Error in notifyDriverAndParties:',
        err
      );
    } finally {
      await this.redisService.del(lockKey);
    }
  }

  @SubscribeMessage('restaurantOrderReady')
  async handleRestaurantOrderReady(@MessageBody() data: { orderId: string }) {
    try {
      const { orderId } = data;
      const order = await this.ordersRepository.update(orderId, {
        status: OrderStatus.READY_FOR_PICKUP,
        tracking_info: OrderTrackingInfo.RESTAURANT_PICKUP
      });
      await this.notifyPartiesOnce(order);
      return { event: 'orderReadyForPickup', data: order };
    } catch (error: any) {
      this.logger.error('Error in handleRestaurantOrderReady:', error);
      return { event: 'error', data: { message: 'Internal server error' } };
    }
  }

  public async notifyPartiesOnce(order: any) {
    const notifyKey = `lock:notify:${order.id}`;
    const lockAcquired = await this.redisService.setNx(
      notifyKey,
      'locked',
      10000
    );
    if (!lockAcquired) {
      this.logger.log(
        `[RestaurantsGateway] Notification for order ${order.id} already in progress, skipping`
      );
      return;
    }

    try {
      const trackingUpdate = {
        orderId: order.id,
        status: order.status,
        tracking_info: order.tracking_info,
        updated_at: order.updated_at,
        customer_id: order.customer_id,
        driver_id: order.driver_id,
        restaurant_id: order.restaurant_id,
        restaurant_avatar: order.restaurant?.avatar || null,
        driver_avatar: order.driver?.avatar || null,
        restaurantAddress: order.restaurantAddress,
        customerAddress: order.customerAddress
      };

      let retryCount = 0;
      const maxRetries = 3;
      const retryDelay = 500;

      while (retryCount < maxRetries) {
        const restaurantClients = await this.server
          .in(`restaurant_${order.restaurant_id}`)
          .fetchSockets();
        this.logger.log(
          `[RestaurantsGateway] Emitting notifyOrderStatus to ${restaurantClients.length} clients in room restaurant_${order.restaurant_id}`
        );

        if (restaurantClients.length > 0) {
          this.server
            .to(`restaurant_${order.restaurant_id}`)
            .emit('notifyOrderStatus', trackingUpdate);
          break;
        }

        retryCount++;
        this.logger.log(
          `[RestaurantsGateway] No clients in room restaurant_${order.restaurant_id}, retrying (${retryCount}/${maxRetries})`
        );
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

      if (order.driver_id) {
        const driverClients = await this.server
          .in(`driver_${order.driver_id}`)
          .fetchSockets();
        this.logger.log(
          `[RestaurantsGateway] Emitting notifyOrderStatus to ${driverClients.length} clients in room driver_${order.driver_id}`
        );
        if (driverClients.length > 0) {
          this.server
            .to(`driver_${order.driver_id}`)
            .emit('notifyOrderStatus', trackingUpdate);
        }
      }

      this.logger.log(
        `[RestaurantsGateway] Emitted notifyOrderStatus for order ${order.id}`
      );

      this.eventEmitter.emit('notifyDriverOrderStatus', trackingUpdate);
    } catch (err) {
      this.logger.error(
        '[RestaurantsGateway] Error in notifyPartiesOnce:',
        err
      );
    } finally {
      await this.redisService.del(notifyKey);
    }
  }

  @OnEvent('listenUpdateOrderTracking')
  async handleOrderTrackingUpdate(@MessageBody() order: any) {
    this.logger.log('Received listenUpdateOrderTracking:', order);
    try {
      const restaurantId = order.restaurant_id;
      if (!restaurantId) {
        this.logger.error('Missing restaurant_id in order:', order);
        return;
      }

      const trackingUpdate = {
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
        .to(`restaurant_${restaurantId}`)
        .emit('notifyOrderStatus', trackingUpdate);
      this.logger.log(
        `Emitted notifyOrderStatus to restaurant_${restaurantId}`
      );

      return {
        event: 'notifyOrderStatus',
        data: trackingUpdate,
        message: `Notified restaurant ${restaurantId}`
      };
    } catch (error) {
      this.logger.error('Error in handleOrderTrackingUpdate:', error);
    }
  }
}
