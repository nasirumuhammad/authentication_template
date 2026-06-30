import { MAIL_JOBS, MAIL_QUEUE } from '@/common/constants/mail.constant';
import { maskEmail } from '@/common/utils/mask.util';
import { USER_EVENTS } from '@/user/common/user.constant';
import { UserCreatedEvent } from '@/user/events/user-created.event';
import { VerificationRequestedEvent } from '@/user/events/verification-requested.event';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';

@Injectable()
export class VericationRequestedListener {
  private readonly logger = new Logger(VericationRequestedListener.name);
  constructor(@InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue) {}

  @OnEvent(USER_EVENTS.VERIFICATION_REQUESTED)
  async handle(event: VerificationRequestedEvent) {
    try {
      await this.mailQueue.add(MAIL_JOBS.SEND_MAIL_VERIFICATION, event, {
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
          jobName: MAIL_JOBS.SEND_MAIL_VERIFICATION,
          email: maskEmail(event.user.email),
        },
        'Send mail verification mail job enqueued',
      );
    } catch (error) {
      this.logger.error(
        { email: maskEmail(event.user.email), error },
        'Failed to enqueue verification email job',
      );
    }
  }
}
