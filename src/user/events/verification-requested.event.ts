import { User } from '../entities/user.entity';

export class VerificationRequestedEvent {
  constructor(public readonly user: User) {}
}
