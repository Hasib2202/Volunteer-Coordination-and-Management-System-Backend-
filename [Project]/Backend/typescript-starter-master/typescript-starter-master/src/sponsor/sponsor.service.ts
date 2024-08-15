import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sponsor } from './entity/sponsor.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateSponsorDto, CreateSponsorDtoByUserId, CreateSponsorsDtoSid } from './dto/sponsor.dto';

@Injectable()
export class SponsorService {
  constructor(
    @InjectRepository(Sponsor)
    private sponsorRepository: Repository<Sponsor>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Create a new sponsor (registration only)
  async create(createSponsorDto: CreateSponsorDto): Promise<Sponsor> {
    const newSponsor = this.sponsorRepository.create(createSponsorDto);
    return this.sponsorRepository.save(newSponsor);
  }

  // Add additional information by userId
  async updateByUserId(userId: number, updateSponsorDto: CreateSponsorDtoByUserId): Promise<Sponsor> {
    // Find the sponsor associated with the given userId
    const sponsor = await this.sponsorRepository.findOne({ where: { user: { id: userId } } });
    if (!sponsor) {
      throw new NotFoundException(`Sponsor with User ID ${userId} not found`);
    }

    // Update the sponsor with the provided DTO
    this.sponsorRepository.merge(sponsor, updateSponsorDto);
    return this.sponsorRepository.save(sponsor);
  }

  // Add additional information by sponsorId
  async updateBySponsorId(sponsorId: number, updateSponsorDto: CreateSponsorsDtoSid): Promise<Sponsor> {
    // Find the sponsor by its own ID
    const sponsor = await this.sponsorRepository.findOne({ where: { id: sponsorId } });
    if (!sponsor) {
      throw new NotFoundException(`Sponsor with ID ${sponsorId} not found`);
    }

    // Update the sponsor with the provided DTO
    this.sponsorRepository.merge(sponsor, updateSponsorDto);
    return this.sponsorRepository.save(sponsor);
  }

  async findAll(): Promise<Sponsor[]> {
    return this.sponsorRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Sponsor> {
    const sponsor = await this.sponsorRepository.findOne({ where: { id } });
    if (!sponsor) {
      throw new NotFoundException(`Sponsor with ID ${id} not found`);
    }
    return sponsor;
  }

  async remove(id: number): Promise<void> {
    const deleteResult = await this.sponsorRepository.delete(id);
    if (!deleteResult.affected) {
      throw new NotFoundException(`Sponsor with ID ${id} not found`);
    }
  }

  async findByUserId(userId: number): Promise<Sponsor | undefined> {
    return this.sponsorRepository.findOne({ where: { user: { id: userId } } });
  }
}
