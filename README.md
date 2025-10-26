# Loan Eligibility API

A Node.js TypeScript API for automated loan eligibility assessment that combines traditional financial criteria with AI-powered crime analysis for property addresses.

## Features

- **Automated Loan Eligibility Assessment**: Evaluates loan applications based on credit score, income, and property location safety
- **AI-Powered Crime Analysis**: Uses OpenAI GPT models to analyze crime data for property addresses
- **RESTful API**: Clean, documented API endpoints with Swagger integration
- **Database Persistence**: SQLite database with TypeORM for data management
- **Comprehensive Testing**: Unit tests with Jest for reliable code quality
- **Docker Support**: Containerized deployment for easy scaling

## Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- OpenAI API key (for crime analysis features)

## Quick Start

### Local Development

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd loan-eligibility-api
npm install
```

2. **Set up environment variables:**
Create a `.env` file in the root directory:
```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
PORT=3000
NODE_ENV=development
OPENAI_MODEL=gpt-4o-mini
DATABASE_PATH=db/loan_eligibility.db
```

3. **Run the application:**
```bash
# Development with hot reload
npm run dev:watch

# Or single run
npm run dev
```

4. **Access the API:**
- API: http://localhost:3000
- Swagger Documentation: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/health

### Docker Deployment

1. **Build the Docker image:**
```bash
docker build -t loan-eligibility-api .
```

2. **Run with environment variables:**
```bash
docker run -d \
  --name loan-api \
  -p 3000:3000 \
  -e OPENAI_API_KEY=your_openai_api_key_here \
  -e NODE_ENV=production \
  loan-eligibility-api
```

3. **Or use docker-compose (create docker-compose.yml):**
```yaml
version: '3.8'
services:
  loan-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
    volumes:
      - ./db:/app/db
```

## Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure
- **Unit Tests**: Located in `src/services/__tests__/`
- **Test Framework**: Jest with TypeScript support
- **Coverage**: Comprehensive coverage reporting

## API Endpoints

### Core Endpoints
- `GET /` - API information and status
- `GET /health` - Health check endpoint
- `GET /api-docs` - Swagger API documentation

### Loan Application Endpoints
- `POST /loan/apply` - Submit a new loan application
- `GET /loan/:id` - Retrieve a specific loan application
- `GET /loan` - List all loan applications

### Crime Analysis Endpoints
- `POST /crime-analysis/analyze` - Analyze crime data for an address
- `GET /crime-analysis/:id` - Retrieve crime analysis results

### Agent Endpoints
- `POST /agent/grade-address` - AI-powered address grading

## Architecture & Design Decisions

### Overall Architecture
The application follows a **layered architecture** pattern with clear separation of concerns:

```
┌─────────────────┐
│   Routes Layer  │ ← HTTP request handling, validation
├─────────────────┤
│  Services Layer │ ← Business logic, external API calls
├─────────────────┤
│ Entities Layer  │ ← Data models, database schema
├─────────────────┤
│ Database Layer  │ ← Data persistence (SQLite + TypeORM)
└─────────────────┘
```

### Key Design Decisions

#### 1. **TypeScript for Type Safety**
- **Decision**: Use TypeScript throughout the application
- **Rationale**: Provides compile-time type checking, better IDE support, and reduces runtime errors
- **Implementation**: Strict type definitions for all interfaces, services, and entities

#### 2. **TypeORM for Database Management**
- **Decision**: Use TypeORM as the ORM with SQLite
- **Rationale**: 
  - Type-safe database operations
  - Automatic migration management
  - Entity-based data modeling
  - SQLite for simplicity and portability
- **Implementation**: Entity decorators, repository pattern, automatic migrations

#### 3. **AI Integration for Crime Analysis**
- **Decision**: Integrate OpenAI GPT models for intelligent crime analysis
- **Rationale**: 
  - Provides contextual analysis beyond simple data lookup
  - Can interpret and synthesize multiple data sources
  - Adaptable to different address formats and locations
- **Implementation**: 
  - `AgentService` for OpenAI integration
  - `CrimeAnalysisService` for data processing
  - Structured prompts for consistent output

#### 4. **Service Layer Pattern**
- **Decision**: Implement business logic in dedicated service classes
- **Rationale**:
  - Separation of concerns between HTTP handling and business logic
  - Testable business logic independent of Express
  - Reusable across different route handlers
- **Implementation**: Static methods in service classes (`LoanService`, `AgentService`, `CrimeAnalysisService`)

#### 5. **Comprehensive Error Handling**
- **Decision**: Centralized error handling with custom middleware
- **Rationale**: Consistent error responses, better debugging, graceful failure handling
- **Implementation**: 
  - `errorHandler` middleware for application errors
  - `notFoundHandler` for 404 responses
  - Structured error responses

#### 6. **Docker Containerization**
- **Decision**: Multi-stage Docker build with security considerations
- **Rationale**:
  - Consistent deployment across environments
  - Security hardening with non-root user
  - Optimized image size with Alpine Linux
- **Implementation**:
  - Node.js 20 Alpine base image
  - System dependencies for Puppeteer/Chromium
  - Non-root user execution
  - Health check integration

#### 7. **Testing Strategy**
- **Decision**: Jest-based unit testing with comprehensive coverage
- **Rationale**: 
  - Ensures code reliability and prevents regressions
  - Documents expected behavior
  - Enables confident refactoring
- **Implementation**: 
  - Unit tests for service layer
  - Mock external dependencies
  - Coverage reporting

### Data Flow

1. **Loan Application Flow**:
   ```
   POST /loan/apply → Route Handler → LoanService.calculateEligibility() 
   → AgentService.gradeAddressWithAgent() → OpenAI API → Crime Analysis
   → Eligibility Calculation → Database Storage → Response
   ```

2. **Crime Analysis Flow**:
   ```
   Address Input → AgentService → OpenAI GPT → Crime Data Processing 
   → Structured Grade (A-F) → Response
   ```

### Security Considerations

- **Environment Variables**: Sensitive data (API keys) stored in environment variables
- **Input Validation**: Comprehensive validation of all input data
- **Non-root Docker User**: Container runs as non-privileged user
- **SQL Injection Prevention**: TypeORM provides parameterized queries
- **Error Information**: Sanitized error messages to prevent information leakage

## Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:watch        # Start with hot reload
npm run debug            # Start with debugging enabled

# Building
npm run build            # Compile TypeScript
npm run start            # Start production server
npm run clean            # Clean build artifacts

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues
npm run format           # Format code

# Database
npm run migration:run    # Run database migrations
npm run migration:revert # Revert last migration

# CSV Generation
npm run generate:crime-csv # Generate crime CSV file
```

## CSV Generation Tool

The project includes a command-line script to generate crime analysis CSV files similar to CrimeGrade.org exports.

### Quick Examples

**Single address:**
```bash
npm run generate:crime-csv "123 Main St, New York, NY 10001"
```

**Multiple addresses from file:**
```bash
npm run generate:crime-csv -f sample-addresses.txt -o results.csv
```

For detailed usage, see [CRIME_CSV_GENERATOR.md](./CRIME_CSV_GENERATOR.md).

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | OpenAI API key for crime analysis |
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | development | Environment mode |
| `OPENAI_MODEL` | No | gpt-4o-mini | OpenAI model to use |
| `DATABASE_PATH` | No | db/loan_eligibility.db | SQLite database path |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.