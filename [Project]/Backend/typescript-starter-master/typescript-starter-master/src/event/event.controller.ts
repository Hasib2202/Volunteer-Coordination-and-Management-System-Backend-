import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  NotFoundException,
  Delete,
  Put,
  UseGuards,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  InternalServerErrorException,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
  Patch,
  HttpStatus,
  Logger,
  Res,
} from '@nestjs/common';
import { EventService } from './event.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/strategies/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { AddProgressNoteDto, AssignVolunteerDto, CreateEventDto, UnassignVolunteerDto, UpdateEventDto, UpdateEventStatusDto } from './dto/event.dto';
import { EventEntity, EventStatus } from './entity/event.entity';
import { Volunteer } from 'src/volunteer/entity/volunteer.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';


@Controller('events')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
@UsePipes(new ValidationPipe()) // Apply ValidationPipe to the entire controller
export class EventController {

  private readonly logger = new Logger(EventController.name);
  
  constructor(private readonly eventService: EventService) {}

  @Post('em/:userId')
  @Roles(UserRole.EVENT_MANAGER,UserRole.ADMIN)
  async create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createEventDto: CreateEventDto,
  ) {
    try {
      const event = await this.eventService.create(userId, createEventDto);
      return { event };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  // @Post('emu/:userId')
  // @Roles(UserRole.EVENT_MANAGER)
  // async createUid(
  //   @Param('userId', ParseIntPipe) userId: number,
  //   @Body() createEventDto: CreateEventDto,
  // ) {
  //   try {
  //     const event = await this.eventService.createUid(userId, createEventDto);
  //     return { event };
  //   } catch (error) {
  //     throw new NotFoundException(error.message);
  //   }
  // }

  @Put(':eventId')
  @Roles(UserRole.EVENT_MANAGER)
  update(
    @Param('eventId') eventId: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventService.update(eventId, updateEventDto);
  }

  @Delete(':eventId')
  @Roles(UserRole.EVENT_MANAGER)
  async delete(@Param('eventId') id: number) {
    await this.eventService.delete(id);
    return { message: 'Event deleted successfully' };
  }

  @Get('all')
  @Roles(UserRole.EVENT_MANAGER)
  async findAll() {
    const events = await this.eventService.findAll();
    return { events };
  }

  @Get(':eventId')
  @Roles(UserRole.EVENT_MANAGER)
  async findOne(@Param('eventId') id: number) {
    const event = await this.eventService.findOne(id);
    return { event };
  }

  @Post('assign-volunteer/:eventid')
  async assignVolunteerToEvent(
    @Param('eventid') eventId: number,
    @Body() assignVolunteerDto: AssignVolunteerDto,
  ): Promise<any> {
    try {
      const event = await this.eventService.assignVolunteerToEvent(
        eventId,
        assignVolunteerDto.volunteerId,
      );
      return { event };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        'Failed to assign volunteer to event',
      );
    }
  }

  @Post('unassign-volunteer/:eventid')
  async unassignVolunteerFromEvent(
    @Param('eventid') eventId: number,
    @Body() unassignVolunteerDto: UnassignVolunteerDto,
  ): Promise<any> {
    try {
      const event = await this.eventService.unassignVolunteerFromEvent(
        eventId,
        unassignVolunteerDto.volunteerId,
      );
      return { event };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        'Failed to unassign volunteer from event',
      );
    }
  }

  @Get('assigned-volunteers/:id')
  async getAssignedVolunteers(@Param('id') eventId: number) {
    try {
      const volunteers = await this.eventService.getAssignedVolunteers(eventId);
      return { volunteers };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new Error('Failed to fetch assigned volunteers');
    }
  }

  @Post('upload-document/:eventId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // Specify the upload destination
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      limits: { fileSize: 3 * 1024 * 1024 }, // Set file size limit to 3MB
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf|doc|docx)$/)) {
          return cb(
            new BadRequestException(
              'Only image and document files are allowed!',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadDocument(
    @Param('eventId') eventId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.eventService.uploadDocument(eventId, file);
  }

  @Delete(':eventId/delete-document/:documentId')
  async deleteDocument(
    @Param('eventId') eventId: number,
    @Param('documentId') documentId: number,
  ) {
    await this.eventService.deleteDocument(eventId, documentId);
    return { message: 'Document deleted successfully' };
  }

  @Get('documents/:eventId')
  async getDocuments(@Param('eventId') eventId: number) {
    const documents = await this.eventService.getDocuments(eventId);
    return { documents };
  }

  @Patch('status/:eventId')
  async updateEventStatus(
    @Param('eventId') eventId: number,
    @Body() updateEventStatusDto: UpdateEventStatusDto,
  ) {
    try {
      const { status } = updateEventStatusDto;
      const event = await this.eventService.updateEventStatus(eventId, status);
      return { event };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Post('progressnotes/:eventId')
  async addProgressNote(
    @Param('eventId') eventId: number,
    @Body() addProgressNoteDto: AddProgressNoteDto,
  ) {
    try {
      const { progressNote } = addProgressNoteDto;
      const event = await this.eventService.addProgressNote(
        eventId,
        progressNote,
      );
      return { event };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get('progress/:eventId')
  async getEventProgress(@Param('eventId') eventId: number) {
    try {
      const event = await this.eventService.getEventProgress(eventId);
      return { event };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get('portion/:eventId')
  async getEventPortion(@Param('eventId') eventId: number) {
    try {
      const portion = await this.eventService.getEventPortion(eventId);
      return { portion };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Put('portion/:eventId')
  async updateEventPortion(@Param('eventId') eventId: number) {
    try {
      const event = await this.eventService.updateEventPortion(eventId);
      return { event };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get('report/:eventId')
  async downloadReport(
    @Param('eventId') eventId: number,
    @Res() res: Response,
  ) {
    try {
      const reportPath = await this.eventService.generateReport(eventId);
      res.sendFile(reportPath, (err) => {
        if (err) {
          this.logger.error('Error sending report file', err.stack);
          res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send('Error sending report file');
        }
      });
    } catch (error) {
      this.logger.error('Error generating report', error.stack);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
    }
  }
  
}