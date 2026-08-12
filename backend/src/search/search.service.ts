import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/dto/pagination-query.dto';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchUsers(query: SearchQueryDto) {
    const where = {
      OR: [
        { username: { contains: query.q, mode: 'insensitive' as const } },
        { displayName: { contains: query.q, mode: 'insensitive' as const } },
      ],
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          followersCount: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return paginate(items, total, query.page, query.limit);
  }

  async searchPosts(query: SearchQueryDto) {
    const where = {
      caption: { contains: query.q, mode: 'insensitive' as const },
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return paginate(items, total, query.page, query.limit);
  }
}
