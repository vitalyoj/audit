import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum LogAction {
  BUILDING_CREATE = 'building_create',
  BUILDING_EDIT = 'building_edit',
  BUILDING_DELETE = 'building_delete',
  USER_CREATE = 'user_create',
  USER_ROLE_EDIT = 'user_role_edit',
  USER_DELETE = 'user_delete',
  ROOM_CREATE = 'room_create',
  ROOM_EDIT = 'room_edit',
  ROOM_DELETE = 'room_delete',
  FLOOR_SCHEMA_EDIT = 'floor_schema_edit',
  CLICKABLE_AREA_CREATE = 'clickable_area_create',
  CLICKABLE_AREA_EDIT = 'clickable_area_edit',
  CLICKABLE_AREA_DELETE = 'clickable_area_delete',
  TICKET_ASSIGN = 'ticket_assign',
  TICKET_STATUS_EDIT = 'ticket_status_edit',
  TICKET_CLOSE = 'ticket_close',
}

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar' })
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}