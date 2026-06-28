import { Transform } from 'class-transformer';
import { IsEmail, Length } from 'class-validator';

export class VerifyEmailDto {
  @Transform(({ value }) => String(value).trim())
  @Length(6, 6, { message: 'Invalid otp' })
  otp!: string;

  @Transform(({ value }) => String(value).toLowerCase().trim())
  @IsEmail()
  email!: string;
}
