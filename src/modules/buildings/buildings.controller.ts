import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BuildingsService } from './buildings.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { BuildingResponseDto } from './dto/building-response.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Здания')
@Controller('api/buildings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Создать новое здание (только суперадминистратор)' })
  @ApiResponse({ status: 201, description: 'Здание создано', type: BuildingResponseDto })
  create(@Body() createBuildingDto: CreateBuildingDto, @Request() req) {
    return this.buildingsService.create(createBuildingDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех зданий' })
  @ApiResponse({ status: 200, description: 'Список зданий', type: [BuildingResponseDto] })
  findAll() {
    return this.buildingsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить здание по ID' })
  @ApiResponse({ status: 200, description: 'Здание найдено', type: BuildingResponseDto })
  @ApiResponse({ status: 404, description: 'Здание не найдено' })
  findOne(@Param('id') id: string) {
    return this.buildingsService.findOne(id);
  }

  @Get(':id/floors')
  @ApiOperation({ summary: 'Получить здание с этажами' })
  @ApiResponse({ status: 200, description: 'Здание с этажами' })
  findWithFloors(@Param('id') id: string) {
    return this.buildingsService.findWithFloors(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Обновить здание (только суперадминистратор)' })
  @ApiResponse({ status: 200, description: 'Здание обновлено', type: BuildingResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateBuildingDto: UpdateBuildingDto,
    @Request() req,
  ) {
    return this.buildingsService.update(id, updateBuildingDto, req.user.id);
  }

  @Patch(':buildingId/floors/:floorId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Обновить название этажа' })
  updateFloorName(
    @Param('buildingId') buildingId: string,
    @Param('floorId') floorId: string,
    @Body('name') name: string,
    @Request() req,
  ) {
    return this.buildingsService.updateFloorName(buildingId, floorId, name, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Удалить здание (только суперадминистратор)' })
  @ApiResponse({ status: 204, description: 'Здание удалено' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.buildingsService.remove(id, req.user.id);
    return { message: 'Здание успешно удалено' };
  }
}