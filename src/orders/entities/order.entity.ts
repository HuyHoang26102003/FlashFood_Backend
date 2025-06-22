// order.entity.ts
import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  OneToMany,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  JoinTable
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { DriverProgressStage } from 'src/driver_progress_stages/entities/driver_progress_stage.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { AddressBook } from 'src/address_book/entities/address_book.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { RatingsReview } from 'src/ratings_reviews/entities/ratings_review.entity';
import { Promotion } from 'src/promotions/entities/promotion.entity';
import { MenuItem } from 'src/menu_items/entities/menu_item.entity';

export enum OrderTrackingInfo {
  ORDER_PLACED = 'ORDER_PLACED',
  ORDER_RECEIVED = 'ORDER_RECEIVED',
  PREPARING = 'PREPARING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESTAURANT_PICKUP = 'RESTAURANT_PICKUP',
  DISPATCHED = 'DISPATCHED',
  EN_ROUTE = 'EN_ROUTE',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERY_FAILED = 'DELIVERY_FAILED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  RESTAURANT_ACCEPTED = 'RESTAURANT_ACCEPTED',
  PREPARING = 'PREPARING',
  IN_PROGRESS = 'IN_PROGRESS',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  RESTAURANT_PICKUP = 'RESTAURANT_PICKUP',
  DISPATCHED = 'DISPATCHED',
  EN_ROUTE = 'EN_ROUTE',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
  DELIVERY_FAILED = 'DELIVERY_FAILED'
}

export enum OrderCancellationReason {
  CUSTOMER_CANCELLED = 'CUSTOMER_CANCELLED',
  RESTAURANT_CANCELLED = 'RESTAURANT_CANCELLED',
  DRIVER_CANCELLED = 'DRIVER_CANCELLED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  RESTAURANT_CLOSED = 'RESTAURANT_CLOSED',
  DRIVER_UNAVAILABLE = 'DRIVER_UNAVAILABLE',
  CUSTOMER_UNAVAILABLE = 'CUSTOMER_UNAVAILABLE',
  OTHER = 'OTHER'
}

export interface OrderItem {
  item_id: string;
  variant_id: string;
  name: string;
  quantity: number;
  price_at_time_of_order: number;
  item?: MenuItem;
}

@Entity('orders')
export class Order {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column()
  customer_id: string;

  @ManyToOne(() => Customer, customer => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column()
  restaurant_id: string;

  @ManyToOne(() => Restaurant, restaurant => restaurant.orders)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column({ nullable: true })
  driver_id: string;

  @Column('decimal', { precision: 10, scale: 4, nullable: true })
  distance: number;

  @Column({ nullable: true, type: 'decimal' })
  driver_wage: number;

  @ManyToOne(() => Driver, driver => driver.orders)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column('decimal')
  total_amount: number;

  @Column('decimal')
  delivery_fee: number;

  @Column('decimal')
  service_fee: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING'
  })
  payment_status: 'PENDING' | 'PAID' | 'FAILED';

  @Column({
    type: 'enum',
    enum: ['COD', 'FWallet'],
    default: 'FWallet'
  })
  payment_method: 'COD' | 'FWallet';

  @Column()
  customer_location: string;

  @ManyToOne(() => AddressBook, address => address.customer_orders)
  @JoinColumn({ name: 'customer_location' })
  customerAddress: AddressBook;

  @Column()
  restaurant_location: string;

  @ManyToOne(() => AddressBook, address => address.restaurant_orders)
  @JoinColumn({ name: 'restaurant_location' })
  restaurantAddress: AddressBook;

  @Column('jsonb')
  order_items: OrderItem[];

  menu_items?: MenuItem[];

  @Column({ nullable: true })
  customer_note: string;

  @Column({ nullable: true })
  restaurant_note: string;

  @Column({ type: 'bigint' })
  order_time: number;

  @Column({ type: 'bigint' })
  delivery_time: number;

  @Column({
    type: 'enum',
    enum: OrderTrackingInfo,
    default: OrderTrackingInfo.ORDER_PLACED
  })
  tracking_info: OrderTrackingInfo;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  driver_tips: number;

  @Column()
  created_at: number;

  @Column()
  updated_at: number;

  @OneToMany(
    () => DriverProgressStage,
    driverProgressStage => driverProgressStage.orders
  )
  driver_progress_stages: DriverProgressStage[];

  @ManyToMany(() => Driver, driver => driver.current_orders)
  drivers: Driver[];

  @OneToMany(() => RatingsReview, ratingReview => ratingReview.order)
  ratings_reviews: RatingsReview[];

  @ManyToMany(() => Promotion, promotion => promotion.restaurants, {
    nullable: true
  })
  @JoinTable({
    name: 'order_promotions',
    joinColumn: {
      name: 'order_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'promotion_id',
      referencedColumnName: 'id'
    }
  })
  promotions_applied: Promotion[];

  @Column({ nullable: true })
  cancelled_by: 'customer' | 'restaurant' | 'driver';

  @Column({ nullable: true })
  cancelled_by_id: string;

  @Column({
    type: 'enum',
    enum: OrderCancellationReason,
    nullable: true
  })
  cancellation_reason: OrderCancellationReason;

  @Column({ nullable: true })
  cancellation_title: string;

  @Column({ nullable: true })
  cancellation_description: string;

  @Column({ nullable: true })
  cancelled_at: number;

  @Column({
    default: 0
  })
  version: number;

  @BeforeInsert()
  generateId() {
    this.id = `FF_ORDER_${uuidv4()}`;
    this.created_at = Math.floor(Date.now() / 1000);
    this.updated_at = Math.floor(Date.now() / 1000);
  }
}
