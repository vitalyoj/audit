import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { LogsService } from '../logs/logs.service';
import { LogAction } from '../logs/entities/log.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private logsService: LogsService,
  ) {}

  async create(createUserDto: CreateUserDto, currentUserId: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException(`Пользователь с email ${createUserDto.email} уже существует`);
    }

    const user = this.userRepository.create({
      ...createUserDto,
      role: createUserDto.role || UserRole.USER,
    });

    const savedUser = await this.userRepository.save(user);

    await this.logsService.create({
      userId: currentUserId,
      action: LogAction.USER_CREATE,
      details: {
        targetId: savedUser.id,
        targetType: 'user',
        newValue: {
          email: savedUser.email,
          fullName: savedUser.fullName,
          role: savedUser.role,
        },
      },
    });

    return savedUser;
  }

  async findAll(search?: string): Promise<User[]> {
    if (search) {
      return this.userRepository.find({
        where: [
          { fullName: Like(`%${search}%`) },
          { email: Like(`%${search}%`) },
        ],
        order: { fullName: 'ASC' },
      });
    }
    return this.userRepository.find({
      order: { fullName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async updateRole(
    userId: string,
    updateRoleDto: UpdateUserRoleDto,
    currentUserId: string,
  ): Promise<User> {
    const user = await this.findOne(userId);
    const oldRole = user.role;

    user.role = updateRoleDto.role;
    const updatedUser = await this.userRepository.save(user);

    await this.logsService.create({
      userId: currentUserId,
      action: LogAction.USER_ROLE_EDIT,
      details: {
        targetId: userId,
        targetType: 'user',
        oldValue: { role: oldRole },
        newValue: { role: updateRoleDto.role },
      },
    });

    return updatedUser;
  }

  async remove(userId: string, currentUserId: string): Promise<void> {
    const user = await this.findOne(userId);

    if (user.id === currentUserId) {
      throw new BadRequestException('Нельзя удалить самого себя');
    }

    await this.logsService.create({
      userId: currentUserId,
      action: LogAction.USER_DELETE,
      details: {
        targetId: userId,
        targetType: 'user',
        oldValue: {
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      },
    });

    await this.userRepository.remove(user);
  }

  async searchLdap(query: string): Promise<Array<{ email: string; fullName: string }>> {
    if (!query || query.length < 2) {
      return [];
    }

    return [
      { email: `${query.toLowerCase()}@urfu.ru`, fullName: `${query} Иванов Иван Иванович` },
      { email: `${query.toLowerCase()}.petrov@urfu.ru`, fullName: `${query} Петров Петр Петрович` },
    ];
  }
}