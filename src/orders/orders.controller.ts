import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiResponse } from '../types/api-response.type';
import { OrderCancellationReason } from './entities/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Create a new order
  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<any> {
    return await this.ordersService.createOrder(createOrderDto);
  }

  @Post('tip')
  async tipDriver(@Body() body: { orderId: string; tipAmount: number }) {
    return this.ordersService.tipToDriver(body.orderId, body.tipAmount);
  }

  // Get all orders
  @Get()
  async findAll(): Promise<Promise<any>> {
    const orders = await this.ordersService.findAll();
    return {
      status: 'OK',
      data: orders,
      message: 'Orders retrieved successfully'
    };
  }

  @Get('paginated')
  findAllPaginated(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    return this.ordersService.findAllPaginated(parsedPage, parsedLimit);
  }

  // Get a specific order by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    const order = await this.ordersService.findOne(id);
    return {
      status: 'OK',
      data: order,
      message: 'Order retrieved successfully'
    };
  }

  // Update an order by ID
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto
  ): Promise<any> {
    const order = await this.ordersService.update(id, updateOrderDto);
    return {
      status: 'OK',
      data: order,
      message: 'Order updated successfully'
    };
  }

  // Delete an order by ID
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<void>> {
    await this.ordersService.remove(id);
    return {
      status: 'OK',
      data: null,
      message: 'Order deleted successfully'
    };
  }

  @Post(':id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @Body()
    cancelOrderDto: {
      cancelled_by: 'customer' | 'restaurant' | 'driver';
      cancelled_by_id: string;
      reason: OrderCancellationReason;
      title: string;
      description: string;
    }
  ): Promise<any> {
    return this.ordersService.cancelOrder(
      id,
      cancelOrderDto.cancelled_by,
      cancelOrderDto.cancelled_by_id,
      cancelOrderDto.reason,
      cancelOrderDto.title,
      cancelOrderDto.description
    );
  }
}
