import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class ResendVerifiicationDto {
  @Transform(({ value }) => String(value).toLowerCase())
  @IsEmail()
  email!: string;
}
