// // src/event-manager/entities/event-manager.entity.ts
// import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
// import { User } from '../../user/entities/user.entity';
// import { EventEntity } from 'src/event/entity/event.entity';

// @Entity('event_managers')
// export class EventManager {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ nullable: true })
//   position: string; // Professional position, e.g., "Senior Manager"

//   @Column({ nullable: true })
//   organization: string; // Associated organization or company

//   @Column({ nullable: true, type: 'text' })
//   bio: string; // Brief biography or description

//   @Column({ nullable: true })
//   specialization: string;

//   @Column({ nullable: true })
//   yearsOfExperience: number;

//   @Column({ nullable: true })
//   profilePicture?: string;

//   @OneToOne(() => User, user => user.eventManager)
//   @JoinColumn()
//   user: User;

//   @OneToMany(() => EventEntity, event => event.eventManager)
//   events: EventEntity[];

// }

// src/event-manager/entity/event-manager.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { EventEntity } from 'src/event/entity/event.entity';

@Entity('event_managers')
export class EventManager {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  organization: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  yearsOfExperience: number;

  @Column({ nullable: true })
  profilePicture?: string;

  @OneToOne(() => User, user => user.eventManager)
  @JoinColumn()
  user: User;

  @OneToMany(() => EventEntity, event => event.eventManager)
  events: EventEntity[];
}