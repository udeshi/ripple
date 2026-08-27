import {
  ForbiddenException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationQueryDto,
  paginate,
} from '../common/dto/pagination-query.dto';
import { STORAGE_SERVICE } from '../uploads/storage.interface';
import type { StorageService } from '../uploads/storage.interface';
import type { UploadedFileData } from '../common/types/uploaded-file.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const AUTHOR_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

type PostWithAuthor = Prisma.PostGetPayload<{
  include: { author: { select: typeof AUTHOR_SELECT } };
}>;

type PostWithAuthorAndLikes = PostWithAuthor & { likes: { id: string }[] };

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private storageService: StorageService,
  ) {}

  async create(authorId: string, dto: CreatePostDto, file: UploadedFileData) {
    const { url, publicId } = await this.storageService.uploadImage(
      file,
      'posts',
    );

    const [post] = await this.prisma.$transaction([
      this.prisma.post.create({
        data: {
          authorId,
          caption: dto.caption,
          imageUrl: url,
          imagePublicId: publicId,
        },
        include: { author: { select: AUTHOR_SELECT } },
      }),
      this.prisma.user.update({
        where: { id: authorId },
        data: { postsCount: { increment: 1 } },
      }),
    ]);

    return this.mapPost(post, authorId);
  }

  async findFeed(query: PaginationQueryDto, currentUserId?: string) {
    const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: {
          author: { select: AUTHOR_SELECT },
          likes: currentUserId
            ? { where: { userId: currentUserId }, select: { id: true } }
            : false,
        },
      }),
      this.prisma.post.count(),
    ]);

    const items = posts.map((post) => this.mapPost(post, currentUserId));
    return paginate(items, total, query.page, query.limit);
  }

  async findByAuthor(
    username: string,
    query: PaginationQueryDto,
    currentUserId?: string,
  ) {
    const author = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!author) {
      throw new NotFoundException('User not found');
    }

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where: { authorId: author.id },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: {
          author: { select: AUTHOR_SELECT },
          likes: currentUserId
            ? { where: { userId: currentUserId }, select: { id: true } }
            : false,
        },
      }),
      this.prisma.post.count({ where: { authorId: author.id } }),
    ]);

    const items = posts.map((post) => this.mapPost(post, currentUserId));
    return paginate(items, total, query.page, query.limit);
  }

  async findOne(id: string, currentUserId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: AUTHOR_SELECT },
        likes: currentUserId
          ? { where: { userId: currentUserId }, select: { id: true } }
          : false,
      },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.mapPost(post, currentUserId);
  }

  async update(
    id: string,
    authorId: string,
    dto: UpdatePostDto,
    file?: UploadedFileData,
  ) {
    const currentPost = await this.assertOwner(id, authorId);
    const uploaded = file
      ? await this.storageService.uploadImage(file, 'posts')
      : undefined;
    const post = await this.prisma.post.update({
      where: { id },
      data: {
        caption: dto.caption,
        ...(uploaded && {
          imageUrl: uploaded.url,
          imagePublicId: uploaded.publicId,
        }),
      },
      include: { author: { select: AUTHOR_SELECT } },
    });
    if (uploaded && currentPost.imagePublicId) {
      await this.storageService.deleteImage(currentPost.imagePublicId);
    }
    return this.mapPost(post, authorId);
  }

  async remove(id: string, authorId: string) {
    const post = await this.assertOwner(id, authorId);
    return this.deletePost(post);
  }

  async adminRemove(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.deletePost(post);
  }

  private async deletePost(post: {
    id: string;
    authorId: string;
    imagePublicId: string | null;
  }) {
    await this.prisma.$transaction([
      this.prisma.post.delete({ where: { id: post.id } }),
      this.prisma.user.update({
        where: { id: post.authorId },
        data: { postsCount: { decrement: 1 } },
      }),
    ]);

    if (post.imagePublicId) {
      await this.storageService.deleteImage(post.imagePublicId);
    }
    return { success: true };
  }

  private async assertOwner(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.authorId !== userId) {
      throw new ForbiddenException('You do not own this post');
    }
    return post;
  }

  private mapPost(
    post: PostWithAuthor | PostWithAuthorAndLikes,
    currentUserId?: string,
  ) {
    if ('likes' in post) {
      const { likes, ...rest } = post;
      return { ...rest, isLikedByMe: currentUserId ? likes.length > 0 : false };
    }
    return { ...post, isLikedByMe: false };
  }
}
