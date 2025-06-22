import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MenuItemVariant } from './entities/menu_item_variant.entity';
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redis.connect().catch(err => console.error('Redis connection error:', err));

@Injectable()
export class MenuItemVariantsRepository {
  constructor(
    @InjectRepository(MenuItemVariant)
    private menuItemVariantRepository: Repository<MenuItemVariant>
  ) {}

  async create(data: Partial<MenuItemVariant>): Promise<MenuItemVariant> {
    const variant = this.menuItemVariantRepository.create(data);
    return this.menuItemVariantRepository.save(variant);
  }

  async findById(id: string): Promise<MenuItemVariant> {
    const cacheKey = `variant:${id}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const variant = await this.menuItemVariantRepository.findOne({
      where: { id },
      select: ['id', 'price', 'description', 'menu_id']
    });
    if (variant) {
      await redis.setEx(cacheKey, 3600, JSON.stringify(variant));
    }
    return variant;
  }

  async findByIds(ids: string[]): Promise<MenuItemVariant[]> {
    if (!ids.length) return [];
    const cacheKey = `variants:${ids.join(',')}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const variants = await this.menuItemVariantRepository.find({
      where: { id: In(ids) },
      select: ['id', 'price', 'description', 'menu_id']
    });
    await redis.setEx(cacheKey, 3600, JSON.stringify(variants));
    return variants;
  }

  async findByDetails(
    price: number,
    description: string,
    menu_id: string
  ): Promise<MenuItemVariant> {
    return this.menuItemVariantRepository.findOne({
      where: { price, description, menu_id },
      select: ['id', 'price', 'description', 'menu_id']
    });
  }

  async findAll(conditions?: any): Promise<MenuItemVariant[]> {
    return this.menuItemVariantRepository.find({
      where: conditions,
      select: ['id', 'price', 'description', 'menu_id']
    });
  }

  async findAllPaginated(
    skip: number,
    limit: number
  ): Promise<[MenuItemVariant[], number]> {
    return this.menuItemVariantRepository.findAndCount({
      skip,
      take: limit,
      relations: ['menuItem']
    });
  }

  async update(
    id: string,
    data: Partial<MenuItemVariant>
  ): Promise<MenuItemVariant> {
    await this.menuItemVariantRepository.update(id, {
      ...data,
      updated_at: Math.floor(Date.now() / 1000)
    });
    await redis.del(`variant:${id}`);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.menuItemVariantRepository.delete(id);
    await redis.del(`variant:${id}`);
  }
}
