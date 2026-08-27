import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T> | StreamableFile
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T> | StreamableFile> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof StreamableFile) {
          return data;
        }
        return {
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
