import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LikesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async toggleLike(postId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({ where: { id: postId } });
      if (!post) {
        throw new NotFoundException('Post not found');
      }

      const existing = await tx.like.findUnique({
        where: { postId_userId: { postId, userId } },
      });

      if (existing) {
        await tx.like.delete({ where: { id: existing.id } });
        await tx.post.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
        });
        return { liked: false };
      }

      await tx.like.create({ data: { postId, userId } });
      await tx.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      });
      await this.notificationsService.notify(tx, {
        recipientId: post.authorId,
        actorId: userId,
        type: 'LIKE',
        postId,
      });
      return { liked: true };
    });
  }
}
