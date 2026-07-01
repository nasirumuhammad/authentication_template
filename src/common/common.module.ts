import { Global, Module } from '@nestjs/common';
import { HashingService } from './services/hashing.service';
import { AuthorizationGuard } from './guards/authorization.guard';
import { AuthorizationCacheService } from './services/authorization-cache.service';
import { UserModule } from '@/user/user.module';

@Global()
@Module({
  imports: [UserModule],
  providers: [AuthorizationGuard, AuthorizationCacheService, HashingService],
  exports: [
    AuthorizationGuard,
    AuthorizationCacheService,
    HashingService,
    UserModule,
  ],
})
export class CommonModule {}
