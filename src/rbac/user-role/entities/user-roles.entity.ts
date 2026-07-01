import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../../user/entities/user.entity';
import { Role } from '../../role/entities/role.entity';

@Entity('user_roles')
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.userRoles, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  user!: User;

  @ManyToOne(() => Role, (role) => role.userRoles, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  role!: Role;
}
