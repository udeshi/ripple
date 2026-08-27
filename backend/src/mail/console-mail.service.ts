import { Injectable, Logger } from '@nestjs/common';
import { MailService } from './mail.interface';

@Injectable()
export class ConsoleMailService implements MailService {
  private readonly logger = new Logger(ConsoleMailService.name);

  sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    this.logger.log(`Password reset link for ${to}: ${resetUrl}`);
    return Promise.resolve();
  }
}
