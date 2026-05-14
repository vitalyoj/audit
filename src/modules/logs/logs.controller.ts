import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { FilterLogsDto } from './dto/filter-logs.dto';
import { LogResponseDto } from './dto/log-response.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';


@ApiTags('Логи')
@Controller('api/logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список логов (только суперадминистратор)' })
  @ApiResponse({ status: 200, description: 'Список логов', type: [LogResponseDto] })
  async findAll(@Query() filters: FilterLogsDto) {
    const logs = await this.logsService.findAll({
      userId: filters.userId,
      action: filters.action,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    });
    return logs.map(log => new LogResponseDto(log));
  }

  @Get('target/:targetId/:targetType')
  @ApiOperation({ summary: 'Получить логи по объекту' })
  async findByTarget(
    @Param('targetId') targetId: string,
    @Param('targetType') targetType: string,
  ) {
    const logs = await this.logsService.findByTarget(targetId, targetType);
    return logs.map(log => new LogResponseDto(log));
  }
}