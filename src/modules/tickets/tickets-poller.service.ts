import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TicketsService } from './tickets.service';
import { YandexFormService } from './yandex-form.service';
import { LastCheckedService } from './last-checked.service';

@Injectable()
export class TicketsPollerService implements OnModuleInit {
  private readonly logger = new Logger(TicketsPollerService.name);
  private isProcessing = false;

  constructor(
    private ticketsService: TicketsService,
    private yandexFormService: YandexFormService,
    private lastCheckedService: LastCheckedService,
  ) {}

  async onModuleInit() {
    this.logger.log('Сервис опроса Яндекс Форм инициализирован');
    setTimeout(() => this.pollYandexForm(), 10000);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async pollYandexForm() {
    if (this.isProcessing) {
      this.logger.debug('Предыдущий опрос еще выполняется, пропускаем');
      return;
    }

    this.isProcessing = true;
    
    try {
      this.logger.log('Начинается опрос API Яндекс Форм...');
      
      const lastChecked = await this.lastCheckedService.getLastChecked();
      this.logger.debug(`Последняя проверка: ${lastChecked || 'никогда'}`);
      
      const answers = await this.yandexFormService.getNewAnswers(lastChecked || undefined);
      
      if (answers.length === 0) {
        this.logger.log('Новых ответов нет');
        return;
      }
      
      this.logger.log(`Найдено ${answers.length} новых ответов`);
      
      let createdCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      let lastAnswerDate: Date | null = null;
      
      for (const answer of answers) {
        const answerDate = new Date(answer.created);
        if (!lastAnswerDate || answerDate > lastAnswerDate) {
          lastAnswerDate = answerDate;
        }
        
        const exists = await this.ticketsService.findByYandexAnswerId(String(answer.id));
        if (exists) {
          this.logger.debug(`Ответ ${answer.id} уже обработан, пропускаем`);
          skippedCount++;
          continue;
        }
        
        const ticketData = this.yandexFormService.parseAnswerToTicket(answer);
        
        if (!ticketData) {
          this.logger.warn(`Не удалось распарсить ответ ${answer.id}`);
          errorCount++;
          continue;
        }
        
        const room = await this.ticketsService.findRoomByNumber(ticketData.roomNumber);
        
        if (!room) {
          this.logger.warn(`Аудитория ${ticketData.roomNumber} не найдена, заявка не создана`);
          errorCount++;
          continue;
        }
        
        try {
          const ticket = await this.ticketsService.createFromYandexAnswer({
            roomId: room.id,
            description: ticketData.description,
            reporterEmail: ticketData.reporterEmail,
            yandexCreatedAt: ticketData.yandexCreatedAt,
            yandexAnswerId: ticketData.yandexAnswerId,
          });
          
          this.logger.log(`✅ Создана заявка №${ticket.id} для аудитории ${room.number}`);
          createdCount++;
        } catch (error) {
          this.logger.error(`Ошибка создания заявки: ${error.message}`);
          errorCount++;
        }
      }
      
      if (lastAnswerDate) {
        await this.lastCheckedService.setLastChecked(lastAnswerDate);
      } else {
        await this.lastCheckedService.updateLastChecked();
      }
      
      this.logger.log(`
        📊 Результат опроса:
        - Обработано: ${answers.length}
        - Создано заявок: ${createdCount}
        - Пропущено (дубликаты): ${skippedCount}
        - Ошибок: ${errorCount}
      `);
      
    } catch (error) {
      this.logger.error(`Ошибка при опросе Яндекс Форм: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  async manualPoll(): Promise<{
    processed: number;
    created: number;
    errors: number;
    lastChecked: Date | null;
  }> {
    const lastChecked = await this.lastCheckedService.getLastChecked();
    
    const answers = await this.yandexFormService.getNewAnswers(lastChecked || undefined);
    
    let created = 0;
    let errors = 0;
    let lastAnswerDate: Date | null = lastChecked;
    
    for (const answer of answers) {
      const answerDate = new Date(answer.created);
      if (!lastAnswerDate || answerDate > lastAnswerDate) {
        lastAnswerDate = answerDate;
      }
      
      const exists = await this.ticketsService.findByYandexAnswerId(String(answer.id));
      if (exists) {
        continue;
      }
      
      const ticketData = this.yandexFormService.parseAnswerToTicket(answer);
      if (!ticketData) {
        errors++;
        continue;
      }
      
      const room = await this.ticketsService.findRoomByNumber(ticketData.roomNumber);
      if (!room) {
        errors++;
        continue;
      }
      
      try {
        await this.ticketsService.createFromYandexAnswer({
          roomId: room.id,
          description: ticketData.description,
          reporterEmail: ticketData.reporterEmail,
          yandexCreatedAt: ticketData.yandexCreatedAt,
          yandexAnswerId: ticketData.yandexAnswerId,
        });
        created++;
      } catch {
        errors++;
      }
    }
    
    if (lastAnswerDate) {
      await this.lastCheckedService.setLastChecked(lastAnswerDate);
    }
    
    return {
      processed: answers.length,
      created,
      errors,
      lastChecked: lastAnswerDate,
    };
  }

  async resetLastChecked(): Promise<void> {
    await this.lastCheckedService.reset();
    this.logger.log('Счетчик последней проверки сброшен');
  }

  async getLastCheckedStatus(): Promise<Date | null> {
    return this.lastCheckedService.getLastChecked();
  }

  async testYandexApiConnection(): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      const answers = await this.yandexFormService.getNewAnswers(undefined, 1);
      return {
        success: true,
        message: 'Подключение к API Яндекс Форм успешно',
        data: {
          hasAnswers: answers.length > 0,
          sampleAnswer: answers.length > 0 ? {
            id: answers[0].id,
            created: answers[0].created,
          } : null,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Ошибка подключения: ${error.message}`,
      };
    }
  }

  async getRawAnswers(limit: number = 5): Promise<any> {
    return this.yandexFormService.getRawAnswers(limit);
  }
}