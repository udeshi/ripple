import { Module } from '@nestjs/common';
import { ConsoleMailService } from './console-mail.service';
import { MailFactory } from './mail.factory';
import { MAIL_SERVICE } from './mail.interface';
import { SmtpMailService } from './smtp-mail.service';

@Module({
  providers: [
    ConsoleMailService,
    SmtpMailService,
    MailFactory,
    {
      provide: MAIL_SERVICE,
      useFactory: (factory: MailFactory) => factory.create(),
      inject: [MailFactory],
    },
  ],
  exports: [MAIL_SERVICE],
})
export class MailModule {}
