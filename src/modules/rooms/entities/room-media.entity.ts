import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';

export enum MediaType {
  PHOTO = 'photo',
  PANORAMA = 'panorama',
}

@Entity('room_media')
export class RoomMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: MediaType })
  mediaType: MediaType;

  @Column({ length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  originalName: string | null; // изменено на string | null

  @Column({ length: 50, default: 'image/jpeg' })
  mimeType: string;

  @Column({ default: 0 })
  fileSize: number;

  @Column({ default: 0 })
  sortOrder: number;

  @ManyToOne(() => Room, (room) => room.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({ name: 'room_id' })
  roomId: string;

  @CreateDateColumn()
  createdAt: Date;

  constructor() {
    this.thumbnailUrl = null;
    this.originalName = null;
    this.mimeType = 'image/jpeg';
    this.fileSize = 0;
    this.sortOrder = 0;
  }
}