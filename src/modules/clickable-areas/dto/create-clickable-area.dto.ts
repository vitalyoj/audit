import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, IsUUID } from 'class-validator';

class PointDto {
  @ApiProperty({ example: 100 })
  x: number;

  @ApiProperty({ example: 150 })
  y: number;
}

export class CreateClickableAreaDto {
  @ApiProperty({
    type: 'object',
    properties: {
      points: {
        type: 'array',
        items: { type: 'object', properties: { x: { type: 'number' }, y: { type: 'number' } } },
      },
    },
  })
  @IsObject()
  coordinates: {
    points: PointDto[];
  };

  @ApiProperty({ required: false, description: 'ID существующей аудитории (если есть)' })
  @IsOptional()
  @IsUUID()
  roomId?: string;
}