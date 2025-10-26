import 'reflect-metadata';

import { CrimeGradeService } from '@services/CrimeGradeService';
import { CrimeGrade } from '@entities/CrimeGrade';
import { AppDataSource } from '@config/database';

// Mock the database
jest.mock('@config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

// Mock repository
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockGetRepository = AppDataSource.getRepository as jest.MockedFunction<typeof AppDataSource.getRepository>;

describe('CrimeGradeService', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRepository.mockReturnValue(mockRepository as any);
    // Suppress console.error for tests
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restore console.error
    console.error = originalConsoleError;
  });

  describe('getCrimeGradeByAddress', () => {
    it('should extract zip code and return crime grade result', async () => {
      // Arrange
      const address = '123 Main St, New York, NY 10001';
      const mockCrimeGrade: CrimeGrade = {
        id: '1',
        zip_code: '10001',
        city: 'New York',
        state: 'NY',
        address_example: '123 Main St',
        overall_grade: 'A',
        violent_crime_grade: 'A',
        property_crime_grade: 'A',
        violent_crimes_per_1000: 5.5,
        property_crimes_per_1000: 15.2,
        total_crimes_per_1000: 20.7,
        cost_of_crime_per_household_usd: 500,
        confidence: 0.95,
        retrievedAtUtc: '2025-01-01T00:00:00Z',
        createdAt: new Date(),
      };

      mockRepository.find.mockResolvedValue([mockCrimeGrade]);

      // Act
      const result = await CrimeGradeService.getCrimeGradeByAddress(address);

      // Assert
      expect(result.address).toBe(address);
      expect(result.zip).toBe('10001');
      expect(result.overall_grade).toBe('A');
      expect(result.components?.violent_crime).toBe('A');
      expect(result.components?.property_crime).toBe('A');
      expect(result.notes).toContain('New York');
      expect(result.evidence).toBeDefined();
    });

    it('should handle addresses with 9-digit zip codes', async () => {
      // Arrange
      const address = '456 Oak Ave, Chicago, IL 60601-1234';
      const mockCrimeGrade: CrimeGrade = {
        id: '2',
        zip_code: '60601',
        city: 'Chicago',
        state: 'IL',
        address_example: '456 Oak Ave',
        overall_grade: 'B',
        violent_crime_grade: 'B',
        property_crime_grade: 'B',
        violent_crimes_per_1000: 8.0,
        property_crimes_per_1000: 22.0,
        total_crimes_per_1000: 30.0,
        cost_of_crime_per_household_usd: 600,
        confidence: 0.92,
        retrievedAtUtc: '2025-01-01T00:00:00Z',
        createdAt: new Date(),
      };

      mockRepository.find.mockResolvedValue([mockCrimeGrade]);

      // Act
      const result = await CrimeGradeService.getCrimeGradeByAddress(address);

      // Assert
      expect(result.zip).toBe('60601');
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { zip_code: '60601' },
        order: { confidence: 'DESC' },
      });
    });

    it('should return default result when no data found', async () => {
      // Arrange
      const address = '999 Fake St, Nowhere, XX 99999';
      mockRepository.find.mockResolvedValue([]);

      // Act
      const result = await CrimeGradeService.getCrimeGradeByAddress(address);

      // Assert
      expect(result.overall_grade).toBe('F');
      expect(result.notes).toContain('No crime data found');
    });

    it('should return default result when zip code cannot be extracted', async () => {
      // Arrange
      const address = 'Invalid Address Without Zip Code';

      // Act
      const result = await CrimeGradeService.getCrimeGradeByAddress(address);

      // Assert
      expect(result.overall_grade).toBe('F');
      expect(result.notes).toContain('Unable to extract zip code');
    });

    it('should handle multiple records and select highest confidence', async () => {
      // Arrange
      const address = '789 Pine St, Detroit, MI 48201';
      const mockLowConfidenceGrade: CrimeGrade = {
        id: '1',
        zip_code: '48201',
        city: 'Detroit',
        state: 'MI',
        address_example: '789 Pine St',
        overall_grade: 'C',
        violent_crime_grade: 'C',
        property_crime_grade: 'C',
        violent_crimes_per_1000: 10.0,
        property_crimes_per_1000: 30.0,
        total_crimes_per_1000: 40.0,
        cost_of_crime_per_household_usd: 700,
        confidence: 0.80,
        retrievedAtUtc: '2025-01-01T00:00:00Z',
        createdAt: new Date(),
      };

      const mockHighConfidenceGrade: CrimeGrade = {
        id: '2',
        zip_code: '48201',
        city: 'Detroit',
        state: 'MI',
        address_example: '789 Pine St',
        overall_grade: 'B',
        violent_crime_grade: 'B',
        property_crime_grade: 'B',
        violent_crimes_per_1000: 8.0,
        property_crimes_per_1000: 25.0,
        total_crimes_per_1000: 33.0,
        cost_of_crime_per_household_usd: 650,
        confidence: 0.95,
        retrievedAtUtc: '2025-01-01T00:00:00Z',
        createdAt: new Date(),
      };

      mockRepository.find.mockResolvedValue([mockHighConfidenceGrade, mockLowConfidenceGrade]);

      // Act
      const result = await CrimeGradeService.getCrimeGradeByAddress(address);

      // Assert
      expect(result.overall_grade).toBe('B');
      expect(result.components?.violent_crime).toBe('B');
    });

    it('should handle addresses with just a zip code', async () => {
      // Arrange
      const address = '10001';
      const mockCrimeGrade: CrimeGrade = {
        id: '1',
        zip_code: '10001',
        city: 'New York',
        state: 'NY',
        address_example: '123 Main St',
        overall_grade: 'A',
        violent_crime_grade: 'A',
        property_crime_grade: 'A',
        violent_crimes_per_1000: 5.5,
        property_crimes_per_1000: 15.2,
        total_crimes_per_1000: 20.7,
        cost_of_crime_per_household_usd: 500,
        confidence: 0.95,
        retrievedAtUtc: '2025-01-01T00:00:00Z',
        createdAt: new Date(),
      };

      mockRepository.find.mockResolvedValue([mockCrimeGrade]);

      // Act
      const result = await CrimeGradeService.getCrimeGradeByAddress(address);

      // Assert
      expect(result.zip).toBe('10001');
    });
  });

  describe('getCrimeGradeByZipCode', () => {
    it('should return crime grade result for valid zip code', async () => {
      // Arrange
      const zipCode = '10001';
      const mockCrimeGrade: CrimeGrade = {
        id: '1',
        zip_code: '10001',
        city: 'New York',
        state: 'NY',
        address_example: '123 Main St',
        overall_grade: 'A',
        violent_crime_grade: 'A',
        property_crime_grade: 'A',
        violent_crimes_per_1000: 5.5,
        property_crimes_per_1000: 15.2,
        total_crimes_per_1000: 20.7,
        cost_of_crime_per_household_usd: 500,
        confidence: 0.95,
        retrievedAtUtc: '2025-01-01T00:00:00Z',
        createdAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockCrimeGrade);

      // Act
      const result = await CrimeGradeService.getCrimeGradeByZipCode(zipCode);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.zip).toBe('10001');
      expect(result!.overall_grade).toBe('A');
    });

    it('should return null for non-existent zip code', async () => {
      // Arrange
      const zipCode = '99999';
      mockRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await CrimeGradeService.getCrimeGradeByZipCode(zipCode);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getAllCrimeGradesByZipCode', () => {
    it('should return all crime grade records for a zip code', async () => {
      // Arrange
      const zipCode = '10001';
      const mockCrimeGrades: CrimeGrade[] = [
        {
          id: '1',
          zip_code: '10001',
          city: 'New York',
          state: 'NY',
          address_example: '123 Main St',
          overall_grade: 'A',
          violent_crime_grade: 'A',
          property_crime_grade: 'A',
          violent_crimes_per_1000: 5.5,
          property_crimes_per_1000: 15.2,
          total_crimes_per_1000: 20.7,
          cost_of_crime_per_household_usd: 500,
          confidence: 0.95,
          retrievedAtUtc: '2025-01-01T00:00:00Z',
          createdAt: new Date(),
        },
        {
          id: '2',
          zip_code: '10001',
          city: 'New York',
          state: 'NY',
          address_example: '456 Broadway',
          overall_grade: 'B',
          violent_crime_grade: 'B',
          property_crime_grade: 'B',
          violent_crimes_per_1000: 8.0,
          property_crimes_per_1000: 20.0,
          total_crimes_per_1000: 28.0,
          cost_of_crime_per_household_usd: 600,
          confidence: 0.85,
          retrievedAtUtc: '2025-01-01T00:00:00Z',
          createdAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(mockCrimeGrades);

      // Act
      const result = await CrimeGradeService.getAllCrimeGradesByZipCode(zipCode);

      // Assert
      expect(result).toHaveLength(2);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { zip_code: zipCode },
        order: { confidence: 'DESC' },
      });
    });

    it('should return empty array for non-existent zip code', async () => {
      // Arrange
      const zipCode = '99999';
      mockRepository.find.mockResolvedValue([]);

      // Act
      const result = await CrimeGradeService.getAllCrimeGradesByZipCode(zipCode);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
