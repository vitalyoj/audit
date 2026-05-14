import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Building } from './entities/building.entity';
import { Floor } from '../floors/entities/floor.entity';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { LogsService } from '../logs/logs.service';
import { LogAction } from '../logs/entities/log.entity';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
    @InjectRepository(Floor)
    private floorRepository: Repository<Floor>,
    private logsService: LogsService,
  ) {}

  /**
   * Создание нового здания
   */
  async create(createBuildingDto: CreateBuildingDto, currentUserId: string): Promise<Building> {
    // Проверка уникальности названия
    const existingBuilding = await this.buildingRepository.findOne({
      where: { name: createBuildingDto.name },
    });

    if (existingBuilding) {
      throw new BadRequestException(`Здание с названием "${createBuildingDto.name}" уже существует`);
    }

    // Создаем здание
    const building = this.buildingRepository.create({
      name: createBuildingDto.name,
      photoUrl: createBuildingDto.photoUrl,
      floorsCount: createBuildingDto.floorsCount,
    });

    const savedBuilding = await this.buildingRepository.save(building);

    // Создаем этажи
    const floors: Floor[] = [];
    for (let i = 1; i <= createBuildingDto.floorsCount; i++) {
      const floor = this.floorRepository.create({
        floorNumber: i,
        name: `${i} этаж`,
        buildingId: savedBuilding.id,
      });
      floors.push(floor);
    }
    await this.floorRepository.save(floors);

    // Логируем создание
    await this.logsService.create({
      userId: currentUserId,
      action: LogAction.BUILDING_CREATE,
      details: {
        targetId: savedBuilding.id,
        targetType: 'building',
        newValue: {
          name: savedBuilding.name,
          floorsCount: savedBuilding.floorsCount,
        },
      },
    });

    return savedBuilding;
  }

  /**
   * Получение всех зданий
   */
  async findAll(): Promise<Building[]> {
    return this.buildingRepository.find({
      relations: ['floors', 'floors.schema', 'floors.rooms'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Получение здания по ID
   */
  async findOne(id: string): Promise<Building> {
    const building = await this.buildingRepository.findOne({
      where: { id },
      relations: ['floors', 'floors.schema', 'floors.rooms'],
    });

    if (!building) {
      throw new NotFoundException(`Здание с ID ${id} не найдено`);
    }

    return building;
  }

  /**
   * Получение здания с этажами (без деталей)
   */
  async findWithFloors(id: string): Promise<Building> {
    const building = await this.buildingRepository.findOne({
      where: { id },
      relations: ['floors'],
      order: { floors: { floorNumber: 'ASC' } },
    });

    if (!building) {
      throw new NotFoundException(`Здание с ID ${id} не найдено`);
    }

    return building;
  }

  /**
   * Обновление здания
   */
  async update(
    id: string,
    updateBuildingDto: UpdateBuildingDto,
    currentUserId: string,
  ): Promise<Building> {
    const building = await this.findOne(id);
    const oldValues = {
      name: building.name,
      photoUrl: building.photoUrl,
    };

    Object.assign(building, updateBuildingDto);
    const updatedBuilding = await this.buildingRepository.save(building);

    // Логируем изменение
    await this.logsService.create({
      userId: currentUserId,
      action: LogAction.BUILDING_EDIT,
      details: {
        targetId: id,
        targetType: 'building',
        oldValue: oldValues,
        newValue: {
          name: updatedBuilding.name,
          photoUrl: updatedBuilding.photoUrl,
        },
      },
    });

    return updatedBuilding;
  }

  /**
   * Обновление названия этажа
   */
  async updateFloorName(
    buildingId: string,
    floorId: string,
    name: string,
    currentUserId: string,
  ): Promise<Floor> {
    const floor = await this.floorRepository.findOne({
      where: { id: floorId, buildingId },
    });

    if (!floor) {
      throw new NotFoundException(`Этаж не найден`);
    }

    const oldName = floor.name;
    floor.name = name;
    const updatedFloor = await this.floorRepository.save(floor);

    await this.logsService.create({
      userId: currentUserId,
      action: LogAction.BUILDING_EDIT,
      details: {
        targetId: buildingId,
        targetType: 'building',
        subTargetId: floorId,
        subTargetType: 'floor',
        oldValue: { floorName: oldName },
        newValue: { floorName: name },
      },
    });

    return updatedFloor;
  }

  /**
   * Удаление здания
   */
  async remove(id: string, currentUserId: string): Promise<void> {
    const building = await this.findOne(id);

    await this.logsService.create({
      userId: currentUserId,
      action: LogAction.BUILDING_DELETE,
      details: {
        targetId: id,
        targetType: 'building',
        oldValue: {
          name: building.name,
          floorsCount: building.floorsCount,
        },
      },
    });

    await this.buildingRepository.remove(building);
  }
}