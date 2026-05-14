import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClickableArea } from './entities/clickable-area.entity';
import { CreateClickableAreaDto } from './dto/create-clickable-area.dto';
import { UpdateClickableAreaDto } from './dto/update-clickable-area.dto';
import { FloorSchemasService } from '../floor-schemas/floor-schemas.service';
import { RoomsService } from '../rooms/rooms.service';
import { LogsService } from '../logs/logs.service';
import { LogAction } from '../logs/entities/log.entity';

@Injectable()
export class ClickableAreasService {
  constructor(
    @InjectRepository(ClickableArea)
    private areaRepository: Repository<ClickableArea>,
    private schemasService: FloorSchemasService,
    private roomsService: RoomsService,
    private logsService: LogsService,
  ) {}

  async create(
  schemaId: string, 
  createDto: CreateClickableAreaDto, 
  currentUserId: string
): Promise<ClickableArea> {
  // ✅ ПРАВИЛЬНО: ищем схему по ID, а не по floorId
  const schema = await this.schemasService.findOne(schemaId);
  if (!schema) {
    throw new NotFoundException(`Схема этажа с ID ${schemaId} не найдена`);
  }

  // Проверяем, что roomId передан
  if (!createDto.roomId) {
    throw new BadRequestException('roomId обязателен');
  }

  const area = this.areaRepository.create({
    coordinates: createDto.coordinates,
    schemaId: schema.id,
    roomId: createDto.roomId, // Сразу связываем с комнатой
  });

  const savedArea = await this.areaRepository.save(area);

  await this.logsService.create({
    userId: currentUserId,
    action: LogAction.CLICKABLE_AREA_CREATE,
    details: {
      targetId: savedArea.id,
      targetType: 'clickable_area',
      newValue: { 
        coordinates: savedArea.coordinates,
        roomId: savedArea.roomId 
      },
    },
  });

  return savedArea;
}

  async findBySchema(schemaId: string): Promise<ClickableArea[]> {
    return this.areaRepository.find({
      where: { schemaId },
      relations: ['room'],
    });
  }

  async findOne(id: string): Promise<ClickableArea> {
    const area = await this.areaRepository.findOne({
      where: { id },
      relations: ['schema', 'room'],
    });
    if (!area) {
      throw new NotFoundException(`Кликабельная область с ID ${id} не найдена`);
    }
    return area;
  }

  async linkToRoom(areaId: string, roomId: string): Promise<ClickableArea> {
    const area = await this.findOne(areaId);
    const room = await this.roomsService.findOne(roomId);

    area.room = room;
    return this.areaRepository.save(area);
  }

  // Добавляем метод update
  async update(
    id: string,
    updateDto: UpdateClickableAreaDto,
    currentUserId: string,
  ): Promise<ClickableArea> {
    const area = await this.findOne(id);
    const oldCoordinates = area.coordinates;
    
    if (updateDto.coordinates) {
      area.coordinates = updateDto.coordinates;
    }
    
    const updatedArea = await this.areaRepository.save(area);

    await this.logsService.create({
      userId: currentUserId,
      action: LogAction.CLICKABLE_AREA_EDIT,
      details: {
        targetId: id,
        targetType: 'clickable_area',
        oldValue: { coordinates: oldCoordinates },
        newValue: { coordinates: updatedArea.coordinates },
      },
    });

    return updatedArea;
  }

  async remove(id: string, currentUserId: string): Promise<void> {
    const area = await this.findOne(id);

    await this.logsService.create({
      userId: currentUserId,
      action: LogAction.CLICKABLE_AREA_DELETE,
      details: {
        targetId: id,
        targetType: 'clickable_area',
        oldValue: {
          coordinates: area.coordinates,
          roomId: area.roomId,
        },
      },
    });

    await this.areaRepository.remove(area);
  }
}