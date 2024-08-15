// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { VolunteerModule } from '../volunteer/volunteer.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { jwtConstants } from './strategies/constants';
import { EventManagerModule } from 'src/event-manager/event-manager.module';
import { SponsorModule } from 'src/sponsor/sponsor.module';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [
    UserModule,
    VolunteerModule,
    EventManagerModule,
    SponsorModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60m' },
    }),
    MailerModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}