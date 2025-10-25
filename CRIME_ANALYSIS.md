# Crime Analysis AI Agent

This document describes the AI agent implementation for extracting crime rate data from external sources, specifically designed to integrate with the loan eligibility assessment system.

## Overview

The Crime Analysis AI Agent is designed to:
- Connect to crimegrade.org and other crime data sources
- Analyze crime grades for specific addresses
- Return standardized crime scores for loan eligibility assessment
- Provide fallback mechanisms for reliable operation

## Architecture

### Core Components

1. **CrimeAnalysisService** (`src/services/CrimeAnalysisService.ts`)
   - Main service class handling crime data analysis
   - Implements web scraping for crimegrade.org
   - Provides geocoding capabilities
   - Includes fallback mechanisms

2. **Updated LoanService** (`src/services/LoanService.ts`)
   - Integrated with CrimeAnalysisService
   - Uses real crime data instead of hardcoded values
   - Maintains backward compatibility

3. **Crime Analysis Routes** (`src/routes/crimeAnalysis.ts`)
   - REST API endpoints for crime analysis
   - Address validation endpoints
   - Swagger documentation included

## API Endpoints

### POST `/crime-analysis`
Analyze crime grade for a given address.

**Request Body:**
```json
{
  "address": "123 Main St, New York, NY 10001"
}
```

**Response:**
```json
{
  "crimeGrade": "B",
  "crimeScore": 75,
  "confidence": 0.8,
  "source": "crimegrade.org",
  "details": {
    "gradeElement": "Grade: B",
    "scoreElement": "Score: 75",
    "crimeStats": "Crime statistics..."
  }
}
```

### POST `/crime-analysis/validate`
Validate address format.

**Request Body:**
```json
{
  "address": "123 Main St, New York, NY 10001"
}
```

**Response:**
```json
{
  "isValid": true,
  "error": null
}
```

## Data Sources

### Primary Source: CrimeGrade.org
- Web scraping using Puppeteer
- Dynamic content extraction
- Real-time crime grade data

### Fallback Sources
- OpenStreetMap Nominatim for geocoding
- Coordinate-based crime analysis
- Default fallback to grade 'F'

## Crime Grade Scale

- **A**: Excellent (90-100 score)
- **B**: Good (80-89 score)
- **C**: Average (70-79 score)
- **D**: Below Average (60-69 score)
- **F**: Poor (0-59 score)

## Integration with Loan Eligibility

The crime analysis is automatically integrated into the loan application process:

1. When a loan application is submitted with a property address
2. The system calls `CrimeAnalysisService.analyzeCrimeForAddress()`
3. The returned crime grade is used in eligibility calculation
4. Applications with grade 'F' are automatically rejected

## Error Handling

The system includes comprehensive error handling:

- **Network timeouts**: 30-second timeout for web requests
- **Invalid addresses**: Validation before processing
- **API failures**: Graceful fallback to alternative methods
- **Scraping failures**: Fallback to coordinate-based analysis
- **Final fallback**: Default to grade 'F' with error logging

## Configuration

### Environment Variables
```bash
# Optional: Add API keys for enhanced services
GOOGLE_MAPS_API_KEY=your_google_maps_key
CRIMEOMETER_API_KEY=your_crimeometer_key
```

### Dependencies
- `axios`: HTTP requests
- `puppeteer`: Web scraping
- `express`: API routes
- `typescript`: Type safety

## Testing

Run the test script to verify functionality:
```bash
npx ts-node test-crime-analysis.ts
```

## Security Considerations

- User-Agent spoofing for web scraping
- Rate limiting to avoid overwhelming external services
- Input validation for all address data
- Error logging without exposing sensitive information

## Performance

- **Caching**: Consider implementing Redis caching for repeated addresses
- **Async Processing**: All operations are asynchronous
- **Timeout Management**: Prevents hanging requests
- **Resource Cleanup**: Proper browser instance cleanup

## Future Enhancements

1. **Caching Layer**: Implement Redis caching for frequently requested addresses
2. **Multiple Data Sources**: Integrate additional crime data APIs
3. **Machine Learning**: Implement ML models for crime prediction
4. **Real-time Updates**: WebSocket support for live crime data
5. **Batch Processing**: Support for analyzing multiple addresses simultaneously

## Monitoring

Monitor the following metrics:
- Success rate of crime grade extraction
- Response times for different data sources
- Error rates and fallback usage
- API rate limit compliance

## Troubleshooting

### Common Issues

1. **Puppeteer Installation**: Ensure Puppeteer is properly installed
2. **Network Issues**: Check firewall settings for external API access
3. **Memory Usage**: Monitor browser instance cleanup
4. **Rate Limiting**: Implement delays between requests if needed

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=crime-analysis:*
```

This implementation provides a robust, scalable solution for crime data analysis that integrates seamlessly with the existing loan eligibility system while maintaining high reliability through multiple fallback mechanisms.
