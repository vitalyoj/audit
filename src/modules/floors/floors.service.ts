import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Floor } from './entities/floor.entity';
import { UpdateFloorDto } from './dto/update-floor.dto';

@Injectable()
export class FloorsService {
  constructor(
    @InjectRepository(Floor)
    private floorRepository: Repository<Floor>,
  ) {}

  async findByBuilding(buildingId: string): Promise<Floor[]> {
    return this.floorRepository.find({
      where: { buildingId },
      relations: ['schema', 'rooms'],
      order: { floorNumber: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Floor> {
    const floor = await this.floorRepository.findOne({
      where: { id },
      relations: ['building', 'schema', 'rooms', 'rooms.features', 'rooms.media'],
    });
    if (!floor) {
      throw new NotFoundException(`Этаж с ID ${id} не найден`);
    }
    return floor;
  }

  async findOneWithSchema(id: string): Promise<Floor | null> {
    return this.floorRepository.findOne({
      where: { id },
      relations: ['schema', 'schema.clickableAreas'],
    });
  }

  async update(id: string, updateDto: UpdateFloorDto): Promise<Floor> {
    const floor = await this.findOne(id);
    Object.assign(floor, updateDto);
    return this.floorRepository.save(floor);
  }

  async getFloorsByBuilding(buildingId: string): Promise<Floor[]> {
    return this.floorRepository.find({
      where: { buildingId },
      order: { floorNumber: 'ASC' },
    });
  }

  async getFloorNumbers(buildingId: string): Promise<number[]> {
    const floors = await this.floorRepository.find({
      where: { buildingId },
      select: ['floorNumber'],
      order: { floorNumber: 'ASC' },
    });
    return floors.map(f => f.floorNumber);
  }
}