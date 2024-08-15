// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { VolunteerModule } from './volunteer/volunteer.module';
import { EventManagerModule } from './event-manager/event-manager.module';
import { SponsorModule } from './sponsor/sponsor.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'hasib',
      database: 'project', 
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    VolunteerModule,
    EventManagerModule,
    SponsorModule,
    EventModule
  ],
})
export class AppModule {}