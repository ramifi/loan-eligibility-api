import { LoanService, LoanApplicationData } from '../LoanService';
import { gradeAddressWithAgent } from '../AgentService';

// Mock the AgentService
jest.mock('../AgentService', () => ({
  gradeAddressWithAgent: jest.fn(),
}));

// Mock the database
jest.mock('@config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(() => ({
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    })),
  },
}));

const mockGradeAddressWithAgent = gradeAddressWithAgent as jest.MockedFunction<typeof gradeAddressWithAgent>;

describe('LoanService Eligibility Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateEligibility', () => {
    const baseLoanData: LoanApplicationData = {
      applicantName: 'John Doe',
      propertyAddress: '123 Main St, Anytown, USA',
      creditScore: 750,
      monthlyIncome: 5000,
      requestedAmount: 200000,
      loanTermMonths: 360,
    };

    it('should reject application when credit score is below 700', async () => {
      // Arrange
      const loanData = { ...baseLoanData, creditScore: 650 };
      mockGradeAddressWithAgent.mockResolvedValue({
        address: '123 Main St, Anytown, USA',
        overall_grade: 'A',
      });

      // Act
      const result = await LoanService.calculateEligibility(loanData);

      // Assert
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('Credit score too low');
      expect(result.crimeGrade).toBe('A');
    });

    it('should reject application when monthly income is too low relative to payment', async () => {
      // Arrange
      const loanData = { ...baseLoanData, monthlyIncome: 200 }; // Very low income
      mockGradeAddressWithAgent.mockResolvedValue({
        address: '123 Main St, Anytown, USA',
        overall_grade: 'A',
      });

      // Act
      const result = await LoanService.calculateEligibility(loanData);

      // Assert
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('Monthly income too low');
      expect(result.crimeGrade).toBe('A');
      
      // Verify the income calculation: monthlyPayment = 200000/360 = 555.56
      // requiredIncome = 555.56 * 1.5 = 833.33
      // 200 <= 833.33, so should be rejected
    });

    it('should reject application when crime grade is F', async () => {
      // Arrange
      const loanData = { ...baseLoanData };
      mockGradeAddressWithAgent.mockResolvedValue({
        address: '123 Main St, Anytown, USA',
        overall_grade: 'F',
      });

      // Act
      const result = await LoanService.calculateEligibility(loanData);

      // Assert
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('Crime grade too low');
      expect(result.crimeGrade).toBe('F');
    });

    it('should approve application when all criteria are met', async () => {
      // Arrange
      const loanData = { ...baseLoanData };
      mockGradeAddressWithAgent.mockResolvedValue({
        address: '123 Main St, Anytown, USA',
        overall_grade: 'A',
      });

      // Act
      const result = await LoanService.calculateEligibility(loanData);

      // Assert
      expect(result.eligible).toBe(true);
      expect(result.reason).toBe('Passed all checks');
      expect(result.crimeGrade).toBe('A');
    });

    it('should approve application with minimum qualifying credit score (700)', async () => {
      // Arrange
      const loanData = { ...baseLoanData, creditScore: 700 };
      mockGradeAddressWithAgent.mockResolvedValue({
        address: '123 Main St, Anytown, USA',
        overall_grade: 'B',
      });

      // Act
      const result = await LoanService.calculateEligibility(loanData);

      // Assert
      expect(result.eligible).toBe(true);
      expect(result.reason).toBe('Passed all checks');
      expect(result.crimeGrade).toBe('B');
    });

    it('should approve application with minimum qualifying income', async () => {
      // Arrange
      // monthlyPayment = 200000/360 = 555.56
      // requiredIncome = 555.56 * 1.5 = 833.33
      // So monthlyIncome should be > 833.33
      const loanData = { ...baseLoanData, monthlyIncome: 834 };
      mockGradeAddressWithAgent.mockResolvedValue({
        address: '123 Main St, Anytown, USA',
        overall_grade: 'C',
      });

      // Act
      const result = await LoanService.calculateEligibility(loanData);

      // Assert
      expect(result.eligible).toBe(true);
      expect(result.reason).toBe('Passed all checks');
      expect(result.crimeGrade).toBe('C');
    });

    it('should reject application with income exactly at required threshold', async () => {
      // Arrange
      // monthlyPayment = 200000/360 = 555.56
      // requiredIncome = 555.56 * 1.5 = 833.33
      const loanData = { ...baseLoanData, monthlyIncome: 833.33 };
      mockGradeAddressWithAgent.mockResolvedValue({
        address: '123 Main St, Anytown, USA',
        overall_grade: 'A',
      });

      // Act
      const result = await LoanService.calculateEligibility(loanData);

      // Assert
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('Monthly income too low');
      expect(result.crimeGrade).toBe('A');
    });

    it('should handle different loan terms correctly', async () => {
      // Arrange - Test with shorter loan term (higher monthly payment)
      const loanData = { ...baseLoanData, loanTermMonths: 180 }; // 15 years
      mockGradeAddressWithAgent.mockResolvedValue({
        address: '123 Main St, Anytown, USA',
        overall_grade: 'A',
      });

      // Act
      const result = await LoanService.calculateEligibility(loanData);

      // Assert
      // monthlyPayment = 200000/180 = 1111.11
      // requiredIncome = 1111.11 * 1.5 = 1666.67
      // 5000 > 1666.67, so should be approved
      expect(result.eligible).toBe(true);
      expect(result.reason).toBe('Passed all checks');
    });

    it('should handle different crime grades correctly', async () => {
      // Test various crime grades that should be approved
      const approvedGrades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-'];
      
      for (const grade of approvedGrades) {
        // Arrange
        const loanData = { ...baseLoanData };
        mockGradeAddressWithAgent.mockResolvedValue({
          address: '123 Main St, Anytown, USA',
          overall_grade: grade as any,
        });

        // Act
        const result = await LoanService.calculateEligibility(loanData);

        // Assert
        expect(result.eligible).toBe(true);
        expect(result.reason).toBe('Passed all checks');
        expect(result.crimeGrade).toBe(grade);
      }
    });

    it('should prioritize credit score check over income check', async () => {
      // Arrange - Low credit score AND low income
      const loanData = { 
        ...baseLoanData, 
        creditScore: 650,  // Below 700
        monthlyIncome: 200 // Also below required income
      };
      mockGradeAddressWithAgent.mockResolvedValue({
        address: '123 Main St, Anytown, USA',
        overall_grade: 'A',
      });

      // Act
      const result = await LoanService.calculateEligibility(loanData);

      // Assert
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('Credit score too low'); // Should fail on credit score first
    });

    it('should prioritize income check over crime grade check', async () => {
      // Arrange - Low income AND F crime grade
      const loanData = { 
        ...baseLoanData, 
        monthlyIncome: 200 // Below required income
      };
      mockGradeAddressWithAgent.mockResolvedValue({
        address: '123 Main St, Anytown, USA',
        overall_grade: 'F',
      });

      // Act
      const result = await LoanService.calculateEligibility(loanData);

      // Assert
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('Monthly income too low'); // Should fail on income first
    });
  });

  describe('validateLoanApplicationData', () => {
    it('should validate complete loan application data', () => {
      // Arrange
      const validData = {
        applicantName: 'John Doe',
        propertyAddress: '123 Main St, Anytown, USA',
        creditScore: 750,
        monthlyIncome: 5000,
        requestedAmount: 200000,
        loanTermMonths: 360,
      };

      // Act
      const result = LoanService.validateLoanApplicationData(validData);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject incomplete loan application data', () => {
      // Arrange
      const invalidData = {
        applicantName: 'John Doe',
        // Missing other required fields
      };

      // Act
      const result = LoanService.validateLoanApplicationData(invalidData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('All fields are required');
    });

    it('should reject loan application data with empty strings', () => {
      // Arrange
      const invalidData = {
        applicantName: '',
        propertyAddress: '123 Main St, Anytown, USA',
        creditScore: 750,
        monthlyIncome: 5000,
        requestedAmount: 200000,
        loanTermMonths: 360,
      };

      // Act
      const result = LoanService.validateLoanApplicationData(invalidData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('All fields are required');
    });

    it('should reject loan application data with zero values', () => {
      // Arrange
      const invalidData = {
        applicantName: 'John Doe',
        propertyAddress: '123 Main St, Anytown, USA',
        creditScore: 0, // Zero credit score
        monthlyIncome: 5000,
        requestedAmount: 200000,
        loanTermMonths: 360,
      };

      // Act
      const result = LoanService.validateLoanApplicationData(invalidData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('All fields are required');
    });
  });
});
