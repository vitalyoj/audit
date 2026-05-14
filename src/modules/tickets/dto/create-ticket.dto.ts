import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: '301', description: 'Номер аудитории' })
  @IsString()
  roomNumber: string;

  @ApiProperty({ example: 'Не работает проектор', description: 'Описание проблемы' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 'user@urfu.ru', description: 'E-mail заявителя' })
  @IsEmail()
  reporterEmail: string;
}