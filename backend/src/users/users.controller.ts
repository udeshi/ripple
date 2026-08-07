import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UploadedImage } from '../common/decorators/uploaded-image.decorator';
import type { AuthenticatedUser } from '../common/types/jwt-payload.interface';
import type { UploadedFileData } from '../common/types/uploaded-file.interface';
import { FileUploadInterceptor } from '../common/interceptors/file-upload.interceptor';
import { STORAGE_SERVICE } from '../uploads/storage.interface';
import type { StorageService } from '../uploads/storage.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    @Inject(STORAGE_SERVICE) private storageService: StorageService,
  ) {}

  @Public()
  @Get(':username')
  getProfile(@Param('username') username: string) {
    return this.usersService.getPublicProfile(username);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(FileUploadInterceptor)
  async uploadAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedImage() file?: UploadedFileData,
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
    }
    const { url } = await this.storageService.uploadImage(file, 'avatars');
    return this.usersService.updateAvatar(user.id, url);
  }
}
