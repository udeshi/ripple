import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { AppConfig } from '../config/configuration';
import { UploadedFileData } from '../common/types/uploaded-file.interface';
import { StorageService, UploadedFileResult } from './storage.interface';

@Injectable()
export class LocalStorageService implements StorageService {
  constructor(private configService: ConfigService<AppConfig, true>) {}

  async uploadImage(
    file: UploadedFileData,
    folder: string,
  ): Promise<UploadedFileResult> {
    const extension = this.getExtension(file.originalname, file.mimetype);
    const filename = `${randomUUID()}${extension}`;
    const relativePath = join(folder, filename);
    const targetDir = resolve(process.cwd(), 'uploads', folder);

    await mkdir(targetDir, { recursive: true });
    await writeFile(resolve(targetDir, filename), file.buffer);

    const apiPrefix = this.configService.get('apiPrefix', { infer: true });
    const baseUrl =
      process.env.APP_URL ??
      `http://localhost:${this.configService.get('port', { infer: true })}`;
    const url = `${baseUrl.replace(/\/$/, '')}/${apiPrefix}/uploads/${relativePath}`;

    return { url, publicId: relativePath };
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) {
      return;
    }

    const normalized = publicId.startsWith('http')
      ? new URL(publicId).pathname.replace(/^\/uploads\//, '')
      : publicId.replace(/^\/+/, '');
    const filePath = resolve(process.cwd(), 'uploads', normalized);

    try {
      await unlink(filePath);
    } catch {
      // no-op
    }
  }

  private getExtension(originalname: string, mimetype: string): string {
    const extensionFromName = originalname.includes('.')
      ? originalname.slice(originalname.lastIndexOf('.')).toLowerCase()
      : '';

    if (extensionFromName) {
      return extensionFromName;
    }

    const mimeMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };

    return mimeMap[mimetype] ?? '';
  }
}
