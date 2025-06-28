import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  WsException
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger } from '@nestjs/common';
import { LocationService } from './location.service';

const logger = new Logger('LocationGateway');

@Injectable()
@WebSocketGateway({
  namespace: 'location',
  cors: {
    origin: ['*', process.env.FULL_BACKEND_URL],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket'],
  pingTimeout: 180000,
  pingInterval: 30000
})
export class LocationGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  private server: Server;

  // Maps to track connected drivers and customers
  private driverSockets = new Map<string, Socket>();
  private customerSockets = new Map<string, Socket>();
  private activeDrivers = new Map<string, { lat: number; lng: number }>(); // Track driver locations

  constructor(
    private readonly jwtService: JwtService,
    private readonly locationService: LocationService
  ) {}

  afterInit() {
    logger.log('Location Gateway initialized');
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
      logger.error('Token validation error:', error.message);
      throw new WsException('Token validation failed');
    }
  }

  async handleConnection(client: Socket) {
    try {
      logger.log(`Client connected to location namespace: ${client.id}`);

      const userData = await this.validateToken(client);
      if (!userData) {
        logger.log(`Invalid token, disconnecting: ${client.id}`);
        client.disconnect(true);
        return;
      }

      // Store user data on socket
      client.data.user = userData;

      // Determine user type and store in appropriate map
      if (userData.logged_in_as === 'DRIVER') {
        this.driverSockets.set(userData.id, client);
        await client.join(`driver_${userData.id}`);
        logger.log(`Driver ${userData.id} connected to location tracking`);

        client.emit('driverConnected', {
          status: 'connected',
          driverId: userData.id,
          message: 'Driver successfully connected to location tracking'
        });
      } else if (userData.logged_in_as === 'CUSTOMER') {
        this.customerSockets.set(userData.id, client);
        await client.join(`customer_${userData.id}`);
        logger.log(`Customer ${userData.id} connected to location tracking`);

        client.emit('customerConnected', {
          status: 'connected',
          customerId: userData.id,
          message: 'Customer successfully connected to location tracking'
        });
      } else {
        logger.warn(`Unknown user type: ${userData.logged_in_as}`);
        client.disconnect(true);
        return;
      }

      return true;
    } catch (error: any) {
      logger.error('Connection error:', error.message);
      client.emit('connection_error', { reason: error.message });
      client.disconnect(true);
      return false;
    }
  }

  handleDisconnect(client: Socket) {
    const userData = client.data.user;
    if (userData) {
      if (userData.logged_in_as === 'DRIVER') {
        this.driverSockets.delete(userData.id);
        this.activeDrivers.delete(userData.id);
        logger.log(`Driver ${userData.id} disconnected from location tracking`);
      } else if (userData.logged_in_as === 'CUSTOMER') {
        this.customerSockets.delete(userData.id);
        logger.log(
          `Customer ${userData.id} disconnected from location tracking`
        );
      }
    }
    logger.log(`Client disconnected from location namespace: ${client.id}`);
  }

  @SubscribeMessage('updateDriverLocation')
  async handleUpdateDriverLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      driver_location: { lng: number; lat: number };
      destination: { lng: number; lat: number };
      customerId: string; // Required - the specific customer to notify
    }
  ) {
    try {
      const userData = client.data.user;
      if (!userData) {
        throw new WsException('Unauthorized');
      }

      // Verify user is a driver
      if (userData.logged_in_as !== 'DRIVER') {
        throw new WsException('Only drivers can update location');
      }

      const driverId = userData.id;

      // Validate location data
      if (
        !data.driver_location ||
        typeof data.driver_location.lat !== 'number' ||
        typeof data.driver_location.lng !== 'number' ||
        !data.destination ||
        typeof data.destination.lat !== 'number' ||
        typeof data.destination.lng !== 'number'
      ) {
        throw new WsException('Invalid location data provided');
      }

      // Validate customerId is provided
      if (!data.customerId) {
        throw new WsException('Customer ID is required');
      }

      logger.log(
        `Driver ${driverId} updating location for customer ${data.customerId}`,
        {
          driver_location: data.driver_location,
          destination: data.destination
        }
      );

      // Store driver's current location
      this.activeDrivers.set(driverId, {
        lat: data.driver_location.lat,
        lng: data.driver_location.lng
      });

      // Calculate ETA using the location service
      const eta = this.locationService.calculateDriverETA(
        data.driver_location,
        data.destination
      );

      // Prepare the location update payload
      const locationPayload = {
        driverId: driverId,
        lat: data.driver_location.lat,
        lng: data.driver_location.lng,
        eta: Math.round(eta), // ETA tính bằng phút
        timestamp: new Date().toISOString()
      };

      logger.log(
        `Driver ${driverId} location update with ETA: ${Math.round(eta)} minutes`
      );

      // Emit to the specific customer
      const customerSocket = this.customerSockets.get(data.customerId);
      if (customerSocket) {
        customerSocket.emit('driverCurrentLocation', locationPayload);
        logger.log(`Emitted location update to customer ${data.customerId}`);

        // Emit acknowledgment back to driver
        client.emit('locationUpdateAck', {
          success: true,
          driverId: driverId,
          customerId: data.customerId,
          eta: Math.round(eta),
          timestamp: locationPayload.timestamp,
          message: 'Location updated successfully'
        });

        return {
          success: true,
          driverId: driverId,
          customerId: data.customerId,
          eta: Math.round(eta),
          customerNotified: true
        };
      } else {
        logger.warn(
          `Customer ${data.customerId} not connected to location tracking`
        );

        // Emit acknowledgment back to driver with warning
        client.emit('locationUpdateAck', {
          success: false,
          driverId: driverId,
          customerId: data.customerId,
          eta: Math.round(eta),
          timestamp: locationPayload.timestamp,
          message: 'Customer not connected to location tracking'
        });

        return {
          success: false,
          driverId: driverId,
          customerId: data.customerId,
          eta: Math.round(eta),
          customerNotified: false,
          error: 'Customer not connected'
        };
      }
    } catch (error: any) {
      logger.error('Error updating driver location:', error.message);
      client.emit('locationUpdateError', {
        success: false,
        error: error.message || 'Failed to update location'
      });
      throw new WsException(
        error.message || 'Failed to update driver location'
      );
    }
  }

  @SubscribeMessage('getActiveDrivers')
  async handleGetActiveDrivers(@ConnectedSocket() client: Socket) {
    try {
      const userData = client.data.user;
      if (!userData) {
        throw new WsException('Unauthorized');
      }

      // Only customers can request active drivers
      if (userData.logged_in_as !== 'CUSTOMER') {
        throw new WsException('Only customers can request active drivers');
      }

      const activeDriversList = Array.from(this.activeDrivers.entries()).map(
        ([driverId, location]) => ({
          driverId,
          lat: location.lat,
          lng: location.lng,
          isOnline: this.driverSockets.has(driverId)
        })
      );

      client.emit('activeDriversList', {
        drivers: activeDriversList,
        count: activeDriversList.length,
        timestamp: new Date().toISOString()
      });

      logger.log(
        `Sent active drivers list to customer ${userData.id}: ${activeDriversList.length} drivers`
      );

      return {
        success: true,
        driversCount: activeDriversList.length
      };
    } catch (error: any) {
      logger.error('Error getting active drivers:', error.message);
      throw new WsException(error.message || 'Failed to get active drivers');
    }
  }
}
