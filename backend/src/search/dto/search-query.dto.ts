import { IsString, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class SearchQueryDto extends PaginationQueryDto {
  @IsString()
  @MinLength(1)
  q!: string;
}
