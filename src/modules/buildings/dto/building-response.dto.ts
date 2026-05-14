import { ApiProperty } from '@nestjs/swagger';
import { Building } from '../entities/building.entity';

export class BuildingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  photoUrl: string | null;

  @ApiProperty()
  floorsCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(building: Building) {
    this.id = building.id;
    this.name = building.name;
    this.photoUrl = building.photoUrl;
    this.floorsCount = building.floorsCount;
    this.createdAt = building.createdAt;
    this.updatedAt = building.updatedAt;
  }
}