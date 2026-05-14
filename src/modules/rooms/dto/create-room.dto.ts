import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoomPurpose } from '../entities/room.entity';

class FeatureDto {
  @ApiProperty()
  @IsString()
  featureName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  featureValue?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  technicalSpecs?: string;
}

class MediaDto {
  @ApiProperty({ enum: ['photo', 'panorama'] })
  @IsString()
  mediaType: 'photo' | 'panorama';

  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateRoomDto {
  @ApiProperty({ example: '301' })
  @IsString()
  number: string;

  @ApiProperty({ example: 'floor-uuid-123' })
  @IsUUID()
  floorId: string;

  @ApiProperty({ enum: RoomPurpose, example: RoomPurpose.LECTURE })
  @IsEnum(RoomPurpose)
  purpose: RoomPurpose;

  @ApiProperty({ example: 75.5, required: false })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  area?: number;

  @ApiProperty({ example: 60, required: false })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  capacity?: number;

  @ApiProperty({ example: 'Описание аудитории', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [FeatureDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureDto)
  @IsOptional()
  features?: FeatureDto[];

  @ApiProperty({ type: [MediaDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaDto)
  @IsOptional()
  media?: MediaDto[];
}