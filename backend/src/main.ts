import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const configService = app.get(ConfigService<AppConfig, true>);
  const webOrigin = configService.get('webOrigin', { infer: true });

  await app.register(fastifyCors, {
    origin: webOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  await app.register(fastifyMultipart);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix(configService.get('apiPrefix', { infer: true }));

  const port = configService.get('port', { infer: true });
  await app.listen(port, '0.0.0.0');
  console.log(`API running on http://localhost:${port}/api`);
}

void bootstrap();
