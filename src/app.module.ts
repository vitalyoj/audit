import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { getDatabaseConfig } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Модули
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BuildingsModule } from './modules/buildings/buildings.module';
import { FloorsModule } from './modules/floors/floors.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { RoomFeaturesModule } from './modules/room-features/room-features.module';
import { RoomMediaModule } from './modules/room-media/room-media.module';
import { FloorSchemasModule } from './modules/floor-schemas/floor-schemas.module';
import { ClickableAreasModule } from './modules/clickable-areas/clickable-areas.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { LogsModule } from './modules/logs/logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN', '7d') },
      }),
    }),
    AuthModule,
    UsersModule,
    BuildingsModule,
    FloorsModule,
    RoomsModule,
    RoomFeaturesModule,
    RoomMediaModule,
    FloorSchemasModule,
    ClickableAreasModule,
    TicketsModule,
    LogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}