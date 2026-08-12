import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchService } from './search.service';

@Public()
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('users')
  users(@Query() query: SearchQueryDto) {
    return this.searchService.searchUsers(query);
  }

  @Get('posts')
  posts(@Query() query: SearchQueryDto) {
    return this.searchService.searchPosts(query);
  }
}
