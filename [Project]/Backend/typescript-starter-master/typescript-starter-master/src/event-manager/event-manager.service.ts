// src/event-manager/event-manager.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventManager } from './entity/event-manager.entity';
import { User, UserRole } from 'src/user/entities/user.entity';
import { CreateEventManagerDto, CreateEventManagerDtoByUserId, CreateEventManagerDtoByVid } from './dto/event-manager.dto';
import { unlinkSync } from 'fs';
import { join } from 'path';
import { RegisterDto } from 'src/auth/dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { VolunteerService } from 'src/volunteer/volunteer.service';
import { UserService } from 'src/user/user.service';
import { SponsorService } from 'src/sponsor/sponsor.service';

@Injectable()
export class EventManagerService {
  constructor(
    @InjectRepository(EventManager)
    private eventManagerRepository: Repository<EventManager>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private volunteerService: VolunteerService,
    private userService: UserService,
    private sponsorService: SponsorService,

  ) {}

  // Create a new event manager (registration only)
  async create(createEventManagerDto: CreateEventManagerDto): Promise<EventManager> {
    const newEventManager = this.eventManagerRepository.create(createEventManagerDto);
    return this.eventManagerRepository.save(newEventManager);
  }

  // Add  additional information by userId
  async updateByUserId(userId: number, updateEventManagerDto: CreateEventManagerDtoByUserId): Promise<EventManager> {
    // Find the event manager associated with the given userId
    const eventManager = await this.eventManagerRepository.findOne({ where: { user: { id: userId } } });
    if (!eventManager) {
      throw new NotFoundException(`Event Manager with User ID ${userId} not found`);
    }

    // add the event manager with the provided DTO
    this.eventManagerRepository.merge(eventManager, updateEventManagerDto);
    return this.eventManagerRepository.save(eventManager);
  }

  // add additional information by eventManagerId
  async updateByEventManagerId(eventManagerId: number, updateEventManagerDto: CreateEventManagerDtoByVid): Promise<EventManager> {
    // Find the event manager by its own ID
    const eventManager = await this.eventManagerRepository.findOne({ where: { id: eventManagerId } });
    if (!eventManager) {
      throw new NotFoundException(`Event Manager with ID ${eventManagerId} not found`);
    }

    // add the event manager with the provided DTO
    this.eventManagerRepository.merge(eventManager, updateEventManagerDto);
    return this.eventManagerRepository.save(eventManager);
  }

  async findAll(): Promise<EventManager[]> {
    return this.eventManagerRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<EventManager> {
    const eventManager = await this.eventManagerRepository.findOne({ where: { id } });
    if (!eventManager) {
      throw new NotFoundException(`EventManager with ID ${id} not found`);
    }
    return eventManager;
  }

  async remove(id: number): Promise<void> {
    const deleteResult = await this.eventManagerRepository.delete(id);
    if (!deleteResult.affected) {
      throw new NotFoundException(`Event Manager with ID ${id} not found`);
    }
  }

  async findByUserId(userId: number): Promise<EventManager | undefined> {
    return this.eventManagerRepository.findOne({ where: { user: { id: userId } } });
  }

  async getProfile(eventManagerId: number): Promise<EventManager> {
    const eventManager = await this.eventManagerRepository.findOne({
      where: { id: eventManagerId },
      select: ['id', 'profilePicture', 'position','organization','bio','specialization','yearsOfExperience'], // Adjust fields as needed
    });
    if (!eventManager) {
      throw new NotFoundException(`EventManager with ID ${eventManagerId} not found`);
    }
    return eventManager;
  }

  async updateProfilePicture(eventManagerId: number, profilePictureFilename: string): Promise<EventManager> {
    const eventManager = await this.eventManagerRepository.findOne({ where: { id: eventManagerId } });
    if (!eventManager) {
      throw new NotFoundException(`EventManager with ID ${eventManagerId} not found`);
    }
  
    // Delete old profile picture if exists
    if (eventManager.profilePicture) {
      const oldFilePath = join(__dirname, '..', '..', 'uploads', 'profile-pictures', eventManager.profilePicture);
      try {
        unlinkSync(oldFilePath);
      } catch (error) {
        console.error(`Failed to delete old profile picture: ${error.message}`);
      }
    }
  
    eventManager.profilePicture = profilePictureFilename;
    return this.eventManagerRepository.save(eventManager);
  }

  // add volunteer by event manager
  async addVolunteerSponsorByManager(registerDto: RegisterDto): Promise<User> {
    const { username, password, name,userEmail, role, phoneNumber } = registerDto;
    const existingUser = await this.userService.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.userService.createUser({
      username,
      name,
      userEmail,
      password: hashedPassword,
      role,
      phoneNumber,
    });

    switch (role) {
      case UserRole.VOLUNTEER:
        await this.volunteerService.create({ user: newUser });
        break;
      // case UserRole.EVENT_MANAGER:
      //   await this.eventManagerService.create({ user: newUser });
      //   break;
      case UserRole.SPONSOR:
        await this.sponsorService.create({ user: newUser });
        break;
    }

    return newUser;
  }


}

