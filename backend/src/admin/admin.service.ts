import { Injectable } from '@nestjs/common';
import { Prisma, ReportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationQueryDto,
  paginate,
} from '../common/dto/pagination-query.dto';
import { CommentsService } from '../comments/comments.service';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';

const REPORTER_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

type ReportWithReporter = Prisma.ReportGetPayload<{
  include: { reporter: { select: typeof REPORTER_SELECT } };
}>;

interface PostTargetPreview {
  id: string;
  imageUrl: string;
  caption: string | null;
  author: { username: string };
}
interface CommentTargetPreview {
  id: string;
  content: string;
  postId: string;
  author: { username: string };
}
interface UserTargetPreview {
  id: string;
  username: string;
  avatarUrl: string | null;
}

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private postsService: PostsService,
    private commentsService: CommentsService,
  ) {}

  async listReports(query: PaginationQueryDto, status?: ReportStatus) {
    const where = status ? { status } : {};
    const [reports, total] = await this.prisma.$transaction([
      this.prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: { reporter: { select: REPORTER_SELECT } },
      }),
      this.prisma.report.count({ where }),
    ]);

    const items = await Promise.all(
      reports.map((report) => this.attachTarget(report)),
    );
    return paginate(items, total, query.page, query.limit);
  }

  resolveReport(id: string) {
    return this.prisma.report.update({
      where: { id },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    });
  }

  dismissReport(id: string) {
    return this.prisma.report.update({
      where: { id },
      data: { status: 'DISMISSED', resolvedAt: new Date() },
    });
  }

  banUser(username: string) {
    return this.usersService.setBanned(username, true);
  }

  unbanUser(username: string) {
    return this.usersService.setBanned(username, false);
  }

  removePost(id: string) {
    return this.postsService.adminRemove(id);
  }

  removeComment(id: string) {
    return this.commentsService.adminRemove(id);
  }

  private async attachTarget(report: ReportWithReporter) {
    if (report.targetType === 'POST') {
      const post = await this.prisma.post.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          imageUrl: true,
          caption: true,
          author: { select: { username: true } },
        },
      });
      return { ...report, target: post satisfies PostTargetPreview | null };
    }
    if (report.targetType === 'COMMENT') {
      const comment = await this.prisma.comment.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          content: true,
          postId: true,
          author: { select: { username: true } },
        },
      });
      return {
        ...report,
        target: comment satisfies CommentTargetPreview | null,
      };
    }
    const user = await this.prisma.user.findUnique({
      where: { id: report.targetId },
      select: { id: true, username: true, avatarUrl: true },
    });
    return { ...report, target: user satisfies UserTargetPreview | null };
  }
}
