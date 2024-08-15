import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sponsor } from './entity/sponsor.entity';
import { SponsorService } from './sponsor.service';
import { SponsorController } from './sponsor.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Sponsor]),UserModule],
  providers: [SponsorService],
  controllers: [SponsorController],
  exports: [SponsorService]  // Add this line to export the service
})
export class SponsorModule {}