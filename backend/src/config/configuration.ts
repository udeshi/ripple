export interface AppConfig {
  port: number;
  apiPrefix: string;
  webOrigin: string;
  storage: {
    provider: 'local' | 'cloudinary';
  };
  database: {
    url: string;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  stream: {
    apiKey: string;
    apiSecret: string;
  };
  mail: {
    provider: 'console' | 'smtp';
    from: string;
    smtp: {
      host: string;
      port: number;
      user: string;
      pass: string;
      secure: boolean;
    };
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
  storage: {
    provider:
      (process.env.STORAGE_PROVIDER as 'local' | 'cloudinary') ?? 'local',
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
  stream: {
    apiKey: process.env.STREAM_API_KEY ?? '',
    apiSecret: process.env.STREAM_API_SECRET ?? '',
  },
  mail: {
    provider: (process.env.MAIL_PROVIDER as 'console' | 'smtp') ?? 'console',
    from: process.env.MAIL_FROM ?? 'Ripple <no-reply@ripple.app>',
    smtp: {
      host: process.env.SMTP_HOST ?? '',
      port: parseInt(process.env.SMTP_PORT ?? '587', 10),
      user: process.env.SMTP_USER ?? '',
      pass: process.env.SMTP_PASS ?? '',
      secure: process.env.SMTP_SECURE === 'true',
    },
  },
});
