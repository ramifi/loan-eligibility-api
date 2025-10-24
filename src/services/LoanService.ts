import { AppDataSource } from '@config/database';
import { LoanApplication } from '@entities/LoanApplication';

export interface LoanApplicationData {
  applicantName: string;
  propertyAddress: string;
  creditScore: number;
  monthlyIncome: number;
  requestedAmount: number;
  loanTermMonths: number;
}

export interface EligibilityResult {
  eligible: boolean;
  reason: string;
  crimeGrade: string;
}

export class LoanService {
  /**
   * Calculate loan eligibility based on credit score, income, and crime grade
   */
  public static calculateEligibility(data: LoanApplicationData): EligibilityResult {
    // Determine crime grade (hardcoded to F for now as per requirements)
    const crimeGrade = 'F';
    
    // Calculate eligibility based on the rules
    const monthlyPayment = data.requestedAmount / data.loanTermMonths;
    const requiredIncome = monthlyPayment * 1.5;
    
    let eligible = false;
    let reason = '';
    
    if (data.creditScore < 700) {
      reason = 'Credit score too low';
    } else if (data.monthlyIncome <= requiredIncome) {
      reason = 'Monthly income too low';
    } else if (crimeGrade === 'F') {
      reason = 'Crime grade too low';
    } else {
      eligible = true;
      reason = 'Passed all checks';
    }
    
    return {
      eligible,
      reason,
      crimeGrade
    };
  }

  /**
   * Create a new loan application with eligibility evaluation
   */
  public static async createLoanApplication(data: LoanApplicationData): Promise<LoanApplication> {
    const eligibility = this.calculateEligibility(data);
    
    const loanApplication = AppDataSource.getRepository(LoanApplication).create({
      applicantName: data.applicantName,
      propertyAddress: data.propertyAddress,
      creditScore: data.creditScore,
      monthlyIncome: data.monthlyIncome,
      requestedAmount: data.requestedAmount,
      loanTermMonths: data.loanTermMonths,
      eligible: eligibility.eligible,
      reason: eligibility.reason,
      crimeGrade: eligibility.crimeGrade
    });
    
    return await AppDataSource.getRepository(LoanApplication).save(loanApplication);
  }

  /**
   * Get a loan application by ID
   */
  public static async getLoanApplicationById(id: string): Promise<LoanApplication | null> {
    return await AppDataSource.getRepository(LoanApplication).findOne({
      where: { id }
    });
  }

  /**
   * Validate loan application data
   */
  public static validateLoanApplicationData(data: any): { isValid: boolean; error?: string } {
    const { applicantName, propertyAddress, creditScore, monthlyIncome, requestedAmount, loanTermMonths } = data;
    
    if (!applicantName || !propertyAddress || !creditScore || !monthlyIncome || !requestedAmount || !loanTermMonths) {
      return { isValid: false, error: 'All fields are required' };
    }
    
    return { isValid: true };
  }
}
