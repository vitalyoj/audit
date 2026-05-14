import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomFeature } from './entities/room-feature.entity';
import { RoomFeaturesService } from './room-features.service';
import { RoomFeaturesController } from './room-features.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RoomFeature])],
  providers: [RoomFeaturesService],
  controllers: [RoomFeaturesController],
  exports: [RoomFeaturesService],
})
export class RoomFeaturesModule {}