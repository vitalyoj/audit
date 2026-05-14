import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomPurpose } from './entities/room.entity';
import { RoomFeature } from '../room-features/entities/room-feature.entity';
import { RoomMedia, MediaType } from '../room-media/entities/room-media.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { FilterRoomDto } from './dto/filter-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(RoomFeature)
    private featureRepository: Repository<RoomFeature>,
    @InjectRepository(RoomMedia)
    private mediaRepository: Repository<RoomMedia>,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const existingRoom = await this.roomRepository.findOne({
      where: { number: createRoomDto.number },
    });

    if (existingRoom) {
      throw new BadRequestException(`Аудитория с номером ${createRoomDto.number} уже существует`);
    }

    const room = new Room();
    room.number = createRoomDto.number;
    room.floorId = createRoomDto.floorId;
    
    // Присваиваем только если значения определены
    if (createRoomDto.purpose !== undefined) {
      room.purpose = createRoomDto.purpose;
    }
    if (createRoomDto.area !== undefined) {
      room.area = createRoomDto.area;
    }
    if (createRoomDto.capacity !== undefined) {
      room.capacity = createRoomDto.capacity;
    }
    if (createRoomDto.description !== undefined) {
      room.description = createRoomDto.description;
    }

    const savedRoom = await this.roomRepository.save(room);

    // Добавляем оснащение
    if (createRoomDto.features && createRoomDto.features.length > 0) {
      const features = createRoomDto.features.map(feature => {
        const newFeature = new RoomFeature();
        newFeature.featureName = feature.featureName;
        newFeature.featureValue = feature.featureValue || '';
        newFeature.quantity = feature.quantity || 1;
        newFeature.technicalSpecs = feature.technicalSpecs || '';
        newFeature.roomId = savedRoom.id;
        return newFeature;
      });
      await this.featureRepository.save(features);
    }

    // Добавляем медиа
    if (createRoomDto.media && createRoomDto.media.length > 0) {
      const mediaList = createRoomDto.media.map(item => {
        const newMedia = new RoomMedia();
        newMedia.mediaType = item.mediaType as MediaType;
        newMedia.url = item.url;
        newMedia.thumbnailUrl = item.thumbnailUrl || '';
        newMedia.sortOrder = item.sortOrder || 0;
        newMedia.roomId = savedRoom.id;
        return newMedia;
      });
      await this.mediaRepository.save(mediaList);
    }

    return this.findOne(savedRoom.id);
  }

  async findAll(filter: FilterRoomDto): Promise<{ items: Room[]; total: number }> {
    const { search, floorId, purposes, capacityFrom, capacityTo, features, page, limit } = filter;

    const queryBuilder = this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.features', 'features')
      .leftJoinAndSelect('room.media', 'media')
      .leftJoinAndSelect('room.floor', 'floor')
      .where('1 = 1');

    if (search) {
      queryBuilder.andWhere('room.number ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (floorId) {
      queryBuilder.andWhere('room.floorId = :floorId', { floorId });
    }

    if (purposes && purposes.length > 0) {
      queryBuilder.andWhere('room.purpose IN (:...purposes)', { purposes });
    }

    if (capacityFrom && capacityTo) {
      queryBuilder.andWhere('room.capacity BETWEEN :from AND :to', {
        from: capacityFrom,
        to: capacityTo,
      });
    } else if (capacityFrom) {
      queryBuilder.andWhere('room.capacity >= :from', { from: capacityFrom });
    } else if (capacityTo) {
      queryBuilder.andWhere('room.capacity <= :to', { to: capacityTo });
    }

    if (features && features.length > 0) {
      for (const feature of features) {
        const [featureName, quantityStr] = feature.split(':');
        const quantity = quantityStr ? parseInt(quantityStr, 10) : 1;

        const subQuery = queryBuilder
          .subQuery()
          .select('1')
          .from(RoomFeature, 'f')
          .where('f.room_id = room.id')
          .andWhere('f.featureName = :featureName')
          .andWhere('f.quantity >= :quantity')
          .getQuery();

        queryBuilder.andWhere(`EXISTS ${subQuery}`, { featureName, quantity });
      }
    }

    const safePage = page || 1;
    const safeLimit = limit || 10;

    const [items, total] = await queryBuilder
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)
      .getManyAndCount();

    return { items, total };
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['features', 'media', 'floor'],
    });

    if (!room) {
      throw new NotFoundException(`Аудитория с ID ${id} не найдена`);
    }

    return room;
  }

  async findByNumber(number: string): Promise<Room | null> {
    return this.roomRepository.findOne({
      where: { number },
      relations: ['features', 'media', 'floor'],
    });
  }

  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);

    if (updateRoomDto.number && updateRoomDto.number !== room.number) {
      const existingRoom = await this.roomRepository.findOne({
        where: { number: updateRoomDto.number },
      });

      if (existingRoom) {
        throw new BadRequestException(
          `Аудитория с номером ${updateRoomDto.number} уже существует`,
        );
      }
    }

    // Обновляем только переданные поля
    if (updateRoomDto.number !== undefined) room.number = updateRoomDto.number;
    if (updateRoomDto.floorId !== undefined) room.floorId = updateRoomDto.floorId;
    if (updateRoomDto.purpose !== undefined) room.purpose = updateRoomDto.purpose;
    if (updateRoomDto.area !== undefined) room.area = updateRoomDto.area;
    if (updateRoomDto.capacity !== undefined) room.capacity = updateRoomDto.capacity;
    if (updateRoomDto.description !== undefined) room.description = updateRoomDto.description;

    await this.roomRepository.save(room);

    // Обновляем оснащение
    if (updateRoomDto.features) {
      await this.featureRepository.delete({ roomId: id });
      
      const features = updateRoomDto.features.map(feature => {
        const newFeature = new RoomFeature();
        newFeature.featureName = feature.featureName;
        newFeature.featureValue = feature.featureValue || '';
        newFeature.quantity = feature.quantity || 1;
        newFeature.technicalSpecs = feature.technicalSpecs || '';
        newFeature.roomId = id;
        return newFeature;
      });
      
      if (features.length > 0) {
        await this.featureRepository.save(features);
      }
    }

    // Обновляем медиа
    if (updateRoomDto.media) {
      await this.mediaRepository.delete({ roomId: id });
      
      const mediaList = updateRoomDto.media.map(item => {
        const newMedia = new RoomMedia();
        newMedia.mediaType = item.mediaType as MediaType;
        newMedia.url = item.url;
        newMedia.thumbnailUrl = item.thumbnailUrl || '';
        newMedia.sortOrder = item.sortOrder || 0;
        newMedia.roomId = id;
        return newMedia;
      });
      
      if (mediaList.length > 0) {
        await this.mediaRepository.save(mediaList);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const room = await this.findOne(id);
    await this.roomRepository.remove(room);
  }

  getAllPurposes(): string[] {
    return Object.values(RoomPurpose);
  }

  async getStatistics() {
    const total = await this.roomRepository.count();
    const byPurpose = await this.roomRepository
      .createQueryBuilder('room')
      .select('room.purpose, COUNT(*) as count')
      .groupBy('room.purpose')
      .getRawMany();

    return {
      total,
      byPurpose,
    };
  }
}