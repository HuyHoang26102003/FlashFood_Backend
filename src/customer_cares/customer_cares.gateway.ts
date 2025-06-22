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
  handleCustomerCareRequest(data: {
    userId: string;
    type: 'SUPPORT' | 'ORDER';
    chatRoomId: string;
  }) {
    console.log('Received customer care request:', data);
    return data;
    // Logic to handle customer care request, including chatRoomId
  }
}
