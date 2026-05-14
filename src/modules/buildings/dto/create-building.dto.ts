import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, Max, IsOptional, IsUrl } from 'class-validator';

export class CreateBuildingDto {
  @ApiProperty({ example: 'ИРИТ-РТФ', description: 'Название здания' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'https://example.com/photo.jpg', required: false, description: 'URL фотографии здания' })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @ApiProperty({ example: 5, description: 'Количество этажей', minimum: 1, maximum: 20 })
  @IsNumber()
  @Min(1)
  @Max(20)
  floorsCount: number;
}