import { IsDateString, IsDecimal, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSponsorDtoByUserId {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  website: string;

//   @IsDecimal({ decimal_digits: '4', force_decimal: true })
  @IsNumber()
  @IsOptional()
  sponsorshipAmount?: number;

  @IsString()
  @IsOptional()
  sponsorshipType?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  contractUrl?: string;
}

export class CreateSponsorsDtoSid {
    @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  website: string;

//   @IsDecimal({ decimal_digits: '4', force_decimal: true })
  @IsNumber()
  @IsOptional()
  sponsorshipAmount?: number;

  @IsString()
  @IsOptional()
  sponsorshipType?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  contractUrl?: string;
}

export class CreateSponsorDto {
    
}