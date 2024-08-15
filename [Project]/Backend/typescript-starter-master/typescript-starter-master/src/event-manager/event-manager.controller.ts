// src/event-manager/event-manager.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  NotFoundException,
  ValidationPipe,
  UsePipes,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { EventManagerService } from './event-manager.service';
import { User, UserRole } from '../user/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/strategies/roles.decorator';
import {
  CreateEventManagerDto,
  CreateEventManagerDtoByUserId,
  CreateEventManagerDtoByVid,
} from './dto/event-manager.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RegisterDto } from 'src/auth/dto/auth.dto';

@Controller('event-managers')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class EventManagerController {
  constructor(private readonly eventManagerService: EventManagerService) {}

  // Create a new event manager (registration only)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER,UserRole.VOLUNTEER,UserRole.SPONSOR)
  async create(@Body() createEventManagerDto: CreateEventManagerDto) {
    return this.eventManagerService.create(createEventManagerDto);
  }

  // add additional information by userId
  @Put('add-info/:userId')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER)
  @UsePipes(new ValidationPipe()) // Apply validation pipe
  async updateAdditionalInfo(
    @Param('userId') userId: number,
    @Body() updateEventManagerDto: CreateEventManagerDtoByUserId,
  ) {
    return this.eventManagerService.updateByUserId(
      userId,
      updateEventManagerDto,
    );
  }

  // add additional information by eventManagerId
  @Put('add-infov/:eventManagerId')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER)
  @UsePipes(new ValidationPipe())
  async updateAdditionalInfoByEventManagerId(
    @Param('eventManagerId') eventManagerId: number,
    @Body() updateEventManagerDto: CreateEventManagerDtoByVid,
  ) {
    return this.eventManagerService.updateByEventManagerId(
      eventManagerId,
      updateEventManagerDto,
    );
  }

  @Get('all')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER)
  async findAll() {
    return this.eventManagerService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER)
  async findOne(@Param('id') id: number) {
    const eventManager = await this.eventManagerService.findOne(id);
    if (!eventManager) {
      throw new NotFoundException(`EventManager with ID ${id} not found`);
    }
    return eventManager;
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER)
  async remove(@Param('id') id: number) {
    try {
      await this.eventManagerService.remove(id);
      return {
        message: `Event Manager with ID ${id} deleted from the event manager table`,
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  // Update additional information by userId
  @Put('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER)
  @UsePipes(new ValidationPipe())
  async updateByUserId(
    @Param('userId') userId: number,
    @Body() updateEventManagerDto: CreateEventManagerDtoByUserId,
  ) {
    return this.eventManagerService.updateByUserId(
      userId,
      updateEventManagerDto,
    );
  }

  // Update additional information by eventManagerId
  @Put('event-manager/:eventManagerId')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER)
  @UsePipes(new ValidationPipe())
  async updateByEventManagerId(
    @Param('eventManagerId') eventManagerId: number,
    @Body() updateEventManagerDto: CreateEventManagerDtoByVid,
  ) {
    return this.eventManagerService.updateByEventManagerId(
      eventManagerId,
      updateEventManagerDto,
    );
  }

  @Get('profile/:eventManagerId')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER)
  async getProfile(@Param('eventManagerId') eventManagerId: number) {
    const eventManager =
      await this.eventManagerService.getProfile(eventManagerId);
    if (!eventManager) {
      throw new NotFoundException(
        `EventManager with ID ${eventManagerId} not found`,
      );
    }
    return eventManager;
  }

  @Post('profile-picture/:eventManagerId')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profile-pictures',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          const filename = `${Date.now()}${ext}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit
      },
    }),
  )
  async uploadProfilePicture(
    @Param('eventManagerId') eventManagerId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const eventManager = await this.eventManagerService.updateProfilePicture(
      eventManagerId,
      file.filename,
    );

    if (!eventManager) {
      throw new NotFoundException(
        `EventManager with ID ${eventManagerId} not found`,
      );
    }

    return {
      message: 'Profile picture updated successfully',
      file: file.filename,
    };
  }

  // add volunteer by event manager
  @Post('volunteerSponsorbyem')
  @Roles(UserRole.ADMIN, UserRole.EVENT_MANAGER)
  async addVolunteer(@Body('') registerDto: RegisterDto): Promise<User> {
    return this.eventManagerService.addVolunteerSponsorByManager(registerDto);
  }
}
