import { ApiProperty } from '@nestjs/swagger';
import { Log, LogAction } from '../entities/log.entity';

export class LogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  userFullName: string;

  @ApiProperty()
  userEmail: string;

  @ApiProperty()
  action: string; // меняем тип на string

  @ApiProperty()
  details: any;

  @ApiProperty()
  createdAt: Date;

  constructor(log: Log) {
    this.id = log.id;
    this.userId = log.userId;
    this.userFullName = log.user?.fullName;
    this.userEmail = log.user?.email;
    this.action = log.action; // теперь это строка
    this.details = log.details;
    this.createdAt = log.createdAt;
  }
}