import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FloorSchema } from './entities/floor-schema.entity';
import { FloorSchemasService } from './floor-schemas.service';
import { FloorSchemasController } from './floor-schemas.controller';
import { FloorsModule } from '../floors/floors.module';
import { ClickableAreasModule } from '../clickable-areas/clickable-areas.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FloorSchema]),
    FloorsModule,
    ClickableAreasModule,
    LogsModule,
  ],
  providers: [FloorSchemasService],
  controllers: [FloorSchemasController],
  exports: [FloorSchemasService],
})
export class FloorSchemasModule {}