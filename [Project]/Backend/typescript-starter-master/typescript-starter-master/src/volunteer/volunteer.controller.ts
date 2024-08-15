// src/volunteer/volunteer.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, NotFoundException, ValidationPipe, UsePipes } from '@nestjs/common';
import { VolunteerService } from './volunteer.service';
import { UserRole } from '../user/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/strategies/roles.decorator';
import { CreateVolunteerDto, UpdateVolunteerDto, UpdateVolunteerInfoDto } from './dto/volunteer.dto';
import { Volunteer } from './entity/volunteer.entity';

@Controller('volunteers')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class VolunteerController {
  constructor(private readonly volunteerService: VolunteerService) {}

  // Create a new volunteer (registration only)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.VOLUNTEER, UserRole.SPONSOR)
  async create(@Body() createVolunteerDto: CreateVolunteerDto) {
    return this.volunteerService.create(createVolunteerDto);
  }

  // Add additional information
  @Put('add-info/:userId')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.VOLUNTEER, UserRole.SPONSOR)
  @UsePipes(new ValidationPipe())  // Apply validation pipe
  async updateAdditionalInfo(@Param('userId') userId: number, @Body() updateVolunteerInfoDto: UpdateVolunteerInfoDto) {
    return this.volunteerService.addAditionalInfo(updateVolunteerInfoDto, userId);
  }

  // add additional info by volunteerId
  @Put('add-infov/:volunteerId')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.VOLUNTEER, UserRole.SPONSOR)
  @UsePipes(new ValidationPipe())
  async updateAdditionalInfoByVolunteerId(@Param('volunteerId') volunteerId: number, @Body() updateVolunteerInfoDto: UpdateVolunteerInfoDto) {
    return this.volunteerService.updateAdditionalInfoByVolunteerId(volunteerId, updateVolunteerInfoDto);
  }

  @Get('all')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.VOLUNTEER, UserRole.SPONSOR)
  async findAll() {
    return this.volunteerService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER)
  async findOne(@Param('id') id: number) {
    const volunteer = await this.volunteerService.findOne(id);
    if (!volunteer) {
      throw new NotFoundException(`Volunteer with ID ${id} not found`);
    }
    return volunteer;
  }
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.VOLUNTEER, UserRole.SPONSOR)
  async remove(@Param('id') id: number) {
    try {
      await this.volunteerService.remove(id);
      return { message: `Volunteer with ID ${id} deleted from the volunteer table` };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Put('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.VOLUNTEER, UserRole.SPONSOR)
  @UsePipes(new ValidationPipe())
  async updateByUserId(@Param('userId') userId: number, @Body() updateVolunteerDto: UpdateVolunteerDto) {
    return this.volunteerService.updateByUserId(userId, updateVolunteerDto);
  }

  @Put('volunteer/:volunteerId')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.VOLUNTEER, UserRole.SPONSOR)
  @UsePipes(new ValidationPipe())
  async updateByVolunteerId(@Param('volunteerId') volunteerId: number, @Body() updateVolunteerDto: UpdateVolunteerDto) {
    return this.volunteerService.updateByVolunteerId(volunteerId, updateVolunteerDto);
  }

  
}