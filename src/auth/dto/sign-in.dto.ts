import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class SignInDto {
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail()
  email!: string;

  @IsStrongPassword({}, { message: 'Invalid email or password' })
  @Transform(({ value }) => String(value).trim())
  @IsNotEmpty()
  password!: string;
}
