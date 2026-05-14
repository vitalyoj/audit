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

@Entity('room_features')
export class RoomFeature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  featureName: string;

  @Column('text', { nullable: true })
  featureValue: string | null; // изменено на string | null

  @Column({ default: 1 })
  quantity: number;

  @Column('text', { nullable: true })
  technicalSpecs: string | null; // изменено на string | null

  @ManyToOne(() => Room, (room) => room.features, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({ name: 'room_id' })
  roomId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor() {
    this.quantity = 1;
    this.featureValue = null;
    this.technicalSpecs = null;
  }
}