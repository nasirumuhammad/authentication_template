import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class GrantUserPermissionDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  permissionKey!: string;
}
