import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity, EventStatus } from './entity/event.entity';
import { EventManager } from '../event-manager/entity/event-manager.entity';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { User, UserRole } from 'src/user/entities/user.entity';
import { Volunteer } from 'src/volunteer/entity/volunteer.entity';
import { MailerService } from '../mailer/mailer.service';
import { DocumentEntity } from 'src/document/document.entity';
import * as PDFKit from 'pdfkit'; // Import PDFKit
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EventService {
  
  private readonly reportsDirectory: string;
  private readonly logger = new Logger(EventService.name);

  constructor(
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,
    @InjectRepository(EventManager)
    private eventManagerRepository: Repository<EventManager>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Volunteer)
    private readonly volunteerRepository: Repository<Volunteer>,
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    private readonly mailerService: MailerService,

  ) {
    
    this.reportsDirectory = path.join(__dirname, '..', 'reports');
    
    if (!fs.existsSync(this.reportsDirectory)) {
      fs.mkdirSync(this.reportsDirectory, { recursive: true });
    }
  }

  async create(
    userId: number,
    createEventDto: CreateEventDto,
  ): Promise<EventEntity> {
    const user = await this.eventManagerRepository.findOne({
      where: { id: userId },
      // relations: ['eventManager'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user) {
      throw new NotFoundException(
        `EventManager for User with ID ${userId} not found`,
      );
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      eventManager: user,
    });

    return this.eventRepository.save(event);
  }

  // async createUid(userId: number, createEventDto: CreateEventDto): Promise<EventEntity> {
  //   const user = await this.userRepository.findOne({
  //     where: { id: userId, role: UserRole.EVENT_MANAGER }, // Ensure the user is an event manager
  //     relations: ['eventManager','user'], // This should correctly fetch the related eventManager entity
  //   });

  //   if (!user) {
  //     throw new NotFoundException(`User with ID ${userId} and role EVENT_MANAGER not found`);
  //   }

  //   if (!user.eventManager) {
  //     throw new NotFoundException(`EventManager entity for User with ID ${userId} not found`);
  //   }

  //   const event = this.eventRepository.create({
  //     ...createEventDto,
  //     eventManager: user.eventManager, // Associate the event with the event manager
  //   });

  //   return this.eventRepository.save(event);
  // }

  async update(
    eventId: number,
    updateEventDto: UpdateEventDto,
  ): Promise<EventEntity> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    Object.assign(event, updateEventDto);
    return this.eventRepository.save(event);
  }

  async delete(id: number): Promise<void> {
    const result = await this.eventRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }

  async findAll(): Promise<EventEntity[]> {
    return this.eventRepository.find();
  }

  async findOne(id: number): Promise<EventEntity> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async assignVolunteerToEvent(
    eventId: number,
    volunteerId: number,
  ): Promise<EventEntity> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['volunteers'],
    });
    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    const volunteer = await this.volunteerRepository.findOne({
      where: { id: volunteerId },
      relations: ['user'],
    });
    if (!volunteer) {
      throw new NotFoundException(`Volunteer with id ${volunteerId} not found`);
    }

    event.volunteers.push(volunteer);
    await this.eventRepository.save(event);
    console.log(
      `Volunteer with ID ${volunteerId} has been assigned to Event with ID ${eventId}`,
    );

    // Update the progress after assigning a volunteer
    await this.updateEventPortion(eventId);

    // Send email notification to the volunteer
    await this.mailerService.sendEventNotification(
      volunteer.email,
      volunteer.nickName,
      event.name,
      event.date.toISOString(),
    );

    return event;
  }

  async unassignVolunteerFromEvent(
    eventId: number,
    volunteerId: number,
  ): Promise<EventEntity> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['volunteers'],
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    const volunteer = await this.volunteerRepository.findOne({
      where: { id: volunteerId },
      relations: ['user'],
    });

    if (!volunteer) {
      throw new NotFoundException(`Volunteer with id ${volunteerId} not found`);
    }

    event.volunteers = event.volunteers.filter((v) => v.id !== volunteerId);
    await this.eventRepository.save(event);

    // Update the progress after unassigning a volunteer
    await this.updateEventPortion(eventId);


    console.log(
      `Volunteer with ID ${volunteerId} has been unassigned from Event with ID ${eventId}`,
    );
    // Optionally, send notification email here
    // await this.notificationService.sendVolunteerUnassignedEmail(volunteer.user.email, event);

    return event;
  }

  async getAssignedVolunteers(eventId: number): Promise<Volunteer[]> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['volunteers'], // Assuming 'volunteers' is the relation name in EventEntity
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return event.volunteers;
  }

  async uploadDocument(eventId: number, file: Express.Multer.File) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const document = new DocumentEntity();
    document.filename = file.filename;
    document.path = file.path;
    document.event = event;

    await this.documentRepository.save(document);

    // Update the progress after uploading a document
    await this.updateEventPortion(eventId);

    return {
      message: 'Document uploaded successfully',
      document: {
        filename: file.filename,
        path: file.path,
        event: {
          id: eventId,
        },
      },
    };
  }

  async deleteDocument(eventId: number, documentId: number): Promise<void> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['documents'],
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    const document = await this.documentRepository.findOne({
      where: { id: documentId, event: { id: eventId } },
    });

    if (!document) {
      throw new NotFoundException(`Document with id ${documentId} not found`);
    }

    await this.documentRepository.delete(documentId);
    // Update the progress after deleting a document
    await this.updateEventPortion(eventId);
  }

  async getDocuments(eventId: number): Promise<DocumentEntity[]> {
    // Find the event by ID
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['documents'], // Assuming documents are a relation on EventEntity
    });

    // Check if the event exists
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Return the documents associated with the event
    return event.documents;
  }

  async updateEventStatus(eventId: number, status: EventStatus): Promise<EventEntity> {
    // Fetch the event by ID
    const event = await this.eventRepository.findOne({ where: { id: eventId } });

    // If the event does not exist, throw a NotFoundException
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Update the event status
    event.status = status;

    // Save and return the updated event
    return await this.eventRepository.save(event);
  }

  async addProgressNote(eventId: number, progressNote: string): Promise<EventEntity> {
    // Ensure eventId is a number and validate it
    if (isNaN(eventId)) {
      throw new BadRequestException(`Invalid event ID: ${eventId}`);
    }
  
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }
  
    event.progressNote = progressNote;
    return await this.eventRepository.save(event);
  }
  
  async getEventProgress(eventId: number): Promise<EventEntity> {
    if (isNaN(eventId)) {
      throw new BadRequestException(`Invalid event ID: ${eventId}`);
    }
  
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }
  
    return event;
  }
  
  async getEventPortion(eventId: number): Promise<any> {
    if (isNaN(eventId)) {
      throw new BadRequestException(`Invalid event ID: ${eventId}`);
    }
  
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['volunteers', 'documents'],
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
  
    // Fetch total counts from the database
    const totalVolunteers = await this.volunteerRepository.count();
    const totalDocuments = await this.documentRepository.count();
  
    const volunteersAssigned = event.volunteers.length;
    const documentsUploaded = event.documents.length;
  
    const volunteersProgress = Math.min((volunteersAssigned / totalVolunteers) * 100, 100);
    const documentsProgress = Math.min((documentsUploaded / totalDocuments) * 100, 100);
    const overallProgress = Math.min((volunteersProgress + documentsProgress) / 2, 100);
  
    const progress = {
      volunteers: `${volunteersProgress.toFixed(2)}%`, // Add % symbol
      documents: `${documentsProgress.toFixed(2)}%`, // Add % symbol
      overall: `${overallProgress.toFixed(2)}%`, // Add % symbol
    };
  
    return {
      ...event,
      progress,
      totalVolunteers,
      totalDocuments,
    };
  }
  
  async updateEventPortion(eventId: number): Promise<EventEntity> {
    if (isNaN(eventId)) {
      throw new BadRequestException(`Invalid event ID: ${eventId}`);
    }
  
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['volunteers', 'documents'],
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
  
    // Fetch total counts from the database
    const totalVolunteers = await this.volunteerRepository.count();
    const totalDocuments = await this.documentRepository.count();
  
    const volunteersAssigned = event.volunteers.length;
    const documentsUploaded = event.documents.length;
  
    const volunteersProgress = Math.min((volunteersAssigned / totalVolunteers) * 100, 100);
    const documentsProgress = Math.min((documentsUploaded / totalDocuments) * 100, 100);
    const overallProgress = Math.min((volunteersProgress + documentsProgress) / 2, 100);
  
    event.progress = {
      volunteers: volunteersProgress,
      documents: documentsProgress,
      overall: overallProgress,
    };
  
    // Update total counts in the event entity if needed
    event.totalVolunteers = totalVolunteers;
    event.totalDocuments = totalDocuments;
  
    return this.eventRepository.save(event);
  }

   async generateReport(eventId: number): Promise<string> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['volunteers', 'documents'],
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
  
    const reportPath = path.join(this.reportsDirectory, `event-report-${eventId}.pdf`);
  
    try {
      await this.createPdfReport(event, reportPath);
      return reportPath;
    } catch (error) {
      this.logger.error(`Failed to generate report for event ID ${eventId}`, error.stack);
      throw new Error('Error generating report');
    }
  }

    private async createPdfReport(event: EventEntity, filePath: string) {
    return new Promise<void>((resolve, reject) => {
      const doc = new PDFKit();
      const writeStream = fs.createWriteStream(filePath);
      
      writeStream.on('error', (err) => {
        this.logger.error('Error writing PDF file', err.stack);
        reject(err);
      });
  
      doc.pipe(writeStream);
  
      doc.fontSize(20).text(`Event Report: ${event.name}`, { underline: true });
      doc.fontSize(12).text(`\nEvent ID: ${event.id}`);
      doc.text(`Date: ${event.date}`);
      doc.text(`Status: ${event.status}\n`);
      doc.text(`\n`);

      
      doc.fontSize(16).text('Assigned Volunteers:', { underline: true });
      if (event.volunteers.length > 0) {
        event.volunteers.forEach(volunteer => {
         doc.fontSize(12).text(`- ${volunteer.nickName} (${volunteer.email})`);
        });
      } else {
        doc.fontSize(12).text('No volunteers assigned yet.');
      }
  
      doc.fontSize(16).text('\nUploaded Documents:', { underline: true });
      if (event.documents.length > 0) {
        event.documents.forEach(document => {
          doc.fontSize(12).text(`- ${document.filename}`);
        });
      } else {
        doc.fontSize(12).text('No documents uploaded yet.');
      }
  
      doc.end();
  
      writeStream.on('finish', () => {
        resolve();
      });
    });
  }
  

}