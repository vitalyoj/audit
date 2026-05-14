import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomMedia } from './entities/room-media.entity';
import { RoomMediaService } from './room-media.service';
import { RoomMediaController } from './room-media.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RoomMedia])],
  providers: [RoomMediaService],
  controllers: [RoomMediaController],
  exports: [RoomMediaService],
})
export class RoomMediaModule {}