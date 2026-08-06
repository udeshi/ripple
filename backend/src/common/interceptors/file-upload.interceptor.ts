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

// Parses multipart uploads via @fastify/multipart and attaches the file to
// `request.uploadedImage`, read by the @UploadedImage() decorator.
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

    const file = await request.file({
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    });

    if (!file) {
      return next.handle();
    }

    if (file.file.truncated) {
      throw new PayloadTooLargeException(
        `File exceeds the ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB limit`,
      );
    }

    const buffer = await file.toBuffer();
    request.uploadedImage = {
      buffer,
      originalname: file.filename,
      mimetype: file.mimetype,
      size: buffer.length,
    };

    const body: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(file.fields ?? {})) {
      if (entry && !Array.isArray(entry) && 'value' in entry) {
        body[key] = entry.value;
      }
    }
    request.body = body;

    return next.handle();
  }
}
