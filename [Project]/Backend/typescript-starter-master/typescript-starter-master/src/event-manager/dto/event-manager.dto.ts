// src/event-manager/dto/create-event-manager.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateEventManagerDto {

}

export class CreateEventManagerDtoByUserId {
  @IsString()
  @IsNotEmpty()
  position: string;

  @IsString()
  @IsNotEmpty()
  organization: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsString()
  @IsOptional()
  yearsOfExperience?: number;
}
export class CreateEventManagerDtoByVid {
    @IsString()
    @IsNotEmpty()
    position: string;
  
    @IsString()
    @IsNotEmpty()
    organization: string;
  
    @IsString()
    @IsOptional()
    bio?: string;
  
    @IsString()
    @IsOptional()
    specialization?: string;
  
    @IsString()
    @IsOptional()
    yearsOfExperience?: number;
}


export class UpdateProfilePictureDto {
    @IsNumber()
    @IsNotEmpty()
    id: number;
  }