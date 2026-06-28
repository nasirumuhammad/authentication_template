import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyResetOtpDto {
  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email!: string;

  @IsString()
  @Transform(({ value }) => String(value).trim().toLowerCase())
  @Length(6, 6)
  otp!: string;
}
