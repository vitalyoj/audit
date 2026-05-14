import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Floor } from '../../floors/entities/floor.entity';
import { ClickableArea } from '../../clickable-areas/entities/clickable-area.entity';
import { RoomFeature } from '../../room-features/entities/room-feature.entity';
import { RoomMedia } from '../../room-media/entities/room-media.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

export enum RoomPurpose {
  ADMIN = 'Административный кабинет',
  COMPUTER_CLASS = 'Компьютерный класс',
  MULTIMEDIA = 'Мультимедийная аудитория',
  RESTROOM = 'Санузел',
  STORAGE = 'Склад',
  TECHNICAL = 'Техническое помещение',
  LABORATORY = 'Лаборатория',
  LECTURE = 'Лекционная аудитория',
  SEMINAR = 'Аудитория для семинаров',
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  number: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  area: number;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  purpose: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Floor, (floor) => floor.rooms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'floor_id' })
  floor: Floor;

  @Column({ name: 'floor_id' })
  floorId: string;

  @OneToOne(() => ClickableArea, (area) => area.room, { nullable: true })
  clickableArea: ClickableArea;

  @OneToMany(() => RoomFeature, (feature) => feature.room, {
    cascade: true,
  })
  features: RoomFeature[];

  @OneToMany(() => RoomMedia, (media) => media.room, {
    cascade: true,
  })
  media: RoomMedia[];

  @OneToMany(() => Ticket, (ticket) => ticket.room)
  tickets: Ticket[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}