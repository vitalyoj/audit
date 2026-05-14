import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { Ticket } from './entities/ticket.entity';
import { LastChecked } from './entities/last-checked.entity';
import { Room } from '../rooms/entities/room.entity';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TicketsPollerService } from './tickets-poller.service';
import { YandexFormService } from './yandex-form.service';
import { LastCheckedService } from './last-checked.service';
import { RoomsModule } from '../rooms/rooms.module';
import { UsersModule } from '../users/users.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, LastChecked, Room]),
    HttpModule,
    ScheduleModule.forRoot(),
    RoomsModule,
    UsersModule,
    LogsModule,
  ],
  providers: [
    TicketsService,
    TicketsPollerService,
    YandexFormService,
    LastCheckedService,
  ],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}