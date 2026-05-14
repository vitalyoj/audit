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
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { TicketsPollerService } from './tickets-poller.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { FilterTicketsDto } from './dto/filter-tickets.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Заявки')
@Controller('api/tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly ticketsPollerService: TicketsPollerService,
  ) {}

  // ==================== ВНЕШНИЙ ЭНДПОИНТ (без авторизации) ====================

  @Post('external')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Подача заявки из внешней формы (по QR-коду) - без авторизации' })
  @ApiResponse({ status: 201, description: 'Заявка создана', type: TicketResponseDto })
  @ApiResponse({ status: 400, description: 'Ошибка валидации или аудитория не найдена' })
  async createExternal(@Body() createTicketDto: CreateTicketDto) {
    const ticket = await this.ticketsService.createFromExternal(createTicketDto);
    return new TicketResponseDto(ticket);
  }

  // ==================== ПОЛУЧЕНИЕ ДАННЫХ ====================

  @Get('rooms-with-active')
  @ApiOperation({ summary: 'Получить список ID аудиторий с открытыми заявками' })
  async getRoomsWithActiveTickets() {
    return this.ticketsService.getRoomsWithActiveTickets();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить список всех заявок' })
  @ApiQuery({ name: 'buildingId', required: false, description: 'ID здания' })
  @ApiQuery({ name: 'statuses', required: false, description: 'Статусы (через запятую)', example: 'new,assigned' })
  async findAll(@Query() filters: FilterTicketsDto) {
    const tickets = await this.ticketsService.findAll(filters);
    return tickets.map(t => new TicketResponseDto(t));
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить заявки, назначенные на текущего пользователя' })
  async findMy(@Request() req) {
    const tickets = await this.ticketsService.findByAssignee(req.user.id);
    return tickets.map(t => new TicketResponseDto(t));
  }

  @Get('room/:roomId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить заявки по аудитории' })
  async findByRoom(@Param('roomId') roomId: string) {
    const { active, archive } = await this.ticketsService.findByRoom(roomId);
    return {
      active: active.map(t => new TicketResponseDto(t)),
      archive: archive.map(t => new TicketResponseDto(t)),
    };
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить статистику по заявкам' })
  @ApiQuery({ name: 'buildingId', required: false, description: 'ID здания' })
  async getStatistics(@Query('buildingId') buildingId?: string) {
    return this.ticketsService.getStatistics(buildingId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить заявку по ID' })
  @ApiResponse({ status: 200, description: 'Заявка найдена', type: TicketResponseDto })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  async findOne(@Param('id') id: string) {
    const ticketId = parseInt(id, 10);
    if (isNaN(ticketId)) {
      throw new BadRequestException('ID должен быть числом');
    }
    const ticket = await this.ticketsService.findOne(ticketId);
    return new TicketResponseDto(ticket);
  }

  // ==================== ДЕЙСТВИЯ НАД ЗАЯВКАМИ ====================

  @Patch(':id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Назначить исполнителя на заявку' })
  async assign(
    @Param('id') id: string,
    @Body() assignDto: AssignTicketDto,
    @Request() req,
  ) {
    const ticketId = parseInt(id, 10);
    if (isNaN(ticketId)) {
      throw new BadRequestException('ID должен быть числом');
    }
    const ticket = await this.ticketsService.assignTicket(ticketId, assignDto, req.user.id);
    return new TicketResponseDto(ticket);
  }

  @Patch(':id/take')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Взять заявку в работу (для исполнителя)' })
  async takeInProgress(@Param('id') id: string, @Request() req) {
    const ticketId = parseInt(id, 10);
    if (isNaN(ticketId)) {
      throw new BadRequestException('ID должен быть числом');
    }
    const ticket = await this.ticketsService.takeInProgress(ticketId, req.user.id);
    return new TicketResponseDto(ticket);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Закрыть заявку' })
  async close(@Param('id') id: string, @Request() req) {
    const ticketId = parseInt(id, 10);
    if (isNaN(ticketId)) {
      throw new BadRequestException('ID должен быть числом');
    }
    const ticket = await this.ticketsService.closeTicket(ticketId, req.user.id);
    return new TicketResponseDto(ticket);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить статус заявки' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateTicketStatusDto,
    @Request() req,
  ) {
    const ticketId = parseInt(id, 10);
    if (isNaN(ticketId)) {
      throw new BadRequestException('ID должен быть числом');
    }
    const ticket = await this.ticketsService.updateStatus(ticketId, updateDto, req.user.id);
    return new TicketResponseDto(ticket);
  }

  // ==================== УПРАВЛЕНИЕ ОПРОСОМ (только суперадмин) ====================

  @Post('poll-manual')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ручной запуск опроса Яндекс Форм (только суперадмин)' })
  async manualPoll() {
    const result = await this.ticketsPollerService.manualPoll();
    return {
      message: 'Опрос выполнен',
      processed: result.processed,
      created: result.created,
      errors: result.errors,
      lastChecked: result.lastChecked,
    };
  }

  @Post('poll-reset')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Сбросить счетчик последней проверки (только суперадмин)' })
  async resetPollCounter() {
    await this.ticketsPollerService.resetLastChecked();
    return { message: 'Счетчик последней проверки сброшен' };
  }

  @Get('poll-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить статус последней проверки' })
  async getPollStatus() {
    const lastChecked = await this.ticketsPollerService.getLastCheckedStatus();
    const pollInterval = process.env.POLL_INTERVAL_MINUTES || 5;
    return {
      lastCheckedAt: lastChecked,
      pollIntervalMinutes: parseInt(pollInterval as string, 10),
      isEnabled: true,
    };
  }

  @Post('test-yandex-api')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Тестовый запрос к API Яндекс Форм' })
  async testYandexApi() {
    const result = await this.ticketsPollerService.testYandexApiConnection();
    return result;
  }

  @Get('debug-raw')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить сырые ответы из Яндекс Формы (отладка)' })
  async getRawAnswers(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.ticketsPollerService.getRawAnswers(limitNum);
  }

  // ==================== АДМИНИСТРИРОВАНИЕ ====================

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить заявку (только для отладки)' })
  async delete(@Param('id') id: string) {
    const ticketId = parseInt(id, 10);
    if (isNaN(ticketId)) {
      throw new BadRequestException('ID должен быть числом');
    }
    await this.ticketsService.delete(ticketId);
    return { message: `Заявка №${ticketId} удалена` };
  }
}