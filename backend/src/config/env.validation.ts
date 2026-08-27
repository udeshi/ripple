import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsNumberString()
  PORT?: string;

  @IsOptional()
  @IsString()
  API_PREFIX?: string;

  @IsOptional()
  @IsString()
  WEB_ORIGIN?: string;

  @IsNotEmpty()
  @IsString()
  DATABASE_URL!: string;

  @IsNotEmpty()
  @IsString()
  JWT_ACCESS_SECRET!: string;

  @IsNotEmpty()
  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_ACCESS_EXPIRES_IN?: string;

  @IsOptional()
  @IsString()
  JWT_REFRESH_EXPIRES_IN?: string;

  @IsOptional()
  @IsIn(['local', 'cloudinary'])
  STORAGE_PROVIDER?: 'local' | 'cloudinary';

  @IsOptional()
  @IsIn(['console', 'smtp'])
  MAIL_PROVIDER?: 'console' | 'smtp';

  @IsOptional()
  @IsString()
  MAIL_FROM?: string;

  @IsOptional()
  @IsString()
  SMTP_HOST?: string;

  @IsOptional()
  @IsNumberString()
  SMTP_PORT?: string;

  @IsOptional()
  @IsString()
  SMTP_USER?: string;

  @IsOptional()
  @IsString()
  SMTP_PASS?: string;

  @IsOptional()
  @IsString()
  STREAM_API_KEY?: string;

  @IsOptional()
  @IsString()
  STREAM_API_SECRET?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n${errors.toString()}`);
  }
  return validatedConfig;
}
