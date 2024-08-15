// src/volunteer/entities/volunteer.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { EventEntity } from 'src/event/entity/event.entity';

@Entity('volunteers')
export class Volunteer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  nickName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  experience: string;

  @Column({ nullable: true })
  skills: string;

  @OneToOne(() => User, user => user.volunteer)
  @JoinColumn()
  user: User;

  @ManyToMany(() => EventEntity, event => event.volunteers)
  events: EventEntity[];
}
