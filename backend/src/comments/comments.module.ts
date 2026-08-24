import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  CommentsAdminController,
  CommentsController,
} from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [NotificationsModule],
  controllers: [CommentsController, CommentsAdminController],
  providers: [CommentsService],
})
export class CommentsModule {}
