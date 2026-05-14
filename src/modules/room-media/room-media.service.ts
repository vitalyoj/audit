import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomMedia, MediaType } from './entities/room-media.entity';
import { CreateRoomMediaDto } from './dto/create-room-media.dto';
import { UpdateRoomMediaDto } from './dto/update-room-media.dto';
import * as fs from 'fs/promises';
import { join } from 'path';

@Injectable()
export class RoomMediaService {
  constructor(
    @InjectRepository(RoomMedia)
    private mediaRepository: Repository<RoomMedia>,
  ) {}

  async create(createDto: CreateRoomMediaDto): Promise<RoomMedia> {
    const maxOrder = await this.getMaxSortOrder(createDto.roomId);
    const media = this.mediaRepository.create({
      ...createDto,
      sortOrder: maxOrder + 1,
    });
    return this.mediaRepository.save(media);
  }

  async findByRoom(roomId: string): Promise<RoomMedia[]> {
    return this.mediaRepository.find({
      where: { roomId },
      order: { sortOrder: 'ASC' },
    });
  }

  async findPanoramaByRoom(roomId: string): Promise<RoomMedia | null> {
    return this.mediaRepository.findOne({
      where: { roomId, mediaType: MediaType.PANORAMA },
    });
  }

  async findPhotosByRoom(roomId: string): Promise<RoomMedia[]> {
    return this.mediaRepository.find({
      where: { roomId, mediaType: MediaType.PHOTO },
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<RoomMedia> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Медиафайл с ID ${id} не найден`);
    }
    return media;
  }

  async update(id: string, updateDto: UpdateRoomMediaDto): Promise<RoomMedia> {
    const media = await this.findOne(id);
    Object.assign(media, updateDto);
    return this.mediaRepository.save(media);
  }

  async remove(id: string): Promise<void> {
    const media = await this.findOne(id);
    
    // Удаляем физический файл
    const filePath = join(process.cwd(), media.url);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Ошибка при удалении файла:', error);
    }
    
    // Удаляем миниатюру если есть
    if (media.thumbnailUrl) {
      const thumbPath = join(process.cwd(), media.thumbnailUrl);
      try {
        await fs.unlink(thumbPath);
      } catch (error) {
        console.error('Ошибка при удалении миниатюры:', error);
      }
    }
    
    await this.mediaRepository.remove(media);
  }

  async removeByRoom(roomId: string): Promise<void> {
    const mediaList = await this.findByRoom(roomId);
    for (const media of mediaList) {
      await this.remove(media.id);
    }
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<RoomMedia> {
    const media = await this.findOne(id);
    media.sortOrder = sortOrder;
    return this.mediaRepository.save(media);
  }

  private async getMaxSortOrder(roomId: string): Promise<number> {
    const result = await this.mediaRepository
      .createQueryBuilder('media')
      .where('media.roomId = :roomId', { roomId })
      .select('MAX(media.sortOrder)', 'max')
      .getRawOne();
    return result?.max || 0;
  }
}