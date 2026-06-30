import { MAIL_JOBS, MAIL_QUEUE } from '@/common/constants/mail.constant';
import { maskEmail } from '@/common/utils/mask.util';
import { USER_EVENTS } from '@/user/common/user.constant';
import { PasswordResetRequestedEvent } from '@/user/events/password-reset-requested.event';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';

@Injectable()
export class PasswordResetRequestedListener {
  private readonly logger = new Logger(PasswordResetRequestedListener.name);
  constructor(@InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue) {}

  @OnEvent(USER_EVENTS.PASSWORD_RESET_REQUESTED)
  async handle(event: PasswordResetRequestedEvent) {
    try {
      await this.mailQueue.add(MAIL_JOBS.SEND_PASSWORD_RESET, event, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000 * 20,
        },
        removeOnComplete: 100,
        removeOnFail: 100,
      });
      this.logger.log(
        {
          jobName: MAIL_JOBS.SEND_PASSWORD_RESET,
          email: maskEmail(event.user.email),
        },
        'Send password reset Mail job enqueued',
      );
    } catch (error) {
      this.logger.error(
        { email: maskEmail(event.user.email), error },
        'Failed to enqueue password reset email job',
      );
    }
  }
}
