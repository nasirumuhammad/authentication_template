import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRoleDto {
  @Transform(({ value }) => value.toLowerCase())
  @IsString()
  @IsNotEmpty()
  name!: string;
}
