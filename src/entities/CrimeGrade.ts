// src/entities/CrimeGrade.ts
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