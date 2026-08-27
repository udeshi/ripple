export interface MailService {
  sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>;
}

export const MAIL_SERVICE = Symbol('MAIL_SERVICE');
