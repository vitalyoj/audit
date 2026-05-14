import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'user@urfu.ru' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Иванов Иван Иванович' })
  @IsString()
  fullName: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}