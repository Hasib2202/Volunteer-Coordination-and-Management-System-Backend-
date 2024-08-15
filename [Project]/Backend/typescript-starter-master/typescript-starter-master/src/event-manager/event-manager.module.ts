// src/event-manager/event-manager.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventManager } from "./entity/event-manager.entity";
import { EventManagerService } from "./event-manager.service";
import { EventManagerController } from "./event-manager.controller";
import { UserModule } from "src/user/user.module";
import { VolunteerModule } from "src/volunteer/volunteer.module";
import { SponsorModule } from "src/sponsor/sponsor.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "src/auth/strategies/constants";
import { JwtStrategy } from "src/auth/strategies/jwt.strategy";
import { EventModule } from "src/event/event.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([EventManager]),
        VolunteerModule,
        PassportModule,
        SponsorModule,
        UserModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '60m' },
        }),
        EventModule,
    ],
    providers: [EventManagerService, JwtStrategy],
    controllers: [EventManagerController],
    exports: [EventManagerService],
})
export class EventManagerModule {}