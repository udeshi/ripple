import { Module } from '@nestjs/common';
import { FollowListsController, FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';

@Module({
  controllers: [FollowsController, FollowListsController],
  providers: [FollowsService],
})
export class FollowsModule {}
