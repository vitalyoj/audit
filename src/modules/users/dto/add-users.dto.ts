import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LdapSearchResultDto } from './ldap-search-result.dto';

export class AddUsersDto {
  @ApiProperty({ type: [LdapSearchResultDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LdapSearchResultDto)
  users: LdapSearchResultDto[];
}