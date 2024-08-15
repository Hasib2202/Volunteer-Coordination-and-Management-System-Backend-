// src/volunteer/volunteer.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerService } from './volunteer.service';
import { VolunteerController } from './volunteer.controller';
import { Volunteer } from './entity/volunteer.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Volunteer]), UserModule],
  providers: [VolunteerService],
  controllers: [VolunteerController],
  exports: [VolunteerService]  // Add this line to export the service
})
export class VolunteerModule {}