import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CustomersService } from './customers.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'customer',
  cors: {
    origin: ['*', process.env.FULL_BACKEND_URL],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket']
})
export class CustomersGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CustomersGateway.name);
  private isListenerRegistered = false; // Theo dõi trạng thái listener

  constructor(
    private readonly customersService: CustomersService,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2
  ) {
    this.logger.log('CustomersGateway initialized');
  }

  afterInit() {
    this.logger.log('CustomersGateway afterInit called');

    // Kiểm tra và cleanup listeners cũ
    const listenerCount = this.eventEmitter.listenerCount(
      'listenUpdateOrderTracking'
    );
    this.logger.log(
      `Current listenUpdateOrderTracking listeners: ${listenerCount}`
    );
    if (listenerCount > 1) {
      this.logger.warn('Multiple listeners detected, removing all');
      this.eventEmitter.removeAllListeners('listenUpdateOrderTracking');
    }

    // Đăng ký listener chỉ 1 lần
    if (!this.isListenerRegistered) {
      this.eventEmitter.on(
        'listenUpdateOrderTracking',
        this.handleListenUpdateOrderTracking.bind(this)
      );
      this.isListenerRegistered = true;
      this.logger.log('Registered listener for listenUpdateOrderTracking');
    }

    this.server.setMaxListeners(300);
  }

  async onModuleDestroy() {
    this.eventEmitter.removeListener(
      'listenUpdateOrderTracking',
      this.handleListenUpdateOrderTracking.bind(this)
    );
    this.isListenerRegistered = false;
    this.logger.log('Removed listener for listenUpdateOrderTracking');
  }

  private async validateToken(client: Socket): Promise<any> {
    try {
      const authHeader = client.handshake.headers.auth as string;
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
    } catch (error: any) {
      this.logger.error('Token validation error:', error.message);
      client.disconnect();
      return null;
    }
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected to customer namespace: ${client.id}`);
    const customerData = await this.validateToken(client);
    if (!customerData) return;

    const customerId = customerData.id;
    if (customerId) {
      client.join(`customer_${customerId}`);
      this.logger.log(`Customer auto-joined customer_${customerId} via token`);
    }
  }

  @SubscribeMessage('customerPlaceOrder')
  async handleCustomerPlaceOrder(@MessageBody() order: any) {
    const customerId = order.customer_id;
    const trackingUpdate = {
      orderId: order.id,
      status: order.status,
      tracking_info: order.tracking_info,
      updated_at: order.updated_at,
      customer_id: order.customer_id,
      customer_note: order.customer_note,
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

  @OnEvent('listenUpdateOrderTracking')
  async handleListenUpdateOrderTracking(@MessageBody() order: any) {
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
        customer_note: order.customer_note,
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
    } catch (error) {
      this.logger.error('Error in handleListenUpdateOrderTracking:', error);
    }
  }
}
