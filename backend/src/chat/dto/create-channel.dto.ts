import { IsString, MinLength } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @MinLength(1)
  memberId!: string;
}
