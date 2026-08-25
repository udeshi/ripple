import { Module } from '@nestjs/common';
import { CommentsModule } from '../comments/comments.module';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [UsersModule, PostsModule, CommentsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
