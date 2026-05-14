import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Floor } from '../../floors/entities/floor.entity';
import { ClickableArea } from '../../clickable-areas/entities/clickable-area.entity';

@Entity('floor_schemas')
export class FloorSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'int', default: 1024 })
  width: number;

  @Column({ type: 'int', default: 768 })
  height: number;

  @OneToOne(() => Floor, (floor) => floor.schema)
  @JoinColumn({ name: 'floor_id' })
  floor: Floor;

  @Column({ name: 'floor_id' })
  floorId: string;

  @OneToMany(() => ClickableArea, (area) => area.schema, {
    cascade: true,
  })
  clickableAreas: ClickableArea[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}