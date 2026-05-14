import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoomFeaturesService } from './room-features.service';
import { CreateRoomFeatureDto } from './dto/create-room-feature.dto';
import { UpdateRoomFeatureDto } from './dto/update-room-feature.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Оснащение аудиторий')
@Controller('api/room-features')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RoomFeaturesController {
  constructor(private readonly featuresService: RoomFeaturesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Создать оснащение' })
  create(@Body() createDto: CreateRoomFeatureDto) {
    return this.featuresService.create(createDto);
  }

  @Get('room/:roomId')
  @ApiOperation({ summary: 'Получить оснащение аудитории' })
  findByRoom(@Param('roomId') roomId: string) {
    return this.featuresService.findByRoom(roomId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить оснащение по ID' })
  findOne(@Param('id') id: string) {
    return this.featuresService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Обновить оснащение' })
  update(@Param('id') id: string, @Body() updateDto: UpdateRoomFeatureDto) {
    return this.featuresService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Удалить оснащение' })
  remove(@Param('id') id: string) {
    return this.featuresService.remove(id);
  }
}