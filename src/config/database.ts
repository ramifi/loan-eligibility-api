import { DataSource } from 'typeorm';
import { LoanApplication } from '@entities/LoanApplication';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env['DATABASE_PATH'] || 'db/loan_eligibility.db',
  synchronize: false, // Disabled in favor of migrations
  logging: process.env['NODE_ENV'] === 'development',
  entities: [LoanApplication],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  subscribers: ['src/subscribers/*.ts'],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
};
