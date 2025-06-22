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
import { TransactionService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  // return array
  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }
  // return object
  @Get('paginated')
  findAllPaginated(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    return this.transactionsService.findAllPaginated(parsedPage, parsedLimit);
  }

  @Get('finance/money-flow')
  getFlashfoodFinanceMoneyFlow(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string
  ) {
    const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
    return this.transactionsService.getFlashfoodFinanceMoneyFlow(
      startTimestamp,
      endTimestamp
    );
  }

  @Get(':id')
  findTransactionById(@Param('id') id: string) {
    return this.transactionsService.findTransactionById(id); // Use the findTransactionById method in FWalletService
  }

  @Get(':field/:value')
  findOne(@Param('field') field: string, @Param('value') value: string) {
    return this.transactionsService.findOne({ [field]: value });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto
  ) {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
