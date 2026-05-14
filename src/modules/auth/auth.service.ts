import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    // TODO: Реальная интеграция с LDAP УрФУ
    const isValid = await this.checkLdapCredentials(email, password);
    
    if (!isValid) {
      return null;
    }

    const user = await this.usersService.findByEmail(email);

    if (!user || !user.isActive) {
      return null;
    }

    // Обновляем время последнего входа
    user.lastLoginAt = new Date();
    await this.usersService.updateUser(user.id, user); // изменено с update на updateUser

    return user;
  }

  private async checkLdapCredentials(email: string, password: string): Promise<boolean> {
    // В реальной реализации здесь будет запрос к LDAP
    // Для тестирования пропускаем любые учетные данные
    return true;
  }

  async login(user: User) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      fullName: user.fullName,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async searchLdapUsers(query: string): Promise<Array<{ email: string; fullName: string }>> {
    if (!query || query.length < 2) {
      return [];
    }

    return [
      { 
        email: `${query.toLowerCase()}@urfu.ru`, 
        fullName: `${query} Иванов Иван Иванович`,
      },
      { 
        email: `${query.toLowerCase()}.petrov@urfu.ru`, 
        fullName: `${query} Петров Петр Петрович`,
      },
    ];
  }
}