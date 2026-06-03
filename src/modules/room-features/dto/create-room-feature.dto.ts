import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNumber, IsOptional, IsUUID, IsObject } from 'class-validator';

export enum FeatureCategory {
  FURNITURE = 'furniture',
  EQUIPMENT = 'equipment',
}

export class CreateRoomFeatureDto {
  @ApiProperty({ enum: FeatureCategory, example: FeatureCategory.FURNITURE })
  @IsEnum(FeatureCategory)
  category: FeatureCategory;

  @ApiProperty({ example: 'Стул ученический' })
  @IsString()
  name: string;

  @ApiProperty({ example: 30, required: false })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiProperty({
    example: { type: 'Стул', length: 45, width: 45, height: 85 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  properties?: Record<string, any>;

  @ApiProperty()
  @IsUUID()
  roomId: string;
}