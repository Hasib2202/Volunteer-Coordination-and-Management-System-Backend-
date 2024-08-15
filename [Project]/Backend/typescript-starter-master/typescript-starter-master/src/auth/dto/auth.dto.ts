
// src/auth/dto/auth.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsOptional, Matches, MinLength, Length } from 'class-validator';
import { UserRole } from '../../user/entities/user.entity';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s]*$/, { message: 'Name should contain only alphabets and spaces' })
  name: string;

  // @IsEmail({}, { message: 'Email must be a valid email address' })
  // @IsNotEmpty()
  // email: string;

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

  @IsEnum(UserRole, { message: 'Role must be either Admin, Event_Manager, Volunteer, or Sponsor' })
  @IsNotEmpty()
  role: UserRole;

  @IsString()
  @Matches(/^[0-9]{11}$/, { message: 'Phone number must be 11 digits' })
  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  isActive?: boolean;
}

export class LoginDto {
  // @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}


// export class RegisterDtoByEM {
//   @IsString()
//   @IsNotEmpty()
//   @Matches(/^[a-zA-Z\s]*$/, { message: 'Name should contain only alphabets and spaces' })
//   name: string;

//   @IsEmail({}, { message: 'Email must be a valid email address' })
//   @IsNotEmpty()
//   email: string;

//   @IsString()
//   @MinLength(6, { message: 'Password must be at least 6 characters long' })
//   password: string;

//   @IsEnum(UserRole, { message: 'Role must be either Volunteer, or Sponsor' })
//   @IsNotEmpty()
//   role: UserRole;

//   @IsString()
//   @Matches(/^[0-9]{11}$/, { message: 'Phone number must be 11 digits' })
//   @IsNotEmpty()
//   phoneNumber: string;

//   @IsOptional()
//   @IsString()
//   isActive?: boolean;
// }

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;
  
}

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  userEmail: string;
}

export class ResetPasswordTokenDto {
  
  @IsEmail()
  @IsNotEmpty()
  userEmail: string;
  
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}