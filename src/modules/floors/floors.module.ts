import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Floor } from './entities/floor.entity';
import { FloorsService } from './floors.service';
import { FloorsController } from './floors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Floor])],
  providers: [FloorsService],
  controllers: [FloorsController],
  exports: [FloorsService, TypeOrmModule], // Экспортируем TypeOrmModule чтобы другие модули могли использовать FloorRepository
})
export class FloorsModule {}