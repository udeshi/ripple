import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UploadedImage } from '../common/decorators/uploaded-image.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import type { AuthenticatedUser } from '../common/types/jwt-payload.interface';
import type { UploadedFileData } from '../common/types/uploaded-file.interface';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { FileUploadInterceptor } from '../common/interceptors/file-upload.interceptor';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  @UseInterceptors(FileUploadInterceptor)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePostDto,
    @UploadedImage() file?: UploadedFileData,
  ) {
    if (!file) {
      throw new BadRequestException('image is required');
    }
    return this.postsService.create(user.id, dto, file);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  findFeed(
    @Query() query: PaginationQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.postsService.findFeed(query, user?.id);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('user/:username')
  findByAuthor(
    @Param('username') username: string,
    @Query() query: PaginationQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.postsService.findByAuthor(username, query, user?.id);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.postsService.findOne(id, user?.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.postsService.remove(id, user.id);
  }
}
