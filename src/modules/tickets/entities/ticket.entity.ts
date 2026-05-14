import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { User } from '../../users/entities/user.entity';

export enum TicketStatus {
  NEW = 'new',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  description: string;

  @Column()
  reporterEmail: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.NEW,
  })
  status: TicketStatus;

  @ManyToOne(() => Room, (room) => room.tickets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({ name: 'room_id' })
  roomId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User | null;

  @Column({ name: 'assigned_to_id', nullable: true })
  assignedToId: string | null;

  // Сохраняем оригинальный timestamp из Яндекс Формы
  @Column({ type: 'timestamp', nullable: true })
  yandexCreatedAt: Date;

  // ID ответа из Яндекс Формы (для избежания дубликатов)
  @Column({ nullable: true, unique: true })
  yandexAnswerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}