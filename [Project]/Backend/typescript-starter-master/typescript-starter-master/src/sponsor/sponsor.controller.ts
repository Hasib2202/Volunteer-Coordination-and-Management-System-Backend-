import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, NotFoundException, ValidationPipe, UsePipes } from '@nestjs/common';
import { SponsorService } from './sponsor.service';
import { UserRole } from '../user/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/strategies/roles.decorator';
import { CreateSponsorDto, CreateSponsorDtoByUserId, CreateSponsorsDtoSid } from './dto/sponsor.dto';

@Controller('sponsors')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class SponsorController {
  constructor(private readonly sponsorService: SponsorService) {}

  // Create a new sponsor (registration only)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.SPONSOR)
  async create(@Body() createSponsorDto: CreateSponsorDto) {
    return this.sponsorService.create(createSponsorDto);
  }

  // Update additional information by userId
  @Put('add-info/:userId')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.SPONSOR)
  @UsePipes(new ValidationPipe())  // Apply validation pipe
  async updateAdditionalInfo(@Param('userId') userId: number, @Body() updateSponsorDto: CreateSponsorDtoByUserId) {
    return this.sponsorService.updateByUserId(userId, updateSponsorDto);
  }

  // Update additional information by sponsorId
  @Put('add-infov/:sponsorId')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.SPONSOR)
  @UsePipes(new ValidationPipe())
  async updateAdditionalInfoBySponsorId(@Param('sponsorId') sponsorId: number, @Body() updateSponsorDto: CreateSponsorsDtoSid) {
    return this.sponsorService.updateBySponsorId(sponsorId, updateSponsorDto);
  }

  @Get('all')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.SPONSOR)
  async findAll() {
    return this.sponsorService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.SPONSOR)
  async findOne(@Param('id') id: number) {
    const sponsor = await this.sponsorService.findOne(id);
    if (!sponsor) {
      throw new NotFoundException(`Sponsor with ID ${id} not found`);
    }
    return sponsor;
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.SPONSOR)
  async remove(@Param('id') id: number) {
    try {
      await this.sponsorService.remove(id);
      return { message: `Sponsor with ID ${id} deleted from the sponsor table` };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  // Update additional information by userId
  @Put('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.SPONSOR)
  @UsePipes(new ValidationPipe())
  async updateByUserId(@Param('userId') userId: number, @Body() updateSponsorDto: CreateSponsorDtoByUserId) {
    return this.sponsorService.updateByUserId(userId, updateSponsorDto);
  }

  // Update additional information by sponsorId
  @Put('sponsor/:sponsorId')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.SPONSOR)
  @UsePipes(new ValidationPipe())
  async updateBySponsorId(@Param('sponsorId') sponsorId: number, @Body() updateSponsorDto: CreateSponsorsDtoSid) {
    return this.sponsorService.updateBySponsorId(sponsorId, updateSponsorDto);
  }
}
