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

export enum FeatureCategory {
  FURNITURE = 'furniture',
  EQUIPMENT = 'equipment',
}

@Entity('room_features')
export class RoomFeature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  category: string; // 'furniture' или 'equipment'

  @Column({ type: 'varchar', length: 100 })
  name: string; 

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'jsonb', nullable: true })
  properties: Record<string, any>;

  @ManyToOne(() => Room, (room) => room.features, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({ name: 'room_id' })
  roomId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}