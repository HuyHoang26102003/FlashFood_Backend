import {
  IsString,
  IsArray,
  IsBoolean,
  IsOptional,
  IsObject,
  IsNumber
} from 'class-validator';
import { Order } from 'src/orders/entities/order.entity'; // Thêm import

export class CreateDriverDto {
  @IsString()
  user_id: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  license_number?: string;

  @IsOptional()
  @IsObject()
  license_image?: { url: string; key: string };

  @IsOptional()
  @IsString()
  identity_card_number?: string;

  @IsOptional()
  @IsObject()
  identity_card_image?: { url: string; key: string };

  @IsOptional()
  @IsArray()
  contact_email?: { title: string; is_default: boolean; email: string }[];

  @IsOptional()
  @IsArray()
  contact_phone?: { title: string; number: string; is_default: boolean }[];

  @IsOptional()
  @IsObject()
  vehicle?: { license_plate: string; model: string; color: string };

  @IsOptional()
  @IsObject()
  vehicle_info?: {
    type: string;
    license_plate: string;
    model: string;
    color: string;
  };

  @IsOptional()
  @IsObject()
  current_location?: { lat: number; lng: number };

  @IsOptional()
  @IsObject()
  location?: { lat: number; lng: number };

  @IsOptional()
  @IsArray()
  current_orders?: Order[];

  @IsOptional()
  @IsObject()
  status?: { is_active: boolean; is_available: boolean; is_verified: boolean };

  @IsOptional()
  @IsBoolean()
  available_for_work?: boolean;

  @IsOptional()
  @IsBoolean()
  is_on_delivery?: boolean;

  @IsOptional()
  @IsNumber()
  active_points?: number;

  @IsOptional()
  @IsObject()
  rating?: {
    average_rating: number;
    total_rating?: number;
    review_count?: number;
  };

  @IsOptional()
  @IsObject()
  avatar?: { key: string; url: string };

  @IsOptional()
  @IsNumber()
  created_at?: number;

  @IsOptional()
  @IsNumber()
  updated_at?: number;
}

export class createDriverSignup extends CreateDriverDto {
  @IsOptional()
  @IsString()
  first_name: string;

  @IsOptional()
  @IsString()
  last_name: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  phone: string;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  license_plate?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  owner?: string;
}
