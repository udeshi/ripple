import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration';
import { CloudinaryStorageService } from './cloudinary-storage.service';
import { LocalStorageService } from './local-storage.service';
import { StorageService } from './storage.interface';

@Injectable()
export class StorageFactory {
  constructor(
    private configService: ConfigService<AppConfig, true>,
    private localStorageService: LocalStorageService,
    private cloudinaryStorageService: CloudinaryStorageService,
  ) {}

  create(): StorageService {
    const provider = this.configService.get('storage.provider', {
      infer: true,
    });

    if (provider === 'cloudinary') {
      return this.cloudinaryStorageService;
    }

    return this.localStorageService;
  }
}
