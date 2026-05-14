import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UploadSchemaDto {
  @ApiProperty({ example: 1024, required: false, description: 'Ширина изображения' })
  @IsNumber()
  @IsOptional()
  width?: number;

  @ApiProperty({ example: 768, required: false, description: 'Высота изображения' })
  @IsNumber()
  @IsOptional()
  height?: number;
}