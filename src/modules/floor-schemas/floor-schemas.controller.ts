import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { FloorSchemasService } from './floor-schemas.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Схемы этажей')
@Controller('api/floor-schemas')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FloorSchemasController {
  constructor(private readonly schemasService: FloorSchemasService) {}

  @Post('upload/:floorId')
  @Roles(UserRole.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Загрузить схему этажа' })
  @ApiConsumes('multipart/form-data')
  async uploadSchema(
    @Param('floorId') floorId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user,
  ) {
    // Получаем размеры изображения (можно использовать sharp для реального получения)
    const width = 1024;
    const height = 768;
    
    return this.schemasService.uploadSchema(
      floorId,
      file,
      width,
      height,
      user.id,
    );
  }

  @Get('floor/:floorId')
  @ApiOperation({ summary: 'Получить схему этажа' })
  findByFloor(@Param('floorId') floorId: string) {
    return this.schemasService.findByFloor(floorId);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Удалить схему этажа' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.schemasService.deleteSchema(id, user.id);
  }
}