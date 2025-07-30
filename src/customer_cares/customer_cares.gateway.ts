import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({ namespace: 'customer_cares' })
export class CustomerCaresGateway {
  @WebSocketServer()
  server: Server;

  constructor(private eventEmitter: EventEmitter2) {
    this.eventEmitter.on(
      'customerCareRequest',
      this.handleCustomerCareRequest.bind(this)
    );
  }

  @OnEvent('customerCareRequest')
  async handleCustomerCareRequest(data: {
    userId: string;
    type: 'SUPPORT' | 'ORDER';
    chatRoomId: string;
  }) {
    console.log('Received customer care request:', data);

    const customerCareId = 'FF_CC_320571da-59d0-483a-9c39-912d2a72b256';

    this.eventEmitter.emit('customerCareAssigned', {
      userId: data.userId,
      customerCareId,
      type: data.type,
      originalChatRoomId: data.chatRoomId
    });

    return { customerCareId, ...data };
  }
}
