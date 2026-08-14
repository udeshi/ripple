import { IsOptional, IsString } from 'class-validator';

export class ListFlagsQueryDto {
  @IsOptional()
  @IsString()
  deviceId?: string;
}
