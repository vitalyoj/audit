import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignTicketDto {
  @ApiProperty({ example: 'uuid-123', description: 'ID пользователя-исполнителя' })
  @IsUUID()
  userId: string;
}