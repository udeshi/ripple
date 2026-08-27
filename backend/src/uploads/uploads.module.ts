import { Module } from '@nestjs/common';
import { CloudinaryStorageService } from './cloudinary-storage.service';
import { LocalStorageService } from './local-storage.service';
import { StorageFactory } from './storage.factory';
import { STORAGE_SERVICE } from './storage.interface';

@Module({
  providers: [
    LocalStorageService,
    CloudinaryStorageService,
    StorageFactory,
    {
      provide: STORAGE_SERVICE,
      useFactory: (factory: StorageFactory) => factory.create(),
      inject: [StorageFactory],
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class UploadsModule {}
