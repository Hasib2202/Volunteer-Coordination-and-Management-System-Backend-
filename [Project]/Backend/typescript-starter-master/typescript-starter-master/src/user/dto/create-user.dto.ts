// src/user/dto/create-user.dto.ts
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s]*$/, {
    message: 'Name should contain only alphabets and spaces',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message: 'username must contain letters, numbers, and special characters',
  })
  username: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty()
  userEmail: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsEnum(UserRole, {
    message: 'Role must be either Admin, Event_Manager, Volunteer, or Sponsor',
  })
  @IsNotEmpty()
  role: UserRole;

  @IsString()
  @Matches(/^[0-9]{11}$/, { message: 'Phone number must be 11 digits' })
  @IsNotEmpty()
  phoneNumber: string;

  // @IsOptional()
  // @IsString()
  // isActive?: boolean;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s]*$/, {
    message: 'Name should contain only alphabets and spaces',
  })
  name?: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty()
  userEmail?: string;

  @IsEnum(UserRole, {
    message: 'Role must be either Admin, Event_Manager, Volunteer, or Sponsor',
  })
  @IsNotEmpty()
  role: UserRole;

  @IsString()
  @Matches(/^[0-9]{11}$/, { message: 'Phone number must be 11 digits' })
  @IsNotEmpty()
  phoneNumber?: string;

  // @IsNotEmpty()
  // isActive?: boolean;
}
