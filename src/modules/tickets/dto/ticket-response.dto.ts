import { ApiProperty } from '@nestjs/swagger';
import { Ticket, TicketStatus } from '../entities/ticket.entity';

export class TicketResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  reporterEmail: string;

  @ApiProperty({ enum: TicketStatus })
  status: TicketStatus;

  @ApiProperty()
  roomId: string;

  @ApiProperty()
  roomNumber: string;

  @ApiProperty({ nullable: true })
  assignedToId: string | null;

  @ApiProperty({ nullable: true })
  assignedToName: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(ticket: Ticket) {
    this.id = ticket.id;
    this.description = ticket.description;
    this.reporterEmail = ticket.reporterEmail;
    this.status = ticket.status;
    this.roomId = ticket.roomId;
    this.roomNumber = ticket.room?.number;
    this.assignedToId = ticket.assignedToId || null;
    this.assignedToName = ticket.assignedTo?.fullName || null;
    this.createdAt = ticket.createdAt;
    this.updatedAt = ticket.updatedAt;
  }
}
