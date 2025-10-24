# Loan Eligibility API

A Node.js TypeScript API for loan eligibility assessment.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
# Start development server with hot reload
npm run dev:watch

# Or start development server once
npm run dev
```

### Building

```bash
# Build the project
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Project Structure

```
src/
├── index.ts          # Main application entry point
└── ...               # Additional source files
```

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development, production)

## License

MIT
