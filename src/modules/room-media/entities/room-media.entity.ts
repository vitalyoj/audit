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

  @Column({ type: 'varchar', length: 50 })
  mediaType: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  originalName: string;

  @Column({ type: 'varchar', length: 50, default: 'image/jpeg' })
  mimeType: string;

  @Column({ type: 'int', default: 0 })
  fileSize: number;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @ManyToOne(() => Room, (room) => room.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({ name: 'room_id' })
  roomId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}