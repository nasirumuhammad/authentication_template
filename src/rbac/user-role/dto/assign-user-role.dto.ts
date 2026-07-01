import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class AssignUserRoleDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  roleName!: string;
}
