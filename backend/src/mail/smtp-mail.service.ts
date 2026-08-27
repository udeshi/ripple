import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { AppConfig } from '../config/configuration';
import { MailService } from './mail.interface';

@Injectable()
export class SmtpMailService implements MailService {
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(private configService: ConfigService<AppConfig, true>) {
    const smtp = this.configService.get('mail.smtp', { infer: true });
    this.from = this.configService.get('mail.from', { infer: true });
    this.transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
    });
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Reset your Ripple password',
      text: `Reset your password: ${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
      html: `<p>Someone requested a password reset for this account.</p><p><a href="${resetUrl}">Reset your password</a></p><p>If you didn't request this, you can ignore this email.</p>`,
    });
  }
}
