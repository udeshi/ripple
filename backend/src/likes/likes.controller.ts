import { Controller, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/jwt-payload.interface';
import { LikesService } from './likes.service';

@Controller('posts/:postId/like')
export class LikesController {
  constructor(private likesService: LikesService) {}

  @Post()
  toggle(
    @Param('postId') postId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.likesService.toggleLike(postId, user.id);
  }
}
