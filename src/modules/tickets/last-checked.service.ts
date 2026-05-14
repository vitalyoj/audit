import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LastChecked } from './entities/last-checked.entity';

@Injectable()
export class LastCheckedService {
  private readonly logger = new Logger(LastCheckedService.name);
  private readonly SOURCE_NAME = 'yandex_forms';

  constructor(
    @InjectRepository(LastChecked)
    private lastCheckedRepository: Repository<LastChecked>,
  ) {}

  async getLastChecked(): Promise<Date | null> {
    try {
      const record = await this.lastCheckedRepository.findOne({
        where: { source: this.SOURCE_NAME },
      });
      
      if (record && record.lastCheckedAt) {
        this.logger.debug(`Последняя проверка: ${record.lastCheckedAt}`);
        return record.lastCheckedAt;
      }
      
      this.logger.debug('Нет сохраненной даты последней проверки');
      return null;
    } catch (error) {
      this.logger.error(`Ошибка получения даты последней проверки: ${error.message}`);
      return null;
    }
  }

  async setLastChecked(date: Date): Promise<void> {
    try {
      let record = await this.lastCheckedRepository.findOne({
        where: { source: this.SOURCE_NAME },
      });

      if (!record) {
        record = this.lastCheckedRepository.create({
          source: this.SOURCE_NAME,
          lastCheckedAt: date,
        });
      } else {
        record.lastCheckedAt = date;
      }

      await this.lastCheckedRepository.save(record);
      this.logger.debug(`Сохранена дата последней проверки: ${date}`);
    } catch (error) {
      this.logger.error(`Ошибка сохранения даты последней проверки: ${error.message}`);
    }
  }

  async updateLastChecked(): Promise<Date> {
    const now = new Date();
    await this.setLastChecked(now);
    return now;
  }

  async reset(): Promise<void> {
    try {
      const record = await this.lastCheckedRepository.findOne({
        where: { source: this.SOURCE_NAME },
      });

      if (record) {
        await this.lastCheckedRepository.remove(record);
        this.logger.log('Счетчик последней проверки сброшен (запись удалена)');
      } else {
        this.logger.debug('Запись не найдена, ничего не сбрасывалось');
      }
    } catch (error) {
      this.logger.error(`Ошибка сброса счетчика: ${error.message}`);
    }
  }
}