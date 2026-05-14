import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Floor } from '../../floors/entities/floor.entity';

@Entity('buildings')
export class Building {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  photoUrl: string;

  @Column({ type: 'int' })
  floorsCount: number;

  @OneToMany(() => Floor, (floor) => floor.building, {
    cascade: true,
  })
  floors: Floor[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}