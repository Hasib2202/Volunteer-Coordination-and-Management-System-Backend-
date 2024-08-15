/// src/user/entities/user.entity.ts
import { EventManager } from 'src/event-manager/entity/event-manager.entity';
import { EventEntity } from 'src/event/entity/event.entity';
import { Sponsor } from 'src/sponsor/entity/sponsor.entity';
import { Volunteer } from 'src/volunteer/entity/volunteer.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany } from 'typeorm';

export enum UserRole {
  ADMIN = 'Admin',
  EVENT_MANAGER = 'Event_Manager',
  VOLUNTEER = 'Volunteer',
  SPONSOR = 'Sponsor',
}

export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  userEmail: string;

  @Column()
  password: string;

  @Column()
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ 
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  isActive: UserStatus;

  @OneToOne(() => Volunteer, volunteer => volunteer.user)
  volunteer: Volunteer;

  @OneToOne(() => EventManager, eventManager => eventManager.user)
  eventManager: EventManager;

  @OneToOne(() => Sponsor, sponsor => sponsor.user)
  sponsor: Sponsor;

  // @OneToMany(() => EventEntity, event => event.user)
  // events: EventEntity[];

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date;;
}