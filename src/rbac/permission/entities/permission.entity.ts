import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolePermission } from '../../role-permission/entities/role-permission.entity';
import { UserPermission } from '../../shared/user-permission.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  key!: string;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions!: RolePermission[];

  @OneToMany(
    () => UserPermission,
    (userpermission) => userpermission.permission,
  )
  userPermissions!: UserPermission[];
}
