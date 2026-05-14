import { PartialType } from '@nestjs/swagger';
import { CreateRoomMediaDto } from './create-room-media.dto';

export class UpdateRoomMediaDto extends PartialType(CreateRoomMediaDto) {}