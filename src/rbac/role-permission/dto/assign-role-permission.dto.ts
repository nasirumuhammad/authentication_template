import { IsString, IsNotEmpty } from 'class-validator';

export class AssignRolePermissionDto {
  @IsString()
  @IsNotEmpty()
  roleName!: string;

  @IsString()
  @IsNotEmpty()
  permissionKey!: string;
}
