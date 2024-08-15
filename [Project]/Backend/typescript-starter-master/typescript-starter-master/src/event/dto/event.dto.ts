
import { IsString, IsNotEmpty, IsDateString, Matches, IsEnum, IsOptional, IsDate, IsNumber } from 'class-validator';
import { EventStatus } from '../entity/event.entity';

export class CreateEventDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name field should not be empty' })
  @Matches(/^[a-zA-Z\s]*$/, { message: 'Name field should not contain any numbers' })
  name: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description field should not be empty' })
  description: string;

  @IsDateString({}, { message: 'Date must be a valid date type' })
  @IsNotEmpty({ message: 'Date field should not be empty' })
  date: string;

  @IsEnum(EventStatus)
  status: EventStatus;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  // @IsDate()
  date?: Date;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}

export class AssignVolunteerDto {
  @IsNotEmpty()
  @IsNumber()
  volunteerId: number;
}

export class UnassignVolunteerDto {
  @IsNotEmpty()
  @IsNumber()
  volunteerId: number;
}

export class UpdateEventStatusDto {
  @IsEnum(EventStatus, {
    message: 'Status must be one of the following values: Pending, In Progress, Completed, Cancelled',
  })
  @IsNotEmpty()
  status: EventStatus;
}

export class AddProgressNoteDto {
  @IsString()
  @IsOptional()
  progressNote?: string;
}