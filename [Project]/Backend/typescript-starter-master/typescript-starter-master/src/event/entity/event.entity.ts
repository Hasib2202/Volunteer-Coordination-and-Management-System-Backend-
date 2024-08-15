
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { EventManager } from '../../event-manager/entity/event-manager.entity';
import { Volunteer } from 'src/volunteer/entity/volunteer.entity';
import { DocumentEntity } from 'src/document/document.entity';

export enum EventStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}
@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  date: Date;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.PENDING,
  })
  status: EventStatus;

  @Column({ nullable: true })
  progressNote?: string;

  @Column('json', { nullable: true })
  progress: {
    volunteers: number;
    documents: number;
    overall: number;
  };

  @Column({ default: 0 })
  totalVolunteers: number;

  @Column({ default: 0 })
  totalDocuments: number;

  @ManyToOne(() => EventManager, (eventManager) => eventManager.events)
  @JoinColumn({ name: 'eventManagerId' }) // This should match your foreign key column in the DB
  eventManager: EventManager;

  @ManyToMany(() => Volunteer, volunteer => volunteer.events)
  @JoinTable()
  volunteers: Volunteer[];

  @OneToMany(() => DocumentEntity, document => document.event)
  documents: DocumentEntity[];
  
}