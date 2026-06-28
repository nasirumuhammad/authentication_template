import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { MailProcessor } from './processors/mail.processor';
import { BullModule } from '@nestjs/bullmq';
import { MAIL_QUEUE } from '@/common/constants/mail.constant';
import { OtpModule } from '@/otp/otp.module';
import { VericationRequestedListener } from './listeners/verification-requested.listener';
import { PasswordResetRequestedEvent } from '@/user/events/password-reset-requested.event';
import { PasswordResetRequestedListener } from './listeners/password-reset-requested.listener';
@Module({
  imports: [BullModule.registerQueue({ name: MAIL_QUEUE }), OtpModule],
  providers: [
    {
      provide: 'RESEND_CLIENT',
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        const apiKey = configService.getOrThrow('RESEND_API_KEY');
        return new Resend(apiKey);
      },
    },
    MailService,
    VericationRequestedListener,
    PasswordResetRequestedListener,
    MailProcessor,
  ],
  exports: [MailService],
})
export class MailModule {}
