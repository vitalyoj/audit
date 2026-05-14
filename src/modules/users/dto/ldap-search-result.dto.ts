import { ApiProperty } from '@nestjs/swagger';

export class LdapSearchResultDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;
}