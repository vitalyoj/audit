import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@urfu.ru', description: 'Email из домена УрФУ' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Пароль' })
  @IsString()
  @MinLength(6)
  password: string;
}