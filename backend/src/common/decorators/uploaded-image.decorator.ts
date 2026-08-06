import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UploadedFileData } from '../types/uploaded-file.interface';

interface RequestWithUploadedImage {
  uploadedImage?: UploadedFileData;
}

export const UploadedImage = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUploadedImage>();
    return request.uploadedImage;
  },
);
