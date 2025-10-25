import axios from 'axios';
import puppeteer from 'puppeteer';

export enum CrimeGrade {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  F = 'F'
}

export interface CrimeAnalysisResult {
  crimeGrade: string;
  crimeScore: number;
  confidence: number;
  source: string;
  details?: any;
  error?: string;
}

export interface AddressGeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export class CrimeAnalysisService {
  private static readonly CRIMEGRADE_BASE_URL = process.env['CRIMEGRADE_BASE_URL'] || 'https://www.crimegrade.org';
  
  /**
   * Main method to analyze crime for a given address
   */
  public static async analyzeCrimeForAddress(address: string): Promise<CrimeAnalysisResult> {
    try {
      // First try CrimeGrade.org (primary source)
      const crimeGradeResult = await this.getCrimeGradeFromWebsite(address);
      if (crimeGradeResult && !crimeGradeResult.error) {
        return crimeGradeResult;
      }
      
      // Fallback to alternative methods
      console.warn('CrimeGrade.org failed, trying alternative methods...');
      
      // Try geocoding and alternative data sources
      const geocodeResult = await this.geocodeAddress(address);
      if (geocodeResult) {
        return await this.getCrimeDataFromCoordinates(geocodeResult.latitude, geocodeResult.longitude);
      }
      
      // Final fallback - return default grade
      return {
        crimeGrade: 'F',
        crimeScore: 0,
        confidence: 0,
        source: 'fallback',
        error: 'Unable to determine crime grade for address'
      };
      
    } catch (error) {
      console.error('Error analyzing crime for address:', error);
      return {
        crimeGrade: 'F',
        crimeScore: 0,
        confidence: 0,
        source: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Scrape crime grade from CrimeGrade.org website
   */
  private static async getCrimeGradeFromWebsite(address: string): Promise<CrimeAnalysisResult | null> {
    try {
      // Use Puppeteer for dynamic content
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to CrimeGrade.org search
      const searchUrl = `${this.CRIMEGRADE_BASE_URL}/search?q=${encodeURIComponent(address)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Extract crime grade information
      const crimeData = await page.evaluate(() => {
        // Look for crime grade elements
        const gradeElement = document.querySelector('[class*="grade"], [class*="score"], [class*="rating"]');
        const scoreElement = document.querySelector('[class*="score"]');
        const crimeStats = document.querySelector('[class*="crime"], [class*="stat"]');
        
        let grade = 'F';
        let score = 0;
        let confidence = 0.5;
        
        if (gradeElement) {
          const gradeText = gradeElement.textContent?.trim() || '';
          const gradeMatch = gradeText.match(/[A-F]/);
          if (gradeMatch) {
            grade = gradeMatch[0];
            confidence = 0.8;
          }
        }
        
        if (scoreElement) {
          const scoreText = scoreElement.textContent?.trim() || '';
          const scoreMatch = scoreText.match(/\d+/);
          if (scoreMatch) {
            score = parseInt(scoreMatch[0]);
          }
        }
        
        return {
          grade,
          score,
          confidence,
          details: {
            gradeElement: gradeElement?.textContent,
            scoreElement: scoreElement?.textContent,
            crimeStats: crimeStats?.textContent
          }
        };
      });
      
      await browser.close();
      
      return {
        crimeGrade: crimeData.grade,
        crimeScore: crimeData.score,
        confidence: crimeData.confidence,
        source: 'crimegrade.org',
        details: crimeData.details
      };
      
    } catch (error) {
      console.error('Error scraping CrimeGrade.org:', error);
      return null;
    }
  }

  /**
   * Geocode an address to get coordinates
   */
  private static async geocodeAddress(address: string): Promise<AddressGeocodeResult | null> {
    try {
      // Using a free geocoding service (you can replace with Google Maps API if needed)
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: address,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'LoanEligibilityAPI/1.0'
        }
      });
      
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          formattedAddress: result.display_name,
          city: result.address?.city || result.address?.town,
          state: result.address?.state,
          zipCode: result.address?.postcode
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  /**
   * Get crime data from coordinates using alternative sources
   */
  private static async getCrimeDataFromCoordinates(lat: number, lon: number): Promise<CrimeAnalysisResult> {
    try {
      // This is a placeholder for alternative crime data sources
      // You can integrate with CrimeoMeter API or other services here
      
      // For now, return a calculated grade based on general area patterns
      const crimeScore = await this.calculateCrimeScoreFromLocation(lat, lon);
      
      return {
        crimeGrade: this.scoreToGrade(crimeScore),
        crimeScore,
        confidence: 0.6,
        source: 'coordinates-analysis',
        details: { latitude: lat, longitude: lon }
      };
      
    } catch (error) {
      console.error('Error getting crime data from coordinates:', error);
      return {
        crimeGrade: 'F',
        crimeScore: 0,
        confidence: 0,
        source: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Calculate crime score based on location patterns
   * This is a simplified algorithm - in production you'd use real crime data
   */
  private static async calculateCrimeScoreFromLocation(lat: number, lon: number): Promise<number> {
    // This is a placeholder implementation
    // In a real implementation, you would:
    // 1. Query crime databases for the area
    // 2. Analyze crime frequency and severity
    // 3. Calculate a weighted score
    
    // For demonstration, using a simple algorithm based on location
    const baseScore = 50; // Base score
    const latVariation = Math.abs(lat - 40.7128) * 10; // Distance from NYC
    const lonVariation = Math.abs(lon + 74.0060) * 10; // Distance from NYC
    
    const score = Math.max(0, Math.min(100, baseScore + latVariation + lonVariation));
    return Math.round(score);
  }

  /**
   * Convert numeric score to letter grade
   */
  private static scoreToGrade(score: number): string {
    if (score >= 90) return CrimeGrade.A;
    if (score >= 80) return CrimeGrade.B;
    if (score >= 70) return CrimeGrade.C;
    if (score >= 60) return CrimeGrade.D;
    return CrimeGrade.F;
  }

  /**
   * Validate address format
   */
  public static validateAddress(address: string): { isValid: boolean; error?: string } {
    if (!address || address.trim().length === 0) {
      return { isValid: false, error: 'Address is required' };
    }
    
    if (address.trim().length < 5) {
      return { isValid: false, error: 'Address is too short' };
    }
    
    return { isValid: true };
  }
}
