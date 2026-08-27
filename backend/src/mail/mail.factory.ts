import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration';
import { ConsoleMailService } from './console-mail.service';
import { MailService } from './mail.interface';
import { SmtpMailService } from './smtp-mail.service';

@Injectable()
export class MailFactory {
  constructor(
    private configService: ConfigService<AppConfig, true>,
    private consoleMailService: ConsoleMailService,
    private smtpMailService: SmtpMailService,
  ) {}

  create(): MailService {
    const provider = this.configService.get('mail.provider', { infer: true });

    if (provider === 'smtp') {
      return this.smtpMailService;
    }

    return this.consoleMailService;
  }
}
