import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FloorSchema } from '../../floor-schemas/entities/floor-schema.entity';
import { Room } from '../../rooms/entities/room.entity';

@Entity('clickable_areas')
export class ClickableArea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  coordinates: any;

  @ManyToOne(() => FloorSchema, (schema) => schema.clickableAreas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'schema_id' })
  schema: FloorSchema;

  @Column({ name: 'schema_id' })
  schemaId: string;

  @OneToOne(() => Room, (room) => room.clickableArea, {
    nullable: true,
  })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({ name: 'room_id', nullable: true })
  roomId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}