import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import type { FastifyReply } from 'fastify';
import { Public } from './common/decorators/public.decorator';
import { AppService } from './app.service';

const ALLOWED_UPLOAD_FOLDERS = new Set(['avatars', 'posts']);
const SAFE_FILENAME_PATTERN = /^[0-9a-f-]{36}\.[a-zA-Z0-9]{1,5}$/;

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Public()
  @Get('uploads/:folder/:filename')
  async serveUpload(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    if (
      !ALLOWED_UPLOAD_FOLDERS.has(folder) ||
      !SAFE_FILENAME_PATTERN.test(filename)
    ) {
      throw new NotFoundException('File not found');
    }

    const uploadsRoot = resolve(process.cwd(), 'uploads');
    const filePath = join(uploadsRoot, folder, filename);

    if (!resolve(filePath).startsWith(uploadsRoot + sep)) {
      throw new NotFoundException('File not found');
    }

    try {
      await access(filePath);
      const stream = createReadStream(filePath);
      const extension = filename.includes('.')
        ? (filename.split('.').pop()?.toLowerCase() ?? '')
        : '';
      const mimeTypeMap: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        gif: 'image/gif',
      };

      res.type(mimeTypeMap[extension] ?? 'application/octet-stream');
      return new StreamableFile(stream);
    } catch {
      throw new NotFoundException('File not found');
    }
  }
}
