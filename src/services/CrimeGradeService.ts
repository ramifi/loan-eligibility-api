import { AppDataSource } from '@config/database';
import { CrimeGrade } from '@entities/CrimeGrade';
import { CrimeGradeResult, LetterGrade } from '@entities/CrimeGrade';

export class CrimeGradeService {
  /**
   * Get crime grade for an address by querying the CrimeGrade database
   */
  public static async getCrimeGradeByAddress(address: string): Promise<CrimeGradeResult> {
    try {
      // Extract zip code from address
      const zipCode = this.extractZipCode(address);
      
      if (!zipCode) {
        throw new Error('Unable to extract zip code from address');
      }

      // Query the database for matching zip code records
      const repository = AppDataSource.getRepository(CrimeGrade);
      const crimeGradeRecords = await repository.find({
        where: { zip_code: zipCode },
        order: { confidence: 'DESC' } // Get the highest confidence record first
      });

      if (!crimeGradeRecords || crimeGradeRecords.length === 0) {
        return this.getDefaultResult(address, zipCode, 'No crime data found for this zip code');
      }

      // Use the record with highest confidence
      const bestRecord = crimeGradeRecords[0];
      
      if (!bestRecord) {
        return this.getDefaultResult(address, zipCode, 'No crime data found for this zip code');
      }

      // Convert database record to CrimeGradeResult format
      return {
        address: address,
        zip: zipCode,
        overall_grade: bestRecord.overall_grade as LetterGrade,
        components: {
          violent_crime: bestRecord.violent_crime_grade as LetterGrade,
          property_crime: bestRecord.property_crime_grade as LetterGrade,
        },
        notes: `Crime data for ${bestRecord.city}, ${bestRecord.state} (Zip: ${zipCode}). Confidence: ${(bestRecord.confidence * 100).toFixed(1)}%`,
        evidence: [
          {
            source: 'CrimeGrade Database',
            snippet: `Violent crimes: ${bestRecord.violent_crimes_per_1000} per 1,000 residents. Property crimes: ${bestRecord.property_crimes_per_1000} per 1,000 residents. Total: ${bestRecord.total_crimes_per_1000} per 1,000 residents.`,
          },
        ],
      };
    } catch (error) {
      console.error('Error getting crime grade by address:', error);
      return this.getDefaultResult(address, undefined, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Extract zip code from an address string
   * Handles various formats like "123 Main St, New York, NY 10001" or "10001"
   */
  private static extractZipCode(address: string): string | null {
    // Try to match 5-digit zip code pattern
    const zipCodeRegex = /\b(\d{5})\b/;
    const match = address.match(zipCodeRegex);
    
    if (match && match[1]) {
      return match[1];
    }

    // Try to match 5-digit zip code followed by optional 4-digit extension (e.g., "10001-1234")
    const extendedZipRegex = /\b(\d{5})(?:-\d{4})?\b/;
    const extendedMatch = address.match(extendedZipRegex);
    
    if (extendedMatch && extendedMatch[1]) {
      return extendedMatch[1];
    }

    return null;
  }

  /**
   * Get default result when no data is found or an error occurs
   */
  private static getDefaultResult(address: string, zip: string | undefined, reason?: string): CrimeGradeResult {
    return {
      address: address,
      ...(zip && { zip }),
      overall_grade: 'F' as LetterGrade,
      notes: reason || 'Unable to determine crime grade',
    };
  }

  /**
   * Get crime grade by zip code directly
   */
  public static async getCrimeGradeByZipCode(zipCode: string): Promise<CrimeGradeResult | null> {
    try {
      const repository = AppDataSource.getRepository(CrimeGrade);
      const crimeGradeRecord = await repository.findOne({
        where: { zip_code: zipCode },
        order: { confidence: 'DESC' },
      });

      if (!crimeGradeRecord) {
        return null;
      }

      return {
        address: crimeGradeRecord.address_example,
        zip: zipCode,
        overall_grade: crimeGradeRecord.overall_grade as LetterGrade,
        components: {
          violent_crime: crimeGradeRecord.violent_crime_grade as LetterGrade,
          property_crime: crimeGradeRecord.property_crime_grade as LetterGrade,
        },
        notes: `Crime data for ${crimeGradeRecord.city}, ${crimeGradeRecord.state} (Zip: ${zipCode}). Confidence: ${(crimeGradeRecord.confidence * 100).toFixed(1)}%`,
        evidence: [
          {
            source: 'CrimeGrade Database',
            snippet: `Violent crimes: ${crimeGradeRecord.violent_crimes_per_1000} per 1,000 residents. Property crimes: ${crimeGradeRecord.property_crimes_per_1000} per 1,000 residents. Total: ${crimeGradeRecord.total_crimes_per_1000} per 1,000 residents.`,
          },
        ],
      };
    } catch (error) {
      console.error('Error getting crime grade by zip code:', error);
      return null;
    }
  }

  /**
   * Get all crime grade records for a zip code
   */
  public static async getAllCrimeGradesByZipCode(zipCode: string): Promise<CrimeGrade[]> {
    try {
      const repository = AppDataSource.getRepository(CrimeGrade);
      return await repository.find({
        where: { zip_code: zipCode },
        order: { confidence: 'DESC' },
      });
    } catch (error) {
      console.error('Error getting all crime grades by zip code:', error);
      return [];
    }
  }
}
