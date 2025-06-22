import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('admin_chart_records')
export class AdminChartRecord {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  period_type: string; // 'daily', 'weekly', 'monthly', 'yearly'

  @Column({ type: 'bigint' })
  period_start: number; // Start timestamp of the period

  @Column({ type: 'bigint' })
  period_end: number; // End timestamp of the period

  @Column({ type: 'integer', default: 0 })
  total_users: number; // Total number of users in the system

  @Column({ type: 'integer', default: 0 })
  sold_promotions: number; // Total number of promotions sold

  @Column('jsonb', { nullable: true })
  net_income: {
    date: string;
    total_amount: number;
  }[]; // Net income data by date (from orders)

  @Column('jsonb', { nullable: true })
  gross_income: {
    date: string;
    total_amount: number;
  }[]; // Gross income data by date (from orders)

  @Column('jsonb', { nullable: true })
  order_stats: {
    date: string;
    completed: number;
    cancelled: number;
  }[]; // Order stats by date

  @Column('jsonb', { nullable: true })
  user_growth_rate: {
    date: string;
    driver: number;
    restaurant: number;
    customer: number;
    customer_care: number;
  }[]; // User growth rate by type

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  gross_from_promotion: number; // Gross revenue from promotions

  @Column({ type: 'float', default: 0 })
  average_customer_satisfaction: number; // Average customer satisfaction rating

  @Column({ type: 'integer', default: 0 })
  average_delivery_time: number; // Average delivery time in seconds

  @Column({ type: 'float', default: 0 })
  order_cancellation_rate: number; // Order cancellation rate

  @Column({ type: 'integer', default: 0 })
  order_volume: number; // Total order volume

  @Column({ type: 'float', default: 0 })
  churn_rate: number; // Customer churn rate

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @BeforeInsert()
  generateId() {
    this.id = `FF_ADMIN_CHART_${uuidv4()}`;
  }
}
