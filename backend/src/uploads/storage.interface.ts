import { UploadedFileData } from '../common/types/uploaded-file.interface';

export interface UploadedFileResult {
  url: string;
  publicId: string;
}

export interface StorageService {
  uploadImage(
    file: UploadedFileData,
    folder: string,
  ): Promise<UploadedFileResult>;
  deleteImage(publicId: string): Promise<void>;
}

export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');
