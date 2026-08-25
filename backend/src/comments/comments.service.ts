import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationQueryDto,
  paginate,
} from '../common/dto/pagination-query.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCommentDto } from './dto/create-comment.dto';

const AUTHOR_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(postId: string, authorId: string, dto: CreateCommentDto) {
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({ where: { id: postId } });
      if (!post) {
        throw new NotFoundException('Post not found');
      }

      const comment = await tx.comment.create({
        data: { postId, authorId, content: dto.content },
        include: { author: { select: AUTHOR_SELECT } },
      });

      await tx.post.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } },
      });
      await this.notificationsService.notify(tx, {
        recipientId: post.authorId,
        actorId: authorId,
        type: 'COMMENT',
        postId,
      });

      return comment;
    });
  }

  async findByPost(postId: string, query: PaginationQueryDto) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where: { postId },
        orderBy: { createdAt: 'asc' },
        skip: query.skip,
        take: query.limit,
        include: { author: { select: AUTHOR_SELECT } },
      }),
      this.prisma.comment.count({ where: { postId } }),
    ]);
    return paginate(items, total, query.page, query.limit);
  }

  async remove(commentId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.findUnique({
        where: { id: commentId },
      });
      if (!comment) {
        throw new NotFoundException('Comment not found');
      }
      if (comment.authorId !== userId) {
        throw new ForbiddenException('You do not own this comment');
      }
      return this.deleteComment(tx, comment);
    });
  }

  async adminRemove(commentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.findUnique({
        where: { id: commentId },
      });
      if (!comment) {
        throw new NotFoundException('Comment not found');
      }
      return this.deleteComment(tx, comment);
    });
  }

  private async deleteComment(
    tx: Prisma.TransactionClient,
    comment: { id: string; postId: string },
  ) {
    await tx.comment.delete({ where: { id: comment.id } });
    await tx.post.update({
      where: { id: comment.postId },
      data: { commentsCount: { decrement: 1 } },
    });
    return { success: true };
  }
}
