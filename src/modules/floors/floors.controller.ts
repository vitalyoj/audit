import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FloorsService } from './floors.service';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Этажи')
@Controller('api/floors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FloorsController {
  constructor(private readonly floorsService: FloorsService) {}

  @Get('building/:buildingId')
  @ApiOperation({ summary: 'Получить этажи здания' })
  findByBuilding(@Param('buildingId') buildingId: string) {
    return this.floorsService.findByBuilding(buildingId);
  }

  @Get('building/:buildingId/numbers')
  @ApiOperation({ summary: 'Получить номера этажей здания' })
  getFloorNumbers(@Param('buildingId') buildingId: string) {
    return this.floorsService.getFloorNumbers(buildingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить этаж по ID' })
  findOne(@Param('id') id: string) {
    return this.floorsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Обновить этаж (только суперадминистратор)' })
  update(@Param('id') id: string, @Body() updateDto: UpdateFloorDto) {
    return this.floorsService.update(id, updateDto);
  }
}