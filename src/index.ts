import 'reflect-metadata';
import express from 'express';
import { initializeDatabase } from '@config/database';
import { MigrationRunner } from './utils/migrationRunner';
import { setupSwagger } from '@config/swagger';
import homeRoutes from './routes/home';
import healthRoutes from './routes/health';
import loanApplicationRoutes from './routes/loanApplications';
import crimeAnalysisRoutes from './routes/crimeAnalysis';
import { errorHandler, notFoundHandler } from './middleware/errorHandlers';

const app = express();
const PORT = process.env['PORT'] || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Swagger documentation
setupSwagger(app);

// Routes
app.use('/', homeRoutes);
app.use('/', healthRoutes);
app.use('/loan', loanApplicationRoutes);
app.use('/crime-analysis', crimeAnalysisRoutes);

// Error handling middleware
app.use(errorHandler);
app.use('*', notFoundHandler);

// Initialize database and start server
const startServer = async (): Promise<void> => {
  try {
    await initializeDatabase();
    
    // Run migrations on startup
    await MigrationRunner.runMigrations();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env['NODE_ENV'] || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
