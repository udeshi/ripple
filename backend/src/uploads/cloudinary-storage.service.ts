import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { AppConfig } from '../config/configuration';
import { UploadedFileData } from '../common/types/uploaded-file.interface';
import { StorageService, UploadedFileResult } from './storage.interface';

@Injectable()
export class CloudinaryStorageService implements StorageService {
  constructor(private configService: ConfigService<AppConfig, true>) {
    cloudinary.config({
      cloud_name: this.configService.get('cloudinary.cloudName', {
        infer: true,
      }),
      api_key: this.configService.get('cloudinary.apiKey', { infer: true }),
      api_secret: this.configService.get('cloudinary.apiSecret', {
        infer: true,
      }),
    });
  }

  uploadImage(
    file: UploadedFileData,
    folder: string,
  ): Promise<UploadedFileResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error || !result) {
            return reject(
              error instanceof Error
                ? error
                : new Error('Cloudinary upload failed'),
            );
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
