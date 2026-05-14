import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('last_checked')
export class LastChecked {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'yandex_forms' })
  source: string;

  @Column({ type: 'timestamp', nullable: true })
  lastCheckedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}