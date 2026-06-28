import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Permission } from '../permission/entities/permission.entity';
import { User } from '../../user/entities/user.entity';

@Entity('user_permissions')
export class UserPermission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.permissions, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  user!: User;

  @ManyToOne(() => Permission, (permission) => permission.userPermissions)
  permission!: Permission;

  @Column({ default: true })
  granted!: boolean;
}
