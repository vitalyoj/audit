import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  MinLength,
  MaxLength,
  IsPositive,
  IsUUID,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoomPurpose } from '../entities/room.entity';

export class FeatureDto {
  @ApiProperty({ enum: ['furniture', 'equipment'], example: 'equipment' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'Стул ученический' })
  @IsString()
  name: string;

  @ApiProperty({ example: 30, required: false })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  quantity?: number;

  @ApiProperty({
    example: { type: 'Стул', length: 45, width: 45, height: 85 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  properties?: Record<string, any>;
}

export class MediaDto {
  @ApiProperty({ enum: ['photo', 'panorama'] })
  @IsString()
  mediaType: string;

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
  @MinLength(1)
  @MaxLength(20)
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