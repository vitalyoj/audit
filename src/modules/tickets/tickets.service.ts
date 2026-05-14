import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { Room } from '../rooms/entities/room.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { FilterTicketsDto } from './dto/filter-tickets.dto';
import { RoomsService } from '../rooms/rooms.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    private roomsService: RoomsService,
    private usersService: UsersService,
  ) {}

  async createFromYandexAnswer(data: {
    roomId: string;
    description: string;
    reporterEmail: string;
    yandexCreatedAt: Date;
    yandexAnswerId: string;
  }): Promise<Ticket> {
    const ticket = this.ticketRepository.create({
      description: data.description,
      reporterEmail: data.reporterEmail,
      status: TicketStatus.NEW,
      roomId: data.roomId,
      yandexCreatedAt: data.yandexCreatedAt,
      yandexAnswerId: data.yandexAnswerId,
    });

    const savedTicket = await this.ticketRepository.save(ticket);
    this.logger.log(`Создана заявка №${savedTicket.id} из Яндекс Формы (ID: ${data.yandexAnswerId})`);
    return savedTicket;
  }

  async createFromExternal(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const room = await this.roomsService.findByNumber(createTicketDto.roomNumber);
    
    if (!room) {
      throw new BadRequestException(`Аудитория ${createTicketDto.roomNumber} не найдена`);
    }

    const ticket = this.ticketRepository.create({
      description: createTicketDto.description,
      reporterEmail: createTicketDto.reporterEmail,
      status: TicketStatus.NEW,
      roomId: room.id,
    });

    const savedTicket = await this.ticketRepository.save(ticket);
    this.logger.log(`Создана заявка №${savedTicket.id} из внешней формы для аудитории ${createTicketDto.roomNumber}`);
    return savedTicket;
  }

  async findByYandexAnswerId(yandexAnswerId: string): Promise<Ticket | null> {
    return this.ticketRepository.findOne({
      where: { yandexAnswerId },
    });
  }

  async findRoomByNumber(number: string): Promise<Room | null> {
    return this.roomRepository.findOne({
      where: { number },
    });
  }

  async findAll(filters?: FilterTicketsDto): Promise<Ticket[]> {
    const queryBuilder = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.room', 'room')
      .leftJoinAndSelect('room.floor', 'floor')
      .leftJoinAndSelect('floor.building', 'building')
      .leftJoinAndSelect('ticket.assignedTo', 'assignedTo')
      .orderBy('ticket.createdAt', 'DESC');

    if (filters?.buildingId) {
      queryBuilder.andWhere('building.id = :buildingId', { buildingId: filters.buildingId });
    }

    if (filters?.statuses && filters.statuses.length > 0) {
      queryBuilder.andWhere('ticket.status IN (:...statuses)', { statuses: filters.statuses });
    }

    return queryBuilder.getMany();
  }

  async findByAssignee(userId: string): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: { assignedToId: userId },
      relations: ['room', 'room.floor', 'room.floor.building', 'assignedTo'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByRoom(roomId: string): Promise<{ active: Ticket[]; archive: Ticket[] }> {
    const tickets = await this.ticketRepository.find({
      where: { roomId },
      relations: ['assignedTo'],
      order: { createdAt: 'DESC' },
    });

    const active = tickets.filter(t => t.status !== TicketStatus.CLOSED);
    const archive = tickets.filter(t => t.status === TicketStatus.CLOSED);

    return { active, archive };
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['room', 'room.floor', 'room.floor.building', 'assignedTo'],
    });
    if (!ticket) {
      throw new NotFoundException(`Заявка №${id} не найдена`);
    }
    return ticket;
  }

  async assignTicket(
    ticketId: number,
    assignTicketDto: AssignTicketDto,
    currentUserId: string,
  ): Promise<Ticket> {
    const ticket = await this.findOne(ticketId);
    const user = await this.usersService.findOne(assignTicketDto.userId);

    if (ticket.status !== TicketStatus.NEW && ticket.status !== TicketStatus.ASSIGNED) {
      throw new BadRequestException('Можно назначить исполнителя только на новую или назначенную заявку');
    }

    const oldAssignedToId = ticket.assignedToId;
    ticket.assignedTo = user;
    
    if (ticket.status === TicketStatus.NEW) {
      ticket.status = TicketStatus.ASSIGNED;
    }

    const updatedTicket = await this.ticketRepository.save(ticket);
    this.logger.log(`Заявка №${ticketId}: назначен исполнитель ${user.fullName} (пользователь: ${currentUserId})`);

    return updatedTicket;
  }

  async takeInProgress(ticketId: number, currentUserId: string): Promise<Ticket> {
    const ticket = await this.findOne(ticketId);

    if (ticket.assignedToId !== currentUserId) {
      throw new BadRequestException('Вы не являетесь исполнителем этой заявки');
    }

    if (ticket.status !== TicketStatus.ASSIGNED) {
      throw new BadRequestException('Можно взять в работу только назначенную заявку');
    }

    ticket.status = TicketStatus.IN_PROGRESS;
    const updatedTicket = await this.ticketRepository.save(ticket);
    this.logger.log(`Заявка №${ticketId}: взята в работу (пользователь: ${currentUserId})`);

    return updatedTicket;
  }

  async closeTicket(ticketId: number, currentUserId: string): Promise<Ticket> {
    const ticket = await this.findOne(ticketId);
    const oldStatus = ticket.status;

    if (ticket.status === TicketStatus.CLOSED) {
      throw new BadRequestException('Заявка уже закрыта');
    }

    ticket.status = TicketStatus.CLOSED;
    const updatedTicket = await this.ticketRepository.save(ticket);
    this.logger.log(`Заявка №${ticketId}: закрыта (статус был ${oldStatus}, пользователь: ${currentUserId})`);

    return updatedTicket;
  }

  async updateStatus(
    ticketId: number,
    updateStatusDto: UpdateTicketStatusDto,
    currentUserId: string,
  ): Promise<Ticket> {
    const ticket = await this.findOne(ticketId);
    const oldStatus = ticket.status;
    const newStatus = updateStatusDto.status;

    if (newStatus === TicketStatus.ASSIGNED && ticket.status !== TicketStatus.NEW) {
      throw new BadRequestException('Назначить можно только новую заявку');
    }
    if (newStatus === TicketStatus.IN_PROGRESS && ticket.status !== TicketStatus.ASSIGNED) {
      throw new BadRequestException('Взять в работу можно только назначенную заявку');
    }
    if (newStatus === TicketStatus.CLOSED && ticket.status === TicketStatus.CLOSED) {
      throw new BadRequestException('Заявка уже закрыта');
    }

    ticket.status = newStatus;
    const updatedTicket = await this.ticketRepository.save(ticket);
    this.logger.log(`Заявка №${ticketId}: статус изменен с ${oldStatus} на ${newStatus} (пользователь: ${currentUserId})`);

    return updatedTicket;
  }

  async getRoomsWithActiveTickets(): Promise<string[]> {
    const tickets = await this.ticketRepository.find({
      where: { status: In([TicketStatus.NEW, TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS]) },
      relations: ['room'],
    });
    
    const roomIds = new Set<string>();
    for (const ticket of tickets) {
      if (ticket.room?.id) {
        roomIds.add(ticket.room.id);
      }
    }
    
    return Array.from(roomIds);
  }

  async getStatistics(buildingId?: string): Promise<{
    total: number;
    byStatus: Record<TicketStatus, number>;
    byRoom: Array<{ roomNumber: string; count: number }>;
  }> {
    const queryBuilder = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoin('ticket.room', 'room')
      .leftJoin('room.floor', 'floor');

    if (buildingId) {
      queryBuilder.andWhere('floor.buildingId = :buildingId', { buildingId });
    }

    const tickets = await queryBuilder.getMany();

    const byStatus = {
      [TicketStatus.NEW]: 0,
      [TicketStatus.ASSIGNED]: 0,
      [TicketStatus.IN_PROGRESS]: 0,
      [TicketStatus.CLOSED]: 0,
    };

    const roomMap = new Map<string, number>();

    for (const ticket of tickets) {
      byStatus[ticket.status]++;
      
      if (ticket.room?.number) {
        const count = roomMap.get(ticket.room.number) || 0;
        roomMap.set(ticket.room.number, count + 1);
      }
    }

    const byRoom = Array.from(roomMap.entries())
      .map(([roomNumber, count]) => ({ roomNumber, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total: tickets.length,
      byStatus,
      byRoom,
    };
  }

  async delete(id: number): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketRepository.remove(ticket);
    this.logger.log(`Заявка №${id} удалена (только для отладки)`);
  }
}