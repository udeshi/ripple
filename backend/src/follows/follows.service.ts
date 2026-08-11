import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationQueryDto,
  paginate,
} from '../common/dto/pagination-query.dto';

const USER_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

// Follow/unfollow touch three rows (the Follow edge plus a counter on each
// user), so both run inside a transaction to keep counts consistent.
@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) {}

  async follow(followerId: string, followingUsername: string) {
    const target = await this.prisma.user.findUnique({
      where: { username: followingUsername },
      select: { id: true },
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }
    if (target.id === followerId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId: target.id,
          },
        },
      });
      if (existing) {
        throw new ConflictException('Already following this user');
      }

      await tx.follow.create({
        data: { followerId, followingId: target.id },
      });
      await tx.user.update({
        where: { id: followerId },
        data: { followingCount: { increment: 1 } },
      });
      await tx.user.update({
        where: { id: target.id },
        data: { followersCount: { increment: 1 } },
      });

      return { following: true };
    });
  }

  async unfollow(followerId: string, followingUsername: string) {
    const target = await this.prisma.user.findUnique({
      where: { username: followingUsername },
      select: { id: true },
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId: target.id,
          },
        },
      });
      if (!existing) {
        return { following: false };
      }

      await tx.follow.delete({ where: { id: existing.id } });
      await tx.user.update({
        where: { id: followerId },
        data: { followingCount: { decrement: 1 } },
      });
      await tx.user.update({
        where: { id: target.id },
        data: { followersCount: { decrement: 1 } },
      });

      return { following: false };
    });
  }

  async findFollowers(username: string, query: PaginationQueryDto) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.follow.findMany({
        where: { followingId: user.id },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: { follower: { select: USER_SELECT } },
      }),
      this.prisma.follow.count({ where: { followingId: user.id } }),
    ]);

    return paginate(
      rows.map((row) => row.follower),
      total,
      query.page,
      query.limit,
    );
  }

  async findFollowing(username: string, query: PaginationQueryDto) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.follow.findMany({
        where: { followerId: user.id },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: { followingUser: { select: USER_SELECT } },
      }),
      this.prisma.follow.count({ where: { followerId: user.id } }),
    ]);

    return paginate(
      rows.map((row) => row.followingUser),
      total,
      query.page,
      query.limit,
    );
  }
}
