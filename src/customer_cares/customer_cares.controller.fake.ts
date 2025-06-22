import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete
} from '@nestjs/common';
import { CustomerCareService } from './customer_cares.service';
import { CreateCustomerCareDto } from './dto/create-customer_cares.dto';
import { UpdateCustomerCareDto } from './dto/update-customer_cares.dto';

@Controller('customer-cares-fake')
export class CustomerCaresControllerFake {
  constructor(private readonly customerCaresService: CustomerCareService) {}

  @Post()
  create(@Body() createCustomerCareDto: CreateCustomerCareDto) {
    return this.customerCaresService.create(createCustomerCareDto);
  }

  @Get()
  findAll() {
    return this.customerCaresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerCaresService.findOne({ id });
  }

  @Patch('availability/:id')
  setAvailability(@Param('id') id: string) {
    return this.customerCaresService.setAvailability(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerCaresService.remove(id);
  }

  @Post('bulk')
  createBulk(@Body() createCustomerCaresDto: CreateCustomerCareDto[]) {
    return Promise.all(
      createCustomerCaresDto.map(dto => this.customerCaresService.create(dto))
    );
  }
}
