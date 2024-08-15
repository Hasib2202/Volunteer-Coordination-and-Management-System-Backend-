// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/user/entities/user.entity';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
