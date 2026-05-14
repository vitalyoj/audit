import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Log, LogAction } from './entities/log.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

interface CreateLogDto {
  userId: string;
  action: LogAction;
  details?: {
    targetId?: string;
    targetType?: string;
    subTargetId?: string;
    subTargetType?: string;
    oldValue?: any;
    newValue?: any;
  };
}

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
  ) {}

  async create(createLogDto: CreateLogDto): Promise<Log> {
    const log = this.logRepository.create(createLogDto);
    return this.logRepository.save(log);
  }

  async findAll(filters?: {
    userId?: string;
    action?: LogAction;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Log[]> {
    const queryBuilder = this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.createdAt', 'DESC');

    if (filters?.userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId: filters.userId });
    }

    if (filters?.action) {
      queryBuilder.andWhere('log.action = :action', { action: filters.action });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere('log.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('log.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return queryBuilder.getMany();
  }

  // Добавляем метод findByTarget
  async findByTarget(targetId: string, targetType: string): Promise<Log[]> {
    return this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.details->>targetId = :targetId', { targetId })
      .andWhere('log.details->>targetType = :targetType', { targetType })
      .orderBy('log.createdAt', 'DESC')
      .getMany();
  }

  // Добавляем метод findByUser
  async findByUser(userId: string): Promise<Log[]> {
    return this.logRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // Добавляем метод getByDateRange
  async getByDateRange(startDate: Date, endDate: Date): Promise<Log[]> {
    return this.logRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
  @Cron('0 2 * * *') // каждый день в 2:00
  async cleanOldLogs() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    try {
      const deleteResult = await this.logRepository
        .createQueryBuilder()
        .delete()
        .from(Log)
        .where('"createdAt" < :date', { date: sixMonthsAgo })
        .execute();

      this.logger.log(`🗑️ Удалено ${deleteResult.affected} устаревших записей логов`);
    } catch (error) {
      this.logger.error(`❌ Ошибка при очистке логов: ${error.message}`);
    }
  }
}
