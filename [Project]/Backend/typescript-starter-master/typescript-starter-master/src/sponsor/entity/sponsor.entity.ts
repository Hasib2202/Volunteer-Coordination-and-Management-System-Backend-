import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('sponsor')
export class Sponsor  {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({ nullable: true })
  // experience: string;

  // @Column({ nullable: true })
  // skills: string;

  @Column({ nullable: true })
  companyName?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  sponsorshipAmount?: number;

  @Column({ nullable: true })
  sponsorshipType?: string;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ nullable: true })
  contractUrl?: string;

  @OneToOne(() => User, user => user.sponsor)
  @JoinColumn()
  user: User;
  
}
