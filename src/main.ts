import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Глобальная валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет поля, не указанные в DTO
      forbidNonWhitelisted: true, // выбрасывает ошибку при лишних полях
      transform: true, // преобразует типы
    }),
  );

  // CORS для фронтенда
  app.enableCors({
    origin: ['https://frontend-qyhl.onrender.com'], // адреса фронтенда
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Статические файлы (загруженные медиа)
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('Room Management API')
    .setDescription('API для управления аудиториями с 360° панорамами')
    .setVersion('1.0')
    .addTag('Аудитории', 'Управление аудиториями')
    .addTag('Загрузка файлов', 'Загрузка фотографий и панорам')
    .addTag('Бронирование', 'Управление бронированием (версия 2.0)')
    .addBearerAuth() // для JWT токенов
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`\n🚀 Сервер запущен на порту ${port}`);
  console.log(`📚 Документация API: http://localhost:${port}/api/docs`);
  console.log(`📁 Загруженные файлы: http://localhost:${port}/uploads\n`);
}
bootstrap();