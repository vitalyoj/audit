import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { MediaType } from '../entities/room-media.entity';

export class CreateRoomMediaDto {
  @ApiProperty({ enum: MediaType })
  @IsEnum(MediaType)
  mediaType: MediaType;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  originalName?: string;

  @ApiProperty()
  @IsString()
  mimeType: string;

  @ApiProperty()
  @IsNumber()
  fileSize: number;

  @ApiProperty()
  @IsUUID()
  roomId: string;
}