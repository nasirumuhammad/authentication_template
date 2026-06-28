import { MAIL_JOBS, MAIL_QUEUE } from '@/common/constants/mail.constant';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../mail.service';
import { UserCreatedEvent } from '@/user/events/user-created.event';
import { Logger } from '@nestjs/common';
import { PasswordResetRequestedEvent } from '@/user/events/password-reset-requested.event';
@Processor(MAIL_QUEUE)
export class MailProcessor extends WorkerHost {
  private logger = new Logger(MailProcessor.name);
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case MAIL_JOBS.SEND_MAIL_VERIFICATION: {
        await this.handleSendVerificationEmail(job as Job<UserCreatedEvent>);
        break;
      }
      case MAIL_JOBS.SEND_PASSWORD_RESET: {
        await this.handlePasswordResetMail(job as Job<UserCreatedEvent>);
        break;
      }
      default: {
        this.logger.warn(
          { jobName: job.name },
          'Received unknown mail job type',
        );
        break;
      }
    }
  }

  private async handleSendVerificationEmail(
    job: Job<UserCreatedEvent>,
  ): Promise<void> {
    const payload = job.data;
    try {
      await this.mailService.sendVerificationMail(payload);
    } catch (error) {
      this.logger.error(
        {
          jobId: job.id,
          attemptsMade: job.attemptsMade,
        },
        'Verification email job failed',
      );
      throw error;
    }
  }

  private async handlePasswordResetMail(
    job: Job<PasswordResetRequestedEvent>,
  ): Promise<void> {
    const payload = job.data;
    try {
      await this.mailService.sendResetPasswordMail(payload);
    } catch (error) {
      this.logger.error(
        {
          jobId: job.id,
          attemptsMade: job.attemptsMade,
        },
        'Verification email job failed',
      );
      throw error;
    }
  }
}
