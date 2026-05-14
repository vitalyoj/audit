import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClickableArea } from './entities/clickable-area.entity';
import { ClickableAreasService } from './clickable-areas.service';
import { ClickableAreasController } from './clickable-areas.controller';
import { FloorSchemasModule } from '../floor-schemas/floor-schemas.module';
import { RoomsModule } from '../rooms/rooms.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClickableArea]),
    forwardRef(() => FloorSchemasModule), // используем forwardRef
    forwardRef(() => RoomsModule), // используем forwardRef
    LogsModule,
  ],
  providers: [ClickableAreasService],
  controllers: [ClickableAreasController],
  exports: [ClickableAreasService],
})
export class ClickableAreasModule {}