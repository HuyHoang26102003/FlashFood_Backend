import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Admin } from 'src/admin/entities/admin.entity';

export enum TargetUser {
  DRIVER = 'DRIVER',
  RESTAURANT = 'RESTAURANT',
  CUSTOMER = 'CUSTOMER',
  CUSTOMER_CARE = 'CUSTOMER_CARE'
}

@Entity('notifications')
export class Notification {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'json' })
  avatar: { url: string; key: string };

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  desc: string;

  @Column({ type: 'varchar', nullable: true })
  image: string;

  @Column({ type: 'varchar', nullable: true })
  link: string;

  @Column({ type: 'enum', enum: TargetUser, array: true })
  target_user: TargetUser[];

  @Column({ type: 'varchar' })
  created_by_id: string;

  @ManyToOne(() => Admin, admin => admin.id, { nullable: false })
  @JoinColumn({ name: 'created_by_id' })
  created_by: Admin;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({ type: 'varchar', nullable: true })
  target_user_id: string; // ID của user cụ thể nếu thông báo nhắm đến một cá nhân

  @Column({ type: 'bigint' })
  created_at: number;

  @Column({ type: 'bigint', nullable: true })
  updated_at: number;

  @BeforeInsert()
  generateId() {
    this.id = `NOTI_${uuidv4()}`;
    this.created_at = Math.floor(Date.now() / 1000);
  }
}
