import { maskEmail } from '@/common/utils/mask.util';
import { OtpService } from '@/otp/otp.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { UserCreatedEvent } from '@/user/events/user-created.event';
import { VerificationRequestedEvent } from '@/user/events/verification-requested.event';
import { PasswordResetRequestedEvent } from '@/user/events/password-reset-requested.event';

const MAIL_SUBJECTS = {
  VERIFY_EMAIL: 'Verify your email address',
  PASSWORD_RESET: 'Reset your password',
} as const;

@Injectable()
export class MailService {
  private readonly serverEmail: string;
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject('RESEND_CLIENT') private readonly resend: Resend,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
  ) {
    this.serverEmail = this.configService.getOrThrow<string>('RESEND_EMAIL');
  }

  async sendVerificationMail(
    payload: VerificationRequestedEvent,
  ): Promise<void> {
    const { email } = payload.user;
    const otp = await this.otpService.generateAndStore(email, 'verify-email');

    const { error } = await this.resend.emails.send({
      to: email,
      from: this.serverEmail,
      subject: MAIL_SUBJECTS.VERIFY_EMAIL,
      html: `<p>Your verification code is: <strong>${otp}</strong></p>`,
    });

    if (error) {
      this.logger.error(
        { email: maskEmail(email), reason: error.message },
        'Send verification email failed',
      );
      throw new Error('Failed to send verification email');
    }
  }

  async sendResetPasswordMail(
    payload: PasswordResetRequestedEvent,
  ): Promise<void> {
    const { email } = payload.user;
    const otp = await this.otpService.generateAndStore(email, 'reset-password');

    const { error } = await this.resend.emails.send({
      to: email,
      from: this.serverEmail,
      subject: MAIL_SUBJECTS.PASSWORD_RESET,
      html: `<p>Your password reset code is: <strong>${otp}</strong></p>`,
    });

    if (error) {
      this.logger.error(
        { email: maskEmail(email), reason: error.message },
        'Send password reset email failed',
      );
      throw new Error('Failed to send password reset  email');
    }
  }
}
