import { PartialType } from '@nestjs/swagger';
import { CreateClickableAreaDto } from './create-clickable-area.dto';

export class UpdateClickableAreaDto extends PartialType(CreateClickableAreaDto) {}