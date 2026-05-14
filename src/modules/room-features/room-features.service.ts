import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomFeature } from './entities/room-feature.entity';
import { CreateRoomFeatureDto } from './dto/create-room-feature.dto';
import { UpdateRoomFeatureDto } from './dto/update-room-feature.dto';

@Injectable()
export class RoomFeaturesService {
  constructor(
    @InjectRepository(RoomFeature)
    private featureRepository: Repository<RoomFeature>,
  ) {}

  async create(createDto: CreateRoomFeatureDto): Promise<RoomFeature> {
    const feature = this.featureRepository.create(createDto);
    return this.featureRepository.save(feature);
  }

  async findByRoom(roomId: string): Promise<RoomFeature[]> {
    return this.featureRepository.find({
      where: { roomId },
      order: { featureName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<RoomFeature> {
    const feature = await this.featureRepository.findOne({ where: { id } });
    if (!feature) {
      throw new NotFoundException(`Оснащение с ID ${id} не найдено`);
    }
    return feature;
  }

  async update(id: string, updateDto: UpdateRoomFeatureDto): Promise<RoomFeature> {
    const feature = await this.findOne(id);
    Object.assign(feature, updateDto);
    return this.featureRepository.save(feature);
  }

  async remove(id: string): Promise<void> {
    const feature = await this.findOne(id);
    await this.featureRepository.remove(feature);
  }

  async removeByRoom(roomId: string): Promise<void> {
    await this.featureRepository.delete({ roomId });
  }
}