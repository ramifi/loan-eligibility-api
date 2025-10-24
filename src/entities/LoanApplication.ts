import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('loan_applications')
export class LoanApplication {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  applicantName!: string;

  @Column({ type: 'varchar', length: 500 })
  propertyAddress!: string;

  @Column({ type: 'int' })
  creditScore!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlyIncome!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  requestedAmount!: number;

  @Column({ type: 'int' })
  loanTermMonths!: number;

  @Column({ type: 'boolean' })
  eligible!: boolean;

  @Column({ type: 'varchar', length: 255 })
  reason!: string;

  @Column({ type: 'varchar', length: 1 })
  crimeGrade!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
