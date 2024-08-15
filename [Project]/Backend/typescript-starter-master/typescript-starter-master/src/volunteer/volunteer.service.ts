// src/volunteer/volunteer.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Volunteer } from './entity/volunteer.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateVolunteerDto, UpdateVolunteerDto, UpdateVolunteerInfoDto } from './dto/volunteer.dto';

@Injectable()
export class VolunteerService {
  constructor(
    @InjectRepository(Volunteer)
    private volunteerRepository: Repository<Volunteer>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Create a new volunteer (registration only)
  async create(createVolunteerDto: CreateVolunteerDto): Promise<Volunteer> {
    const newVolunteer = this.volunteerRepository.create(createVolunteerDto);
    return this.volunteerRepository.save(newVolunteer);
  }

  // Add additional information
  async addAditionalInfo(updateVolunteerInfoDto: UpdateVolunteerInfoDto, userId: number): Promise<Volunteer> {
    // Find the volunteer associated with the userId
    const volunteer = await this.volunteerRepository.findOne({ where: { user: { id: userId } } });
    if (!volunteer) {
      throw new NotFoundException(`Volunteer with User ID ${userId} not found`);
    }

    // add the volunteer with the provided DTO
    this.volunteerRepository.merge(volunteer, updateVolunteerInfoDto);
    return this.volunteerRepository.save(volunteer);
  }

  async updateAdditionalInfoByVolunteerId(volunteerId: number, updateVolunteerInfoDto: UpdateVolunteerInfoDto): Promise<Volunteer> {
    // Find the volunteer by its own ID
    const volunteer = await this.volunteerRepository.findOne({ where: { id: volunteerId} } );
    if (!volunteer) {
      throw new NotFoundException(`Volunteer with ID ${volunteerId} not found`);
    }

    // add the volunteer with the provided DTO
    this.volunteerRepository.merge(volunteer, updateVolunteerInfoDto);
    return this.volunteerRepository.save(volunteer);
  }

  async findAll(): Promise<Volunteer[]> {
    return this.volunteerRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Volunteer> {
    const volunteer = await this.volunteerRepository.findOne({ where: { id } });
    if (!volunteer) {
      throw new NotFoundException(`Volunteer with ID ${id} not found`);
    }
    return volunteer;
  }

  async remove(id: number): Promise<void> {
    const deleteResult = await this.volunteerRepository.delete(id);
    if (!deleteResult.affected) {
      throw new NotFoundException(`Volunteer with ID ${id} not found`);
    }
  }

  async findByUserId(userId: number): Promise<Volunteer | undefined> {
    return this.volunteerRepository.findOne({ where: { user: { id: userId } } });
  }

  // Update additional info by userId
  async updateByUserId(userId: number, updateVolunteerDto: UpdateVolunteerDto): Promise<Volunteer> {
    // Find the volunteer associated with the given userId
    const volunteer = await this.volunteerRepository.findOne({ where: { user: { id: userId } } });
    if (!volunteer) {
      throw new NotFoundException(`Volunteer with User ID ${userId} not found`);
    }

    // Update the volunteer with the provided DTO
    this.volunteerRepository.merge(volunteer, updateVolunteerDto);
    return this.volunteerRepository.save(volunteer);
  }

  // Update additional info by volunteerId
  async updateByVolunteerId(volunteerId: number, updateVolunteerDto: UpdateVolunteerDto): Promise<Volunteer> {
    // Find the volunteer by its own ID
    const volunteer = await this.volunteerRepository.findOne({ where: { id: volunteerId } });
    if (!volunteer) {
      throw new NotFoundException(`Volunteer with ID ${volunteerId} not found`);
    }

    // Update the volunteer with the provided DTO
    this.volunteerRepository.merge(volunteer, updateVolunteerDto);
    return this.volunteerRepository.save(volunteer);
  }
}