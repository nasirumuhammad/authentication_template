import { IsEmail, MaxLength, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateUserDto {
  @IsEmail()
  @MaxLength(100)
  email!: string;

  @Transform(({ value }) => String(value).trim())
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\@\$\!\%\*\?\&])[A-Za-z\d\@\$\!\%\*\?\&]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    },
  )
  password!: string;
}
