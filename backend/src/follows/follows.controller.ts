import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import type { AuthenticatedUser } from '../common/types/jwt-payload.interface';
import { FollowsService } from './follows.service';

@Controller('users/:username/follow')
export class FollowsController {
  constructor(private followsService: FollowsService) {}

  @Post()
  follow(
    @Param('username') username: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.followsService.follow(user.id, username);
  }

  @Delete()
  unfollow(
    @Param('username') username: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.followsService.unfollow(user.id, username);
  }
}

@Controller('users/:username')
export class FollowListsController {
  constructor(private followsService: FollowsService) {}

  @Public()
  @Get('followers')
  followers(
    @Param('username') username: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.followsService.findFollowers(username, query);
  }

  @Public()
  @Get('following')
  following(
    @Param('username') username: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.followsService.findFollowing(username, query);
  }
}
