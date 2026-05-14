import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface YandexFormAnswer {
  id: number;
  created: string;
  data: Array<{
    value?: any;
  }>;
}

export interface YandexFormResponse {
  answers: YandexFormAnswer[];
  total?: number;
  next?: {
    next_url: string;
  };
}

@Injectable()
export class YandexFormService {
  private readonly logger = new Logger(YandexFormService.name);
  private readonly apiKey: string;
  private readonly surveyId: string;
  private readonly cloudOrgId: string;  // ← добавляем поле
  private readonly baseUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('YANDEX_FORM_API_KEY') || '';
    this.surveyId = this.configService.get<string>('YANDEX_FORM_ID') || '';
    this.cloudOrgId = this.configService.get<string>('YANDEX_CLOUD_ORG_ID') || '';  // ← получаем ID организации
    this.baseUrl = 'https://api.forms.yandex.net/v1';
    
    if (!this.apiKey || !this.surveyId) {
      this.logger.warn('YANDEX_FORM_API_KEY или YANDEX_FORM_ID не заданы в .env');
    }
    if (!this.cloudOrgId) {
      this.logger.warn('YANDEX_CLOUD_ORG_ID не задан в .env');
    }
  }

  async getNewAnswers(fromDate?: Date, limit: number = 50): Promise<YandexFormAnswer[]> {
    try {
      let url = `${this.baseUrl}/surveys/${this.surveyId}/answers?page_size=${limit}`;
      
      if (fromDate) {
        const formattedDate = fromDate.toISOString();
        url += `&created_at__gte=${encodeURIComponent(formattedDate)}`;
      }

      this.logger.debug(`Запрос к API Яндекс Форм: ${url}`);

      // Формируем заголовки
      const headers: Record<string, string> = {
        'Authorization': `OAuth ${this.apiKey}`,
        'Content-Type': 'application/json',
      };
      
      // Добавляем заголовок с ID организации, если он есть
      if (this.cloudOrgId) {
        headers['X-Cloud-Org-Id'] = this.cloudOrgId;
        this.logger.debug(`Добавлен заголовок X-Cloud-Org-Id: ${this.cloudOrgId}`);
      }

      const response = await firstValueFrom(
        this.httpService.get<YandexFormResponse>(url, { headers })
      );

      const answers = response.data.answers || [];
      this.logger.log(`Получено ${answers.length} ответов из Яндекс Формы`);
      
      if (answers.length > 0) {
        this.logger.debug(`Первый ответ ID: ${answers[0].id}, created: ${answers[0].created}`);
        this.logger.debug(`Данные первого ответа: ${JSON.stringify(answers[0].data)}`);
      }
      
      return answers;
    } catch (error) {
      this.logger.error(`Ошибка при запросе к API Яндекс Форм: ${error.message}`);
      if (error.response) {
        this.logger.error(`Статус: ${error.response.status}`);
        this.logger.error(`Данные: ${JSON.stringify(error.response.data)}`);
      }
      return [];
    }
  }
  parseAnswerToTicket(answer: YandexFormAnswer): {
    roomNumber: string;
    description: string;
    reporterEmail: string;
    yandexCreatedAt: Date;
    yandexAnswerId: string;
  } | null {
    try {
      if (!answer.data || !Array.isArray(answer.data) || answer.data.length === 0) {
        this.logger.warn(`Ответ ${answer.id} не содержит данных`);
        return null;
      }

      const values: any[] = [];
      for (const item of answer.data) {
        if (item.value !== undefined && item.value !== null) {
          values.push(item.value);
        }
      }
      
      this.logger.debug(`Ответ ${answer.id}, значения: ${JSON.stringify(values)}`);

      let roomNumber = '';
      let description = '';
      let reporterEmail = '';

      if (values.length >= 1) {
        roomNumber = String(values[0]).trim();
      }
      if (values.length >= 2) {
        description = String(values[1]).trim();
      }
      if (values.length >= 3) {
        reporterEmail = String(values[2]).trim();
      }

      if (!roomNumber) {
        this.logger.warn(`Ответ ${answer.id}: не найдена аудитория`);
        return null;
      }
      if (!description) {
        this.logger.warn(`Ответ ${answer.id}: не найдено описание проблемы`);
        return null;
      }
      if (!reporterEmail) {
        this.logger.warn(`Ответ ${answer.id}: не найден email`);
        return null;
      }

      this.logger.debug(`✅ Распаршен ответ ${answer.id}: аудитория ${roomNumber}, email ${reporterEmail}`);

      return {
        roomNumber,
        description,
        reporterEmail,
        yandexCreatedAt: new Date(answer.created),
        yandexAnswerId: String(answer.id),
      };
    } catch (error) {
      this.logger.error(`Ошибка парсинга ответа ${answer.id}: ${error.message}`);
      return null;
    }
  }

  async getRawAnswers(limit: number = 10): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/surveys/${this.surveyId}/answers?page_size=${limit}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'Authorization': `OAuth ${this.apiKey}`,
          },
        })
      );
      return response.data.answers || [];
    } catch (error) {
      this.logger.error(`Ошибка получения сырых ответов: ${error.message}`);
      return [];
    }
  }
}