import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { FilterRoomDto } from './dto/filter-room.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Аудитории')
@Controller('api/rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Создать новую аудиторию' })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список аудиторий с фильтрацией' })
  findAll(@Query() filter: FilterRoomDto) {
    return this.roomsService.findAll(filter);
  }

  @Get('purposes')
  @ApiOperation({ summary: 'Получить список всех типов помещений' })
  getPurposes() {
    return this.roomsService.getAllPurposes();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Получить статистику по аудиториям' })
  getStatistics() {
    return this.roomsService.getStatistics();
  }

  @Get('number/:number')
  @ApiOperation({ summary: 'Получить аудиторию по номеру' })
  findByNumber(@Param('number') number: string) {
    return this.roomsService.findByNumber(number);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить аудиторию по ID' })
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Обновить аудиторию' })
  update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomsService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Удалить аудиторию' })
  async remove(@Param('id') id: string) {
    await this.roomsService.remove(id);
    return { message: 'Аудитория успешно удалена' };
  }
}