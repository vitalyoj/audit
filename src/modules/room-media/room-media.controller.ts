import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { RoomMediaService } from './room-media.service';
import { CreateRoomMediaDto } from './dto/create-room-media.dto';
import { UpdateRoomMediaDto } from './dto/update-room-media.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { MediaType } from './entities/room-media.entity';

@ApiTags('Медиафайлы аудиторий')
@Controller('api/room-media')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RoomMediaController {
  constructor(private readonly mediaService: RoomMediaService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Создать медиафайл' })
  create(@Body() createDto: CreateRoomMediaDto) {
    return this.mediaService.create(createDto);
  }

  @Get('room/:roomId')
  @ApiOperation({ summary: 'Получить все медиафайлы аудитории' })
  findByRoom(@Param('roomId') roomId: string) {
    return this.mediaService.findByRoom(roomId);
  }

  @Get('room/:roomId/panorama')
  @ApiOperation({ summary: 'Получить панораму аудитории' })
  findPanorama(@Param('roomId') roomId: string) {
    return this.mediaService.findPanoramaByRoom(roomId);
  }

  @Get('room/:roomId/photos')
  @ApiOperation({ summary: 'Получить фотографии аудитории' })
  findPhotos(@Param('roomId') roomId: string) {
    return this.mediaService.findPhotosByRoom(roomId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить медиафайл по ID' })
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Обновить медиафайл' })
  update(@Param('id') id: string, @Body() updateDto: UpdateRoomMediaDto) {
    return this.mediaService.update(id, updateDto);
  }

  @Patch(':id/sort')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Обновить порядок сортировки' })
  updateSortOrder(
    @Param('id') id: string,
    @Body('sortOrder') sortOrder: number,
  ) {
    return this.mediaService.updateSortOrder(id, sortOrder);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Удалить медиафайл' })
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }

   @Post('upload/photo/:roomId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Загрузить фото для аудитории' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/photos',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new Error('Только изображения'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadPhoto(
    @Param('roomId') roomId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const media = await this.mediaService.create({
      roomId,
      mediaType: MediaType.PHOTO,
      url: `/uploads/photos/${file.filename}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
    });
    return { message: 'Фото загружено', media };
  }

  @Post('upload/panorama/:roomId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Загрузить панораму 360° для аудитории' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/panoramas',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
          return callback(new Error('Для панорам разрешены только изображения'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 30 * 1024 * 1024 },
    }),
  )
  async uploadPanorama(
    @Param('roomId') roomId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const media = await this.mediaService.create({
      roomId,
      mediaType: MediaType.PANORAMA,
      url: `/uploads/panoramas/${file.filename}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
    });
    return { message: 'Панорама загружена', media };
  }
}