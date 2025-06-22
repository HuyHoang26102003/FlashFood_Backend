import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsBoolean,
  IsEmail,
  IsNumber,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class ContactEmail {
  @IsString()
  title: string;

  @IsBoolean()
  is_default: boolean;

  @IsEmail()
  email: string;
}

export class ContactPhone {
  @IsString()
  title: string;

  @IsString()
  number: string;

  @IsBoolean()
  is_default: boolean;
}

export class Status {
  @IsBoolean()
  is_open: boolean;

  @IsBoolean()
  is_active: boolean;

  @IsBoolean()
  is_accepted_orders: boolean;
}

class OpeningHours {
  @IsNumber()
  from: number;

  @IsNumber()
  to: number;
}

export class DailyHours {
  @ValidateNested()
  @Type(() => OpeningHours)
  mon: OpeningHours;

  @ValidateNested()
  @Type(() => OpeningHours)
  tue: OpeningHours;

  @ValidateNested()
  @Type(() => OpeningHours)
  wed: OpeningHours;

  @ValidateNested()
  @Type(() => OpeningHours)
  thu: OpeningHours;

  @ValidateNested()
  @Type(() => OpeningHours)
  fri: OpeningHours;

  @ValidateNested()
  @Type(() => OpeningHours)
  sat: OpeningHours;

  @ValidateNested()
  @Type(() => OpeningHours)
  sun: OpeningHours;
}

export class CreateRestaurantDto {
  @IsString()
  owner_id: string;

  @IsString()
  owner_name: string;

  @IsString()
  @IsOptional()
  address_id: string;

  @IsString()
  restaurant_name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactEmail)
  contact_email: ContactEmail[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactPhone)
  contact_phone: ContactPhone[];

  @IsOptional()
  @IsObject()
  avatar?: { url: string; key: string };

  @IsOptional()
  @IsArray()
  images_gallery?: { url: string; key: string }[];

  @IsObject()
  @ValidateNested()
  @Type(() => Status)
  status: Status;

  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Đảm bảo mỗi phần tử trong mảng là string
  promotions?: string[];

  @IsOptional()
  @IsObject()
  ratings?: {
    average_rating: number;
    review_count: number;
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Tương tự cho food_category_ids
  food_category_ids?: string[];

  @IsObject()
  @ValidateNested()
  @Type(() => DailyHours)
  opening_hours: DailyHours;
}

export class CreateRestaurantSignup extends CreateRestaurantDto {
  @IsOptional()
  @IsString()
  owner_id: string;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
