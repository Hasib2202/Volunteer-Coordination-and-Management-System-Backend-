// src/volunteer/dto/create-volunteer.dto.ts
import { IsString, IsOptional, IsObject, IsNotEmpty, IsEmail, Matches } from 'class-validator';
import { User } from 'src/user/entities/user.entity';
export class CreateVolunteerDto {
  // @IsString()
  // @IsOptional()
  // experience?: string;

  // @IsString()
  // @IsOptional()
  // skills?: string;

  // @IsObject()
  // @IsOptional()
  // user?: User;
}

export class UpdateVolunteerInfoDto {
  
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name field should not be empty' })
  @Matches(/^[a-zA-Z\s]*$/, { message: 'Name field should not contain any numbers' })
  nickName: string;
  
  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @IsString()
  // @IsOptional()
  @IsNotEmpty()
  experience?: string;

  @IsString()
  // @IsOptional()
  @IsNotEmpty()
  skills?: string;
}

export class UpdateVolunteerDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name field should not be empty' })
  @Matches(/^[a-zA-Z\s]*$/, { message: 'Name field should not contain any numbers' })
  nickName: string;
  
  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @IsString()
  @IsOptional()
  experience?: string;

  @IsString()
  @IsOptional()
  skills?: string;
}