import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { UserService } from '@/user/user.service';
import { HashingService } from '@/common/services/hashing.service';
import { User } from '@/user/entities/user.entity';
import { Payload, ResetPasswordPayload } from './types/payload.type';
import { maskEmail } from '@/common/utils/mask.util';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';
import type { StringValue } from 'ms';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { USER_EVENTS } from '@/user/common/user.constant';
import { SignInDto } from './dto/sign-in.dto';
import { OtpService } from '@/otp/otp.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerificationRequestedEvent } from '@/user/events/verification-requested.event';
import { ResendVerifiicationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { PasswordResetRequestedEvent } from '@/user/events/password-reset-requested.event';
import { VerifyResetOtpDto } from './dto/verify-reset-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly refreshSecret: string;
  private readonly refreshExpiry: StringValue;
  private readonly resetSecret: string;
  private readonly resetExpiry: StringValue;

  private logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly eventEmitter: EventEmitter2,
    private readonly otpService: OtpService,
  ) {
    this.refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    this.refreshExpiry =
      this.configService.getOrThrow<StringValue>('JWT_REFRESH_EXPIRY');
    this.resetSecret =
      this.configService.getOrThrow<string>('JWT_RESET_SECRET');
    this.resetExpiry =
      this.configService.getOrThrow<StringValue>('JWT_RESET_EXPIRY');
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      this.logger.warn(
        { email: maskEmail(email) },
        'Sign in: user record not found',
      );
      return null;
    }

    const isValidPassword = await this.hashingService.compare(
      password,
      user.password,
    );
    if (!isValidPassword) {
      this.logger.warn(
        { email: maskEmail(email) },
        'Sign in: invalid password',
      );
      return null;
    }

    return user;
  }

  async signup(payload: CreateUserDto): Promise<string> {
    const user = await this.userService.create(payload);
    this.logger.log({ userId: user.id }, 'User signed up successfully');
    this.eventEmitter.emit(
      USER_EVENTS.VERIFICATION_REQUESTED,
      new VerificationRequestedEvent(user),
    );
    return 'Account created successfully. Check your email for verification.';
  }

  async signIn(
    payload: SignInDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.validateUser(payload.email, payload.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.generateTokenPair(user);
    this.logger.log({ userId: user.id }, 'User signed in successfully');
    return tokens;
  }

  async verifyEmail(payload: VerifyEmailDto) {
    await this.otpService.verifyAndDelete({
      email: payload.email,
      otp: payload.otp,
      purpose: 'verify-email',
    });

    await this.userService.markEmailVerified(payload.email);

    return 'Email verified successfully';
  }

  async resendEmailVerification(
    payload: ResendVerifiicationDto,
  ): Promise<string> {
    const RESPONSE = 'If that email is registered, a new code has been sent.';
    const user = await this.userService.findOneByEmail(payload.email);
    if (!user) {
      return RESPONSE;
    }
    if (user.isEmailVerified) {
      throw new ConflictException('Email already verified.');
    }

    this.eventEmitter.emit(
      USER_EVENTS.VERIFICATION_REQUESTED,
      new VerificationRequestedEvent(user),
    );
    this.logger.log(
      { email: maskEmail(payload.email) },
      'Verification email resent',
    );
    return RESPONSE;
  }

  async forgotPassword(payload: ForgotPasswordDto): Promise<string> {
    const RESPONSE = 'If that email is registered, a reset code has been sent.';
    const user = await this.userService.findOneByEmail(payload.email);
    if (!user) return RESPONSE;
    this.eventEmitter.emit(
      USER_EVENTS.PASSWORD_RESET_REQUESTED,
      new PasswordResetRequestedEvent(user),
    );
    this.logger.log(
      { email: maskEmail(user.email) },
      'Password reset email dispatched',
    );
    return RESPONSE;
  }

  async verifyResetOtp(
    payload: VerifyResetOtpDto,
  ): Promise<{ resetToken: string }> {
    await this.otpService.verifyAndDelete({
      email: payload.email,
      otp: payload.otp,
      purpose: 'reset-password',
    });

    const user = await this.userService.findOneByEmail(payload.email);
    if (!user) {
      this.logger.log(
        { email: maskEmail(payload.email) },
        'verify reset otp:user not found',
      );
      throw new NotFoundException('Invalid request');
    }

    const resetToken = this.generateResetToken(user);
    this.logger.log(
      { email: maskEmail(payload.email) },
      'Reset OTP verified, token issued',
    );
    return { resetToken };
  }

  async resetPassword(payload: ResetPasswordDto): Promise<string> {
    const { sub, email, purpose } = this.verifyResetToken(payload.resetToken);

    if (purpose !== 'reset-password') {
      this.logger.log(
        { email: maskEmail(email) },
        'reset password: invalid purpose',
      );
      throw new BadRequestException('Invalid reset token');
    }

    await this.userService.resetPassword(email, payload.newPassword);
    this.logger.log({ userId: sub }, 'Password reset successfully');
    return 'Password reset successfully. Please sign in with your new password.';
  }

  private buildPayload(user: User): Payload {
    return {
      sub: user.id,
      jti: randomUUID(),
      version: user.tokenVersion,
      role: user.userRoles?.map((ur) => ur.role) ?? [],
    };
  }

  private generateAccessToken(payload: Payload): string {
    return this.jwtService.sign(payload as object);
  }

  private async generateRefreshToken(payload: Payload): Promise<string> {
    const refreshToken = this.jwtService.sign(payload as object, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiry,
    });
    await this.refreshTokenService.create(payload.sub, refreshToken);
    return refreshToken;
  }

  private async generateTokenPair(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = this.buildPayload(user);
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);
    return { accessToken, refreshToken };
  }

  private generateResetToken(user: User): string {
    const payload: ResetPasswordPayload = {
      sub: user.id,
      email: user.email,
      purpose: 'reset-password',
    };
    return this.jwtService.sign(payload, {
      secret: this.resetSecret,
      expiresIn: this.resetExpiry,
    });
  }

  private verifyResetToken(token: string): ResetPasswordPayload {
    try {
      return this.jwtService.verify<ResetPasswordPayload>(token, {
        secret: this.resetSecret,
      });
    } catch {
      throw new BadRequestException('Reset token is invalid or expired');
    }
  }
}
