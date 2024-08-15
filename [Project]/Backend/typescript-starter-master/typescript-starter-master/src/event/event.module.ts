import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventEntity } from './entity/event.entity';
import { EventManager } from '../event-manager/entity/event-manager.entity';
import { User } from 'src/user/entities/user.entity';
import { Volunteer } from 'src/volunteer/entity/volunteer.entity';
import { MailerModule } from 'src/mailer/mailer.module';
import { DocumentModule } from 'src/document/document.module';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, EventManager,User, Volunteer])
  ,MailerModule,DocumentModule],
  providers: [EventService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
