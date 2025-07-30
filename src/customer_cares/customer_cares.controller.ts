import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Patch,
  Delete,
  Query
} from '@nestjs/common';
import { CustomerCareService } from './customer_cares.service';
import { CreateCustomerCareDto } from './dto/create-customer_cares.dto';
import { UpdateCustomerCareDto } from './dto/update-customer_cares.dto';

@Controller('customer-cares')
export class CustomerCaresController {
  constructor(private readonly customerCareService: CustomerCareService) {}

  @Post('reset-inquiries-cache')
  resetInquiriesCache() {
    return this.customerCareService.resetInquiriesCache();
  }

  @Post()
  create(@Body() createCustomerCareDto: CreateCustomerCareDto) {
    return this.customerCareService.create(createCustomerCareDto);
  }

  @Get()
  findAll() {
    return this.customerCareService.findAll();
  }

  @Get('paginated')
  findAllPaginated(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    return this.customerCareService.findAllPaginated(parsedPage, parsedLimit);
  }

  @Get('inquiries/:ccId')
  findAllInquiriesByCCId(@Param('ccId') ccId: string) {
    return this.customerCareService.findAllInquiriesByCCId(ccId);
  }
  @Get(':id')
  findCustomerCareById(@Param('id') id: string) {
    return this.customerCareService.findCustomerCareById(id);
  }

  @Get(':field/:value')
  findOne(@Param('field') field: string, @Param('value') value: string) {
    return this.customerCareService.findOne({ [field]: value });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerCareDto: UpdateCustomerCareDto
  ) {
    return this.customerCareService.update(id, updateCustomerCareDto);
  }

  @Patch(':id/availability')
  setAvailability(@Param('id') id: string) {
    return this.customerCareService.setAvailability(id); // Call service with the id
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerCareService.remove(id);
  }
}
