import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  PayloadTooLargeException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { UploadedFileData } from '../types/uploaded-file.interface';

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

type RequestWithUpload = FastifyRequest & {
  uploadedImage?: UploadedFileData;
};

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<RequestWithUpload>();

    if (!request.isMultipart()) {
      return next.handle();
    }

    const body: Record<string, unknown> = {};
    let uploadedFile: UploadedFileData | undefined;

    for await (const part of request.parts({
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    })) {
      if (part.type === 'file') {
        if (part.file.truncated) {
          throw new PayloadTooLargeException(
            `File exceeds ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`,
          );
        }
        const buffer = await part.toBuffer();
        uploadedFile = {
          buffer,
          originalname: part.filename,
          mimetype: part.mimetype,
          size: buffer.length,
        };
      } else {
        body[part.fieldname] = part.value;
      }
    }

    if (uploadedFile) request.uploadedImage = uploadedFile;
    request.body = body;

    return next.handle();
  }
}
