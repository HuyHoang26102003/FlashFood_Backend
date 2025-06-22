// restaurants/entities/restaurant.entity.ts
import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/users/entities/user.entity';
import { AddressBook } from 'src/address_book/entities/address_book.entity';
import { FoodCategory } from 'src/food_categories/entities/food_category.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { MenuItem } from 'src/menu_items/entities/menu_item.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column()
  owner_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column()
  owner_name: string;

  @Column({ nullable: true })
  address_id: string;

  @ManyToOne(() => AddressBook)
  @JoinColumn({ name: 'address_id' })
  address: AddressBook;

  @Column()
  restaurant_name: string;

  @Column({ nullable: true })
  description: string;

  @Column('jsonb')
  contact_email: { title: string; is_default: boolean; email: string }[];

  @Column('jsonb')
  contact_phone: { title: string; number: string; is_default: boolean }[];

  @Column('jsonb', { nullable: true })
  avatar: { url: string; key: string };

  @Column('jsonb', { nullable: true })
  images_gallery: { url: string; key: string }[];

  @Column('jsonb')
  status: {
    is_open: boolean;
    is_active: boolean;
    is_accepted_orders: boolean;
  };

  @ManyToMany(() => Promotion, promotion => promotion.restaurants, {
    eager: false // Don't load promotions automatically
  })
  @JoinTable({
    name: 'restaurant_promotions',
    joinColumn: { name: 'restaurant_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'promotion_id', referencedColumnName: 'id' }
  })
  promotions: Promotion[];

  @Column('jsonb', { nullable: true })
  ratings: {
    average_rating: number;
    review_count: number;
  };

  @ManyToMany(() => FoodCategory)
  @JoinTable({
    name: 'restaurant_specializations',
    joinColumn: { name: 'restaurant_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'food_category_id', referencedColumnName: 'id' }
  })
  specialize_in: FoodCategory[];

  @Column('jsonb')
  opening_hours: {
    mon: { from: number; to: number };
    tue: { from: number; to: number };
    wed: { from: number; to: number };
    thu: { from: number; to: number };
    fri: { from: number; to: number };
    sat: { from: number; to: number };
    sun: { from: number; to: number };
  };

  @Column({ name: 'created_at' })
  created_at: number;

  @Column({ name: 'updated_at' })
  updated_at: number;

  @Column({ type: 'int', default: 0 })
  total_orders: number;

  @ManyToMany(() => Admin, admin => admin.assigned_restaurants)
  admins: Admin[];

  @OneToMany(() => Order, order => order.restaurant)
  orders: Order[];

  @OneToMany(() => MenuItem, menuItem => menuItem.restaurant)
  menuItems: MenuItem[];

  @BeforeInsert()
  generateId() {
    this.id = `FF_RES_${uuidv4()}`;
    this.created_at = Math.floor(Date.now() / 1000);
    this.updated_at = Math.floor(Date.now() / 1000);
    this.total_orders = 0;

    // If no address_id provided, create a default one or leave it null
    if (!this.address_id) {
      this.address_id = null; // Will be set later when address is created
    }
  }
}
