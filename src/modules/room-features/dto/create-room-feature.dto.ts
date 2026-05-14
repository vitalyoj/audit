import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateRoomFeatureDto {
  @ApiProperty({ example: 'projector' })
  @IsString()
  featureName: string;

  @ApiProperty({ example: 'Epson EB-695Wi', required: false })
  @IsOptional()
  @IsString()
  featureValue?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ example: '4K, 3500 люмен', required: false })
  @IsOptional()
  @IsString()
  technicalSpecs?: string;

  @ApiProperty()
  @IsUUID()
  roomId: string;
}