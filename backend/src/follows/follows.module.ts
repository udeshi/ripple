import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { FollowListsController, FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';

@Module({
  imports: [NotificationsModule],
  controllers: [FollowsController, FollowListsController],
  providers: [FollowsService],
})
export class FollowsModule {}
