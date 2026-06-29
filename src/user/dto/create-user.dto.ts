import { IsEmail, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateUserDto {
  @IsEmail()
  @MaxLength(100)
  email!: string;

  @Transform(({ value }) => String(value).trim())
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\@\$\!\%\*\?\&])[A-Za-z\d\@\$\!\%\*\?\&]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    },
  )
  password!: string;
}
