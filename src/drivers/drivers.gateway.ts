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
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { DriversService } from './drivers.service';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { forwardRef, Inject } from '@nestjs/common';
import { OrdersService } from 'src/orders/orders.service';
import { DriverProgressStagesService } from 'src/driver_progress_stages/driver_progress_stages.service';
import {
  Order,
  OrderStatus,
  OrderTrackingInfo
  // OrderTrackingInfo
} from 'src/orders/entities/order.entity';
import { DataSource, Like, Not } from 'typeorm'; // Loại bỏ import IsolationLevel
import { DriverProgressStage } from 'src/driver_progress_stages/entities/driver_progress_stage.entity';
import { Driver } from './entities/driver.entity';
// import { createResponse } from 'src/utils/createResponse';
import { AddressBookRepository } from 'src/address_book/address_book.repository';
import { DriversRepository } from './drivers.repository';
import { StageDto } from 'src/driver_progress_stages/dto/create-driver-progress-stage.dto';
import { JwtService } from '@nestjs/jwt';
// import { SemaphoreService } from 'src/semaphor/semaphore.service';

@WebSocketGateway({
  namespace: 'driver',
  cors: {
    origin: ['*', process.env.FULL_BACKEND_URL],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket']
})
export class DriversGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;
  private driverSockets: Map<string, Set<string>> = new Map();
  private notificationLock = new Map<string, boolean>();
  private activeConnections = new Map<string, Socket>();
  private dpsCreationLocks = new Set<string>();
  private requestQueue: Map<string, Promise<void>> = new Map();
  private processingOrders: Set<string> = new Set();

  constructor(
    private readonly restaurantsService: RestaurantsService,
    @Inject(forwardRef(() => DriversService))
    private readonly driverService: DriversService,
    private readonly driverRepository: DriversRepository,
    private eventEmitter: EventEmitter2,
    private readonly ordersService: OrdersService,
    private readonly driverProgressStageService: DriverProgressStagesService,
    private readonly dataSource: DataSource,
    private readonly addressBookRepository: AddressBookRepository,
    private readonly jwtService: JwtService
  ) {}

  afterInit() {
    console.log('Driver Gateway initialized');
  }

  private async validateToken(client: Socket): Promise<any> {
    try {
      const authHeader = client.handshake.headers.auth as string;
      if (!authHeader?.startsWith('Bearer ')) {
        client.disconnect();
        return null;
      }

      const token = authHeader.slice(7);
      if (!token) {
        client.disconnect();
        return null;
      }

      const decoded = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET
      });

      return decoded;
    } catch (error) {
      console.error('Token validation error:', error);
      client.disconnect();
      return null;
    }
  }

  async handleConnection(client: Socket) {
    const driverData = await this.validateToken(client);
    if (!driverData) return;

    const driverId = driverData.id; // Giả sử token có field `id`
    if (driverId) {
      this.cleanupDriverConnections(driverId);
      if (!this.driverSockets.has(driverId)) {
        this.driverSockets.set(driverId, new Set());
      }
      this.driverSockets.get(driverId)?.add(client.id);
      client.join(`driver_${driverId}`);
      console.log(`Driver auto-joined driver_${driverId} via token`);
    }
    this.activeConnections.set(client.id, client);
  }

  private cleanupDriverConnections(driverId: string) {
    for (const [id, socket] of this.activeConnections.entries()) {
      if (socket.handshake.query.driverId === driverId) {
        socket.disconnect();
        this.activeConnections.delete(id);
      }
    }
    this.processingOrders.clear();
    this.dpsCreationLocks.clear();
    this.notificationLock.clear();
  }

  handleDisconnect(client: Socket) {
    console.log(`Driver disconnected: ${client.id}`);
    const driverId = client.handshake.query.driverId as string;
    this.activeConnections.delete(client.id);
    if (driverId) {
      this.processingOrders.delete(`${driverId}_*`);
      this.dpsCreationLocks.delete(driverId);
    }
  }

  @SubscribeMessage('updateDriver')
  async handleUpdateDriver(@MessageBody() updateDriverDto: UpdateDriverDto) {
    const driver = await this.driverService.update(
      updateDriverDto.id,
      updateDriverDto
    );
    this.server.emit('driverUpdated', driver);
    return driver;
  }

  @SubscribeMessage('newOrderForDriver')
  async handleNewOrder(@MessageBody() order: any) {
    const driverId = order.driver_id;
    this.server.to(driverId).emit('incomingOrder', order);
    console.log('Emitted incomingOrder event to driver:', driverId, order);
    return order;
  }
  @SubscribeMessage('driverAcceptOrder')
  async handleDriverAcceptOrder(
    @MessageBody() data: { driverId: string; orderId: string }
  ) {
    const { driverId, orderId } = data;
    const lockKey = `${driverId}_${orderId}`;
    console.log(`Driver ${driverId} accepting order ${orderId}`);

    if (this.processingOrders.has(lockKey)) {
      console.log(
        `Order ${orderId} already being processed by driver ${driverId}`
      );
      return { success: false, message: 'Order is already being processed' };
    }

    this.processingOrders.add(lockKey);

    try {
      const result = await this.dataSource.transaction(
        async transactionalEntityManager => {
          // Bước 1: Load order với lock, không join relation
          const order = await transactionalEntityManager
            .createQueryBuilder(Order, 'order')
            .setLock('pessimistic_write')
            .where('order.id = :id', { id: orderId })
            .getOne();

          if (!order) throw new WsException('Order not found');

          // Bước 2: Load các relation cần thiết, bao gồm nested address
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

          console.log(
            'check order with nested relations',
            orderWithRelations?.customerAddress,
            orderWithRelations?.restaurantAddress,
            orderWithRelations?.customer,
            orderWithRelations?.customer?.address,
            orderWithRelations?.restaurant,
            orderWithRelations?.restaurant?.address,
            orderWithRelations
          );

          if (
            orderWithRelations.driver_id &&
            orderWithRelations.driver_id !== driverId
          ) {
            throw new WsException(
              `Order is already assigned to driver ${orderWithRelations.driver_id}`
            );
          } else if (orderWithRelations.driver_id === driverId) {
            return {
              success: true,
              message: 'Order already assigned to this driver',
              order: orderWithRelations
            };
          }

          const existingOrderDPS = await transactionalEntityManager
            .createQueryBuilder()
            .select('dpo')
            .from('driver_progress_orders', 'dpo')
            .where('dpo.order_id = :orderId', { orderId })
            .getRawOne();
          if (existingOrderDPS) {
            throw new WsException(
              `Order ${orderId} is already assigned to DPS ${existingOrderDPS.driver_progress_id}`
            );
          }

          const driver = await transactionalEntityManager
            .getRepository(Driver)
            .findOne({
              where: { id: driverId },
              relations: ['current_orders']
            });
          if (!driver) throw new WsException('Driver not found');

          const currentOrderCount = driver.current_orders?.length || 0;
          if (currentOrderCount >= 3) {
            throw new WsException(
              'Driver has reached the maximum limit of 3 active orders'
            );
          }

          const existingDPS = await transactionalEntityManager
            .getRepository(DriverProgressStage)
            .findOne({
              where: {
                driver_id: driverId,
                current_state: Not(Like('delivery_complete_%'))
              },
              relations: ['orders']
            });

          let dps: DriverProgressStage;
          if (!existingDPS) {
            // Tạo mới DPS
            const dpsResponse = await this.driverProgressStageService.create(
              {
                driver_id: driverId,
                orders: [orderWithRelations],
                current_state: 'driver_ready_order_1'
              },
              transactionalEntityManager
            );
            if (dpsResponse.EC !== 0 || !dpsResponse.data)
              throw new WsException(`Failed to create new DPS`);
            dps = dpsResponse.data;

            // Gán location, customerDetails, restaurantDetails vào stages
            dps.stages = dps.stages || [];
            dps.stages = dps.stages.map(stage => {
              if (
                stage.state.startsWith('waiting_for_pickup_') ||
                stage.state.startsWith('restaurant_pickup_')
              ) {
                stage.details = {
                  ...stage.details,
                  location: orderWithRelations.restaurantAddress?.location,
                  restaurantDetails: orderWithRelations.restaurant
                    ? {
                        id: orderWithRelations.restaurant.id,
                        restaurant_name:
                          orderWithRelations.restaurant.restaurant_name,
                        address: orderWithRelations.restaurant.address,
                        avatar: orderWithRelations.restaurant.avatar,
                        contact_phone:
                          orderWithRelations.restaurant.contact_phone
                      }
                    : undefined
                };
              } else if (
                stage.state.startsWith('en_route_to_customer_') ||
                stage.state.startsWith('delivery_complete_')
              ) {
                stage.details = {
                  ...stage.details,
                  location: orderWithRelations.customerAddress?.location,
                  customerDetails: orderWithRelations.customer
                    ? {
                        id: orderWithRelations.customer.id,
                        first_name: orderWithRelations.customer.first_name,
                        last_name: orderWithRelations.customer.last_name,
                        address: orderWithRelations.customer.address,
                        avatar: orderWithRelations.customer.avatar
                      }
                    : undefined
                };
              } else if (stage.state.startsWith('driver_ready_')) {
                stage.details = {
                  ...stage.details,
                  location: driver.current_location
                };
              }
              return stage;
            });
            await transactionalEntityManager.save(DriverProgressStage, dps);
          } else {
            // Thêm order vào DPS hiện có
            const dpsResponse =
              await this.driverProgressStageService.addOrderToExistingDPS(
                existingDPS.id,
                orderWithRelations,
                transactionalEntityManager
              );
            if (dpsResponse.EC !== 0 || !dpsResponse.data)
              throw new WsException(`Failed to add order to existing DPS`);
            dps = dpsResponse.data;

            // Gán location, customerDetails, restaurantDetails vào stages
            dps.stages = dps.stages || [];
            dps.stages = dps.stages.map(stage => {
              if (
                stage.state.startsWith('waiting_for_pickup_') ||
                stage.state.startsWith('restaurant_pickup_')
              ) {
                stage.details = {
                  ...stage.details,
                  location: orderWithRelations.restaurantAddress?.location,
                  restaurantDetails: orderWithRelations.restaurant
                    ? {
                        id: orderWithRelations.restaurant.id,
                        restaurant_name:
                          orderWithRelations.restaurant.restaurant_name,
                        address: orderWithRelations.restaurant.address,
                        avatar: orderWithRelations.restaurant.avatar,
                        contact_phone:
                          orderWithRelations.restaurant.contact_phone
                      }
                    : undefined
                };
              } else if (
                stage.state.startsWith('en_route_to_customer_') ||
                stage.state.startsWith('delivery_complete_')
              ) {
                stage.details = {
                  ...stage.details,
                  location: orderWithRelations.customerAddress?.location,
                  customerDetails: orderWithRelations.customer
                    ? {
                        id: orderWithRelations.customer.id,
                        first_name: orderWithRelations.customer.first_name,
                        last_name: orderWithRelations.customer.last_name,
                        address: orderWithRelations.customer.address,
                        avatar: orderWithRelations.customer.avatar
                      }
                    : undefined
                };
              } else if (stage.state.startsWith('driver_ready_')) {
                stage.details = {
                  ...stage.details,
                  location: driver.current_location
                };
              }
              return stage;
            });
            await transactionalEntityManager.save(DriverProgressStage, dps);
          }

          const reloadedDps = await transactionalEntityManager
            .getRepository(DriverProgressStage)
            .findOne({
              where: { id: dps.id },
              relations: ['orders']
            });
          if (
            !reloadedDps ||
            !reloadedDps.orders ||
            reloadedDps.orders.length === 0
          ) {
            throw new WsException('DPS created but orders are empty');
          }
          dps = reloadedDps;

          orderWithRelations.driver_id = driverId;
          orderWithRelations.status = OrderStatus.DISPATCHED;
          orderWithRelations.tracking_info = OrderTrackingInfo.DISPATCHED;
          orderWithRelations.updated_at = Math.floor(Date.now() / 1000);
          await transactionalEntityManager.save(Order, orderWithRelations);

          driver.current_orders = driver.current_orders || [];
          if (!driver.current_orders.some(o => o.id === orderId))
            driver.current_orders.push(orderWithRelations);
          await transactionalEntityManager.save(Driver, driver);

          await this.notifyPartiesOnce(orderWithRelations);

          await this.server
            .to(`driver_${orderWithRelations.driver_id}`)
            .emit('driverStagesUpdated', dps);
          console.log('check emit correct', JSON.stringify(dps, null, 2));

          return { success: true, order: orderWithRelations, dps };
        }
      );

      return result;
    } catch (error) {
      console.error('Error in handleDriverAcceptOrder:', error);
      return {
        success: false,
        message: error.message || 'Internal server error'
      };
    } finally {
      this.processingOrders.delete(lockKey);
      console.log(`Processing lock released for ${lockKey}`);
    }
  }

  @SubscribeMessage('updateDriverProgress')
  async handleDriverProgressUpdate(
    @MessageBody() data: { stageId: string; orderId?: string }
  ) {
    try {
      const result = await this.dataSource.transaction(
        async transactionalEntityManager => {
          const dps = await transactionalEntityManager
            .getRepository(DriverProgressStage)
            .findOne({
              where: { id: data.stageId },
              relations: ['orders']
            });
          if (!dps || !dps.orders || dps.orders.length === 0) {
            return {
              success: false,
              message: !dps
                ? 'Stage not found'
                : 'No orders associated with this stage'
            };
          }

          // Lưu trạng thái cũ để so sánh
          const oldStagesString = JSON.stringify(dps.stages);
          const oldCurrentState = dps.current_state;
          const oldPreviousState = dps.previous_state;
          const oldNextState = dps.next_state;

          const timestamp = Math.floor(Date.now() / 1000);
          const stageOrder = [
            'driver_ready',
            'waiting_for_pickup',
            'restaurant_pickup',
            'en_route_to_customer',
            'delivery_complete'
          ];
          const stageToStatusMap = {
            driver_ready: OrderStatus.DISPATCHED,
            waiting_for_pickup: OrderStatus.READY_FOR_PICKUP,
            restaurant_pickup: OrderStatus.RESTAURANT_PICKUP,
            en_route_to_customer: OrderStatus.EN_ROUTE,
            delivery_complete: OrderStatus.DELIVERED
          };
          const stageToTrackingMap = {
            driver_ready: OrderTrackingInfo.DISPATCHED,
            waiting_for_pickup: OrderTrackingInfo.PREPARING,
            restaurant_pickup: OrderTrackingInfo.RESTAURANT_PICKUP,
            en_route_to_customer: OrderTrackingInfo.EN_ROUTE,
            delivery_complete: OrderTrackingInfo.DELIVERED
          };

          let targetOrderId =
            data.orderId ||
            dps.orders.find((order, index) => {
              const orderSuffix = `order_${index + 1}`;
              const finalState = `delivery_complete_${orderSuffix}`;
              const finalStage = dps.stages.find(s => s.state === finalState);
              return finalStage && finalStage.status !== 'completed';
            })?.id ||
            dps.orders[0].id;

          let updatedStages = [...dps.stages];
          let allCompleted = true;

          for (const [index, order] of dps.orders.entries()) {
            const orderIndex = index + 1;
            const orderSuffix = `order_${orderIndex}`;
            let currentStageIndex = stageOrder.findIndex(baseState => {
              const state = `${baseState}_${orderSuffix}`;
              const stage = updatedStages.find(s => s.state === state);
              return stage && stage.status === 'in_progress';
            });

            if (currentStageIndex === -1) {
              for (let i = stageOrder.length - 1; i >= 0; i--) {
                const state = `${stageOrder[i]}_${orderSuffix}`;
                const stage = updatedStages.find(s => s.state === state);
                if (stage && stage.status === 'completed') {
                  currentStageIndex = i;
                  break;
                }
              }
            }

            if (order.id === targetOrderId) {
              if (currentStageIndex >= 0) {
                const currentState = `${stageOrder[currentStageIndex]}_${orderSuffix}`;
                const nextStateBase =
                  currentStageIndex < stageOrder.length - 1
                    ? stageOrder[currentStageIndex + 1]
                    : null;
                const nextState = nextStateBase
                  ? `${nextStateBase}_${orderSuffix}`
                  : null;

                updatedStages = updatedStages.map((stage): StageDto => {
                  if (
                    stage.state === currentState &&
                    stage.status === 'in_progress'
                  ) {
                    return {
                      ...stage,
                      status: 'completed',
                      duration: timestamp - stage.timestamp
                    };
                  }
                  if (nextState && stage.state === nextState) {
                    if (nextStateBase === 'delivery_complete') {
                      return {
                        ...stage,
                        status: 'completed',
                        timestamp,
                        duration: 0
                      };
                    } else if (stage.status === 'pending') {
                      return { ...stage, status: 'in_progress', timestamp };
                    }
                  }
                  return stage;
                });

                if (nextStateBase && nextStateBase in stageToStatusMap) {
                  const newStatus = stageToStatusMap[nextStateBase];
                  const newTrackingInfo = stageToTrackingMap[nextStateBase];
                  await transactionalEntityManager.update(
                    Order,
                    { id: order.id },
                    {
                      status: newStatus,
                      tracking_info: newTrackingInfo,
                      updated_at: Math.floor(Date.now() / 1000)
                    }
                  );

                  if (nextStateBase === 'delivery_complete') {
                    await transactionalEntityManager
                      .createQueryBuilder()
                      .delete()
                      .from('driver_current_orders')
                      .where('driver_id = :driverId', {
                        driverId: dps.driver_id
                      })
                      .andWhere('order_id = :orderId', { orderId: order.id })
                      .execute();
                  }
                }
              } else if (currentStageIndex < stageOrder.length - 1) {
                allCompleted = false;
                const nextState = `driver_ready_${orderSuffix}`;
                updatedStages = updatedStages.map((stage): StageDto => {
                  if (stage.state === nextState && stage.status === 'pending') {
                    return { ...stage, status: 'in_progress', timestamp };
                  }
                  return stage;
                });

                const newStatus = stageToStatusMap['driver_ready'];
                const newTrackingInfo = stageToTrackingMap['driver_ready'];
                await transactionalEntityManager.update(
                  Order,
                  { id: order.id },
                  {
                    status: newStatus,
                    tracking_info: newTrackingInfo,
                    updated_at: Math.floor(Date.now() / 1000)
                  }
                );
              }
            }

            const finalState = `delivery_complete_${orderSuffix}`;
            const finalStage = updatedStages.find(s => s.state === finalState);
            if (!finalStage || finalStage.status !== 'completed')
              allCompleted = false;
          }

          if (!allCompleted) {
            const nextIncompleteOrder = dps.orders.find((order, index) => {
              const orderSuffix = `order_${index + 1}`;
              const finalState = `delivery_complete_${orderSuffix}`;
              const finalStage = updatedStages.find(
                s => s.state === finalState
              );
              return finalStage && finalStage.status !== 'completed';
            });

            if (
              nextIncompleteOrder &&
              nextIncompleteOrder.id !== targetOrderId
            ) {
              const nextOrderIndex =
                dps.orders.findIndex(o => o.id === nextIncompleteOrder.id) + 1;
              const nextOrderSuffix = `order_${nextOrderIndex}`;
              const nextDriverReadyState = `driver_ready_${nextOrderSuffix}`;
              updatedStages = updatedStages.map((stage): StageDto => {
                if (
                  stage.state === nextDriverReadyState &&
                  stage.status === 'pending'
                ) {
                  return { ...stage, status: 'in_progress', timestamp };
                }
                return stage;
              });
              targetOrderId = nextIncompleteOrder.id;

              const newStatus = stageToStatusMap['driver_ready'];
              const newTrackingInfo = stageToTrackingMap['driver_ready'];
              await transactionalEntityManager.update(
                Order,
                { id: targetOrderId },
                {
                  status: newStatus,
                  tracking_info: newTrackingInfo,
                  updated_at: Math.floor(Date.now() / 1000)
                }
              );
            }
          }

          const inProgressStage = updatedStages.find(
            stage => stage.status === 'in_progress'
          );
          let newCurrentState: string;
          let newPreviousState: string | null = dps.current_state;
          let newNextState: string | null = null;

          if (inProgressStage) {
            newCurrentState = inProgressStage.state;
            const currentIndex = stageOrder.findIndex(base =>
              inProgressStage.state.startsWith(base)
            );
            newNextState =
              currentIndex < stageOrder.length - 1
                ? `${stageOrder[currentIndex + 1]}_${inProgressStage.state.split('_order_')[1]}`
                : null;
          } else {
            const lastCompletedDelivery = updatedStages
              .filter(
                stage =>
                  stage.state.startsWith('delivery_complete_') &&
                  stage.status === 'completed'
              )
              .sort((a, b) => b.timestamp - a.timestamp)[0];
            newCurrentState = lastCompletedDelivery
              ? lastCompletedDelivery.state
              : dps.current_state;
            newPreviousState = lastCompletedDelivery
              ? dps.current_state
              : newPreviousState;
            newNextState = lastCompletedDelivery ? null : newNextState;
          }

          const updateResult =
            await this.driverProgressStageService.updateStage(
              data.stageId,
              {
                current_state: newCurrentState,
                previous_state: newPreviousState,
                next_state: newNextState,
                stages: updatedStages
              },
              transactionalEntityManager
            );

          // Kiểm tra thay đổi thực sự để emit
          const newStagesString = JSON.stringify(updateResult.data.stages);
          const hasChanges =
            oldStagesString !== newStagesString ||
            oldCurrentState !== updateResult.data.current_state ||
            oldPreviousState !== updateResult.data.previous_state ||
            oldNextState !== updateResult.data.next_state;
          const allStagesCompleted = updateResult.data.stages.every(
            stage => stage.status === 'completed'
          );

          if (updateResult.EC === 0 && hasChanges) {
            await this.server
              .to(`driver_${dps.driver_id}`)
              .emit('driverStagesUpdated', updateResult.data);
            console.log('Emitted driverStagesUpdated:', updateResult.data);
          } else {
            console.log('Skipped emitting driverStagesUpdated:', {
              reason: !hasChanges ? 'No changes detected' : 'Update failed',
              oldStagesString,
              newStagesString,
              oldCurrentState,
              newCurrentState: updateResult.data.current_state,
              allStagesCompleted
            });
          }

          const updatedOrder = await this.ordersService.findOne(
            targetOrderId,
            transactionalEntityManager
          );
          if (updatedOrder?.data)
            await this.notifyPartiesOnce(updatedOrder.data);

          return { success: true, stage: updateResult.data };
        }
      );
      return result;
    } catch (error) {
      console.error('❌ Error in handleDriverProgressUpdate:', error);
      return { success: false, message: 'Internal server error' };
    }
  }

  public async notifyPartiesOnce(order: Order) {
    const notifyKey = `notify_${order.id}`;
    if (this.notificationLock.get(notifyKey)) return;

    try {
      this.notificationLock.set(notifyKey, true);
      const trackingUpdate = {
        orderId: order.id,
        status: order.status,
        tracking_info: order.tracking_info,
        updated_at: order.updated_at,
        customer_id: order.customer_id,
        driver_avatar: order?.driver?.avatar,
        restaurant_avatar: order?.restaurant?.avatar,
        driver_id: order.driver_id,
        restaurant_id: order.restaurant_id,
        driver_tips: order.driver_tips || 0 // Thêm driver_tips
      };
      this.eventEmitter.emit('listenUpdateOrderTracking', trackingUpdate);
      console.log(`Emitted notifyOrderStatus for order ${order.id}`);
    } finally {
      this.notificationLock.delete(notifyKey);
    }
  }

  @OnEvent('order.assignedToDriver')
  async handleOrderAssignedToDriver(orderAssignment: any) {
    try {
      const driverId = orderAssignment.driverListenerId;
      if (!driverId) throw new WsException('Driver ID is required');
      await this.server
        .to(`driver_${driverId}`)
        .emit('incomingOrderForDriver', {
          event: 'incomingOrderForDriver',
          data: orderAssignment,
          message: 'Order received successfully'
        });
      return { event: 'orderAssigned', data: { success: true } };
    } catch (error) {
      console.error('Error handling order.assignedToDriver:', error);
      throw new WsException(
        error instanceof WsException ? error.message : 'Internal server error'
      );
    }
  }
}
