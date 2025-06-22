import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import { PromotionsService } from '../../promotions/promotions.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { CreatePromotionDto } from '../../promotions/dto/create-promotion.dto';
import { UpdatePromotionDto } from '../../promotions/dto/update-promotion.dto';
import { AdminRole } from 'src/utils/types/admin';

@Controller('finance-admin')
export class FinanceAdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly promotionsService: PromotionsService
  ) {}

  // Admin Management Endpoints
  @Post()
  createFinanceAdmin(@Body() createAdminDto: CreateAdminDto) {
    // Force the role to be FINANCE_ADMIN
    createAdminDto.role = AdminRole.FINANCE_ADMIN;
    return this.adminService.create(createAdminDto);
  }

  @Get()
  findAllFinanceAdmins() {
    // This should be modified in the service to filter only FINANCE_ADMIN roles
    return this.adminService.findAll();
  }

  @Get('promotions')
  findAllPromotions() {
    return this.promotionsService.findAll();
  }

  @Get('/:id')
  findOneFinanceAdmin(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Patch('/:id')
  updateFinanceAdmin(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto
  ) {
    // Ensure the role stays as FINANCE_ADMIN
    updateAdminDto.role = AdminRole.FINANCE_ADMIN;
    return this.adminService.update(id, updateAdminDto);
  }

  @Delete('/:id')
  removeFinanceAdmin(@Param('id') id: string) {
    return this.adminService.remove(id);
  }

  // Promotion Management Endpoints
  @Post('promotions')
  createPromotion(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }

  @Get('promotions/:id')
  findOnePromotion(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }

  @Patch('promotions/:id')
  updatePromotion(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto
  ) {
    return this.promotionsService.update(id, updatePromotionDto);
  }

  @Delete('promotions/:id')
  removePromotion(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}
