import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

function extractMessage(exceptionResponse: unknown): string | string[] {
  if (typeof exceptionResponse === 'string') {
    return exceptionResponse;
  }
  if (
    exceptionResponse &&
    typeof exceptionResponse === 'object' &&
    'message' in exceptionResponse
  ) {
    return (exceptionResponse as { message: string | string[] }).message;
  }
  return 'Internal server error';
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttpException
      ? extractMessage(exception.getResponse())
      : 'Internal server error';

    if (!isHttpException) {
      this.logger.error(exception);
    }

    void response.status(status).send({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
