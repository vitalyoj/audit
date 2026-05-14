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
import { ClickableAreasService } from './clickable-areas.service';
import { CreateClickableAreaDto } from './dto/create-clickable-area.dto';
import { UpdateClickableAreaDto } from './dto/update-clickable-area.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Кликабельные области')
@Controller('api/clickable-areas')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClickableAreasController {
  constructor(private readonly areasService: ClickableAreasService) {}

  @Post('schema/:schemaId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Создать кликабельную область' })
  create(
    @Param('schemaId') schemaId: string,
    @Body() createDto: CreateClickableAreaDto,
    @CurrentUser() user,
  ) {
    return this.areasService.create(schemaId, createDto, user.id);
  }

  @Get('schema/:schemaId')
  @ApiOperation({ summary: 'Получить все области схемы' })
  findBySchema(@Param('schemaId') schemaId: string) {
    return this.areasService.findBySchema(schemaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить область по ID' })
  findOne(@Param('id') id: string) {
    return this.areasService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Обновить область' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateClickableAreaDto,
    @CurrentUser() user,
  ) {
    return this.areasService.update(id, updateDto, user.id);
  }

  @Patch(':id/link/:roomId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Связать область с аудиторией' })
  linkToRoom(
    @Param('id') id: string,
    @Param('roomId') roomId: string,
  ) {
    return this.areasService.linkToRoom(id, roomId);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Удалить область' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.areasService.remove(id, user.id);
  }
}