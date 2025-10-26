import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type LetterGrade =
  | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D+" | "D" | "D-" | "F";

export interface CrimeGradeResult {
  address: string;
  zip?: string;
  overall_grade: LetterGrade;
  components?: {
    violent_crime?: LetterGrade;
    property_crime?: LetterGrade;
  };
  notes?: string;
  evidence?: Array<{ source?: string; snippet: string }>;
}

@Entity('crime_grades')
export class CrimeGrade {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 10 })
  @Index()
  zip_code!: string;

  @Column({ type: 'varchar', length: 255 })
  city!: string;

  @Column({ type: 'varchar', length: 50 })
  state!: string;

  @Column({ type: 'varchar', length: 255 })
  address_example!: string;

  @Column({ type: 'varchar', length: 1 })
  overall_grade!: string;

  @Column({ type: 'varchar', length: 1 })
  violent_crime_grade!: string;

  @Column({ type: 'varchar', length: 1 })
  property_crime_grade!: string;

  @Column({ type: 'decimal', precision: 10, scale: 1 })
  violent_crimes_per_1000!: number;

  @Column({ type: 'decimal', precision: 10, scale: 1 })
  property_crimes_per_1000!: number;

  @Column({ type: 'decimal', precision: 10, scale: 1 })
  total_crimes_per_1000!: number;

  @Column({ type: 'integer' })
  cost_of_crime_per_household_usd!: number;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  confidence!: number;

  @Column({ type: 'varchar', length: 50 })
  retrievedAtUtc!: string;

  @CreateDateColumn()
  createdAt!: Date;
}