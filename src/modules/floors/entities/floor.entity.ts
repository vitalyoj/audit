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
import { Building } from '../../buildings/entities/building.entity';
import { FloorSchema } from '../../floor-schemas/entities/floor-schema.entity';
import { Room } from '../../rooms/entities/room.entity';

@Entity('floors')
export class Floor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  floorNumber: number;

  @Column({ type: 'varchar', default: 'Этаж' })
  name: string;

  @ManyToOne(() => Building, (building) => building.floors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'building_id' })
  building: Building;

  @Column({ name: 'building_id' })
  buildingId: string;

  @OneToOne(() => FloorSchema, (schema) => schema.floor, {
    cascade: true,
    nullable: true,
  })
  schema: FloorSchema;

  @OneToMany(() => Room, (room) => room.floor)
  rooms: Room[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}