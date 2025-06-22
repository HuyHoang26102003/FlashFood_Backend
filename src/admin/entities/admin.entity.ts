import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { AdminRole, AdminPermission, AdminStatus } from 'src/utils/types/admin';
import { User } from 'src/users/entities/user.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { CustomerCare } from 'src/customer_cares/entities/customer_care.entity';
import { Penalty } from 'src/penalties/entities/penalty.entity'; // Giả sử đường dẫn tới Penalty entity

@Entity('admins')
export class Admin {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: AdminRole
  })
  role: AdminRole;

  @Column('jsonb', { nullable: true })
  avatar: { url: string; key: string };

  @Column('text', { array: true })
  permissions: AdminPermission[];

  @ManyToMany(() => Restaurant, restaurant => restaurant.admins)
  @JoinTable()
  assigned_restaurants: Restaurant[];

  @ManyToMany(() => Driver, driver => driver.admins)
  @JoinTable()
  assigned_drivers: Driver[];

  @ManyToMany(() => CustomerCare, customerCare => customerCare.admins)
  @JoinTable()
  assigned_customer_care: CustomerCare[];

  @OneToMany(() => Penalty, penalty => penalty.penaltied_by) // Quan hệ ngược với Penalty
  penalties_issued: Penalty[];

  @Column({ type: 'bigint', nullable: true })
  last_active: number;

  @CreateDateColumn()
  created_at: number;

  @UpdateDateColumn()
  updated_at: number;

  @Column({ type: 'varchar', nullable: true })
  created_by_id: string;

  @ManyToOne(() => Admin, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  created_by: Admin;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({
    type: 'enum',
    enum: AdminStatus,
    default: AdminStatus.ACTIVE
  })
  status: AdminStatus;
}
