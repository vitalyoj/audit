import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AddUsersDto } from './dto/add-users.dto';
import { LdapSearchResultDto } from './dto/ldap-search-result.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, User } from './entities/user.entity';

@ApiTags('Пользователи')
@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('ldap/search')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Поиск пользователей в LDAP' })
  @ApiQuery({ name: 'q', description: 'Поисковый запрос' })
  async searchLdap(@Query('q') query: string): Promise<LdapSearchResultDto[]> {
    return this.usersService.searchLdap(query);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Добавить пользователя в систему' })
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.usersService.create(createUserDto, req.user.id);
  }

  @Post('batch')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Добавить нескольких пользователей' })
  async addUsers(@Body() addUsersDto: AddUsersDto, @Request() req) {
    const results: User[] = [];
    for (const user of addUsersDto.users) {
      const created = await this.usersService.create(
        {
          email: user.email,
          fullName: user.fullName,
          role: UserRole.USER,
        },
        req.user.id,
      );
      results.push(created);
    }
    return { users: results, count: results.length };
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Получить список всех пользователей' })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query('search') search?: string) {
    return this.usersService.findAll(search);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Изменить роль пользователя' })
  updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
    @Request() req,
  ) {
    return this.usersService.updateRole(id, updateRoleDto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Удалить пользователя' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.usersService.remove(id, req.user.id);
    return { message: 'Пользователь успешно удален' };
  }
}