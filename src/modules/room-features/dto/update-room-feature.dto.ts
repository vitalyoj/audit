import { PartialType } from '@nestjs/swagger';
import { CreateRoomFeatureDto } from './create-room-feature.dto';

export class UpdateRoomFeatureDto extends PartialType(CreateRoomFeatureDto) {}