import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class FeatureDto {
  @ApiProperty({ example: 'projector', description: 'Название характеристики' })
  @IsString()
  featureName: string;

  @ApiProperty({ example: 'true', description: 'Значение характеристики' })
  @IsString()
  featureValue: string;

  @ApiProperty({ example: 1, description: 'Количество', required: false })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiProperty({ example: '4K, 3000 люмен', description: 'Технические характеристики', required: false })
  @IsString()
  @IsOptional()
  technicalSpecs?: string;
}