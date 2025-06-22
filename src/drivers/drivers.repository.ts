import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { Order } from 'src/orders/entities/order.entity';

@Injectable()
export class DriversRepository {
  constructor(
    @InjectRepository(Driver)
    private driverEntityRepository: Repository<Driver>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>
  ) {}

  async findById(
    id: string,
    options?: { relations?: string[] }
  ): Promise<Driver> {
    const queryBuilder = this.driverEntityRepository
      .createQueryBuilder('driver')
      .leftJoin(
        'banned_accounts',
        'ban',
        'ban.entity_id = driver.id AND ban.entity_type = :entityType',
        {
          entityType: 'Driver'
        }
      )
      .addSelect(
        'CASE WHEN ban.id IS NOT NULL THEN true ELSE false END',
        'driver_is_banned'
      )
      .where('driver.id = :id', { id });

    // Add any requested relations
    if (options?.relations) {
      options.relations.forEach(relation => {
        queryBuilder.leftJoinAndSelect(`driver.${relation}`, relation);
      });
    } else {
      // Default relation if none specified
      queryBuilder.leftJoinAndSelect('driver.user', 'user');
    }

    const result = await queryBuilder.getRawAndEntities();
    const driver = result.entities[0];
    if (driver) {
      (driver as any).driver_is_banned =
        result.raw[0]?.driver_is_banned || false;
    }
    return driver || null;
  }

  async findOne(conditions: object): Promise<Driver> {
    return await this.driverEntityRepository.findOne({ where: conditions });
  }

  async findOneOrFail(conditions: { where: object }): Promise<Driver> {
    console.log('findOneOrFail conditions:', conditions);
    return await this.driverEntityRepository.findOneOrFail({
      where: conditions.where
    }); // Sửa để lấy where từ conditions
  }

  async findAll(): Promise<Driver[]> {
    const result = await this.driverEntityRepository
      .createQueryBuilder('driver')
      .leftJoin(
        'banned_accounts',
        'ban',
        'ban.entity_id = driver.id AND ban.entity_type = :entityType',
        {
          entityType: 'Driver'
        }
      )
      .addSelect(
        'CASE WHEN ban.id IS NOT NULL THEN true ELSE false END',
        'driver_is_banned'
      )
      .getRawAndEntities();

    // Map the raw results to the entities
    return result.entities.map((driver, index) => {
      (driver as any).driver_is_banned =
        result.raw[index]?.driver_is_banned || false;
      return driver;
    });
  }

  async create(createDriverDto: any): Promise<any> {
    const driver = this.driverEntityRepository.create(createDriverDto);
    return await this.driverEntityRepository.save(driver);
  }

  async update(id: string, updateDriverDto: any): Promise<Driver> {
    await this.driverEntityRepository.update(id, updateDriverDto);
    return await this.findById(id);
  }

  async save(driver: Driver): Promise<Driver> {
    return await this.driverEntityRepository.save(driver);
  }

  async remove(id: string): Promise<Driver> {
    const driver = await this.findById(id);
    if (driver) {
      await this.driverEntityRepository.delete(id);
    }
    return driver;
  }

  async findByUserId(userId: string): Promise<Driver> {
    return await this.driverEntityRepository.findOne({
      where: { user_id: userId }
    });
  }
  async updateVehicleImages(
    id: string,
    vehicleImages: Array<{ key: string; url: string }>
  ): Promise<Driver> {
    // Lấy driver hiện tại
    const driver = await this.findById(id);
    if (!driver) {
      throw new Error('Driver not found');
    }

    // Khởi tạo vehicle nếu chưa có
    if (!driver.vehicle) {
      driver.vehicle = {
        license_plate: '',
        model: '',
        color: '',
        images: [],
        brand: '',
        year: 2000,
        owner: ''
      };
    }

    // Gộp images hiện tại với images mới
    const updatedVehicleImages = [
      ...(driver.vehicle.images || []),
      ...vehicleImages
    ];

    // Cập nhật vehicle với images mới
    await this.driverEntityRepository.update(id, {
      vehicle: {
        ...driver.vehicle,
        images: updatedVehicleImages
      },
      updated_at: Math.floor(Date.now() / 1000)
    });

    // Trả về driver đã cập nhật
    return await this.findById(id);
  }

  async findAllPaginated(
    skip: number,
    limit: number
  ): Promise<[Driver[], number]> {
    return await this.driverEntityRepository.findAndCount({
      skip,
      take: limit,
      relations: ['user']
    });
  }
}
