import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, IsEnum, IsUUID } from 'class-validator';
import { TicketStatus } from '../entities/ticket.entity';

export class FilterTicketsDto {
  @ApiProperty({ required: false, description: 'ID здания' })
  @IsOptional()
  @IsUUID()
  buildingId?: string;

  @ApiProperty({ required: false, enum: TicketStatus, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(TicketStatus, { each: true })
  statuses?: TicketStatus[];
}
