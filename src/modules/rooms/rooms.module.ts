import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Room } from './entities/room.entity';
import { RoomFeature } from './entities/room-feature.entity';
import { RoomMedia } from './entities/room-media.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Room, 
      RoomFeature, 
      RoomMedia
    ]), // Регистрируем репозитории
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService, TypeOrmModule], // Экспортируем на случай использования в других модулях
})
export class RoomsModule {}