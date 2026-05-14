import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FloorSchema } from './entities/floor-schema.entity';
import { Floor } from '../floors/entities/floor.entity';
import { LogsService } from '../logs/logs.service';
import { LogAction } from '../logs/entities/log.entity';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import { join } from 'path';

@Injectable()
export class FloorSchemasService {
  constructor(
    @InjectRepository(FloorSchema)
    private schemaRepository: Repository<FloorSchema>,
    @InjectRepository(Floor)
    private floorRepository: Repository<Floor>,
    private logsService: LogsService,
  ) {}

  async uploadSchema(
    floorId: string,
    file: Express.Multer.File,
    width: number,
    height: number,
    currentUserId: string,
  ): Promise<FloorSchema> {
    const floor = await this.floorRepository.findOne({
      where: { id: floorId },
      relations: ['building', 'schema'],
    });

    if (!floor) {
      throw new NotFoundException(`Этаж с ID ${floorId} не найден`);
    }

    if (floor.schema) {
      await this.deleteSchema(floor.schema.id, currentUserId);
    }

    const fileName = `schema-${uuidv4()}.jpg`;
    const uploadPath = join(process.cwd(), 'uploads', 'schemas', fileName);
    await fs.mkdir(join(process.cwd(), 'uploads', 'schemas'), { recursive: true });
    await fs.writeFile(uploadPath, file.buffer);

    const schema = this.schemaRepository.create({
      imageUrl: `/uploads/schemas/${fileName}`,
      width,
      height,
      floorId,
    });

    const savedSchema = await this.schemaRepository.save(schema);

    await this.logsService.create({
      userId: currentUserId,
      action: LogAction.FLOOR_SCHEMA_EDIT,
      details: {
        targetId: floorId,
        targetType: 'floor',
        newValue: { schemaId: savedSchema.id },
      },
    });

    return savedSchema;
  }

  async findByFloor(floorId: string): Promise<FloorSchema | null> {
    return this.schemaRepository.findOne({
      where: { floorId },
      relations: ['clickableAreas', 'clickableAreas.room'],
    });
  }

  async deleteSchema(schemaId: string, currentUserId: string): Promise<void> {
    const schema = await this.schemaRepository.findOne({
      where: { id: schemaId },
      relations: ['clickableAreas'],
    });

    if (!schema) {
      throw new NotFoundException(`Схема не найдена`);
    }

    if (schema.imageUrl) {
      const filePath = join(process.cwd(), schema.imageUrl);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Ошибка при удалении файла схемы:', error);
      }
    }

    await this.logsService.create({
      userId: currentUserId,
      action: LogAction.FLOOR_SCHEMA_EDIT,
      details: {
        targetId: schema.floorId,
        targetType: 'floor',
        oldValue: { schemaId },
      },
    });

    await this.schemaRepository.remove(schema);
  }

  async updateDimensions(
    schemaId: string,
    width: number,
    height: number,
  ): Promise<FloorSchema> {
    const schema = await this.schemaRepository.findOne({
      where: { id: schemaId },
    });

    if (!schema) {
      throw new NotFoundException(`Схема не найдена`);
    }

    schema.width = width;
    schema.height = height;

    return this.schemaRepository.save(schema);
  }

  async getSchemaWithAreas(schemaId: string): Promise<FloorSchema | null> {
    return this.schemaRepository.findOne({
      where: { id: schemaId },
      relations: ['clickableAreas', 'clickableAreas.room', 'floor'],
    });
  }
  async findOne(id: string): Promise<FloorSchema> {
  const schema = await this.schemaRepository.findOne({
    where: { id },
    relations: ['floor', 'floor.building'],
  });
  
  if (!schema) {
    throw new NotFoundException(`Схема этажа с ID ${id} не найдена`);
  }
  
  return schema;
}
}