import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNumber, IsOptional } from 'class-validator';
import { MediaType } from '../entities/room-media.entity';

export class MediaDto {
  @ApiProperty({ enum: MediaType, example: MediaType.PHOTO })
  @IsEnum(MediaType)
  mediaType: MediaType;

  @ApiProperty({ example: '/uploads/rooms/123/photo.jpg' })
  @IsString()
  url: string;

  @ApiProperty({ required: false, example: '/uploads/rooms/123/thumb.jpg' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ required: false, example: 0 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}