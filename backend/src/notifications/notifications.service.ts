import { Injectable } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationQueryDto,
  paginate,
} from '../common/dto/pagination-query.dto';

const ACTOR_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async notify(
    tx: Prisma.TransactionClient,
    params: {
      recipientId: string;
      actorId: string;
      type: NotificationType;
      postId?: string;
    },
  ) {
    if (params.recipientId === params.actorId) return;
    await tx.notification.create({ data: params });
  }

  async list(userId: string, query: PaginationQueryDto) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { recipientId: userId },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: { actor: { select: ACTOR_SELECT } },
      }),
      this.prisma.notification.count({ where: { recipientId: userId } }),
    ]);
    return paginate(items, total, query.page, query.limit);
  }

  unreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { recipientId: userId, read: false },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { recipientId: userId, read: false },
      data: { read: true },
    });
    return { success: true };
  }

  async markRead(userId: string, notificationId: string) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, recipientId: userId },
      data: { read: true },
    });
    return { success: true };
  }
}
