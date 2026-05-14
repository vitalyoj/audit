import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Building } from './entities/building.entity';
import { BuildingsService } from './buildings.service';
import { BuildingsController } from './buildings.controller';
import { FloorsModule } from '../floors/floors.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Building]),
    FloorsModule, // FloorRepository будет доступен через FloorsModule
    LogsModule,
  ],
  providers: [BuildingsService],
  controllers: [BuildingsController],
  exports: [BuildingsService],
})
export class BuildingsModule {}