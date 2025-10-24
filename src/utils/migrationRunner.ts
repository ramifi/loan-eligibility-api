import { AppDataSource } from '@config/database';

export class MigrationRunner {
  /**
   * Run all pending migrations
   */
  static async runMigrations(): Promise<void> {
    try {
      console.log('Running migrations...');
      const migrations = await AppDataSource.runMigrations();
      
      if (migrations.length === 0) {
        console.log('No pending migrations found.');
      } else {
        console.log(`Successfully ran ${migrations.length} migration(s):`);
        migrations.forEach(migration => {
          console.log(`  - ${migration.name}`);
        });
      }
    } catch (error) {
      console.error('Error running migrations:', error);
      throw error;
    }
  }

  /**
   * Revert the last migration
   */
  static async revertLastMigration(): Promise<void> {
    try {
      console.log('Reverting last migration...');
      await AppDataSource.undoLastMigration();
      console.log('Successfully reverted last migration.');
    } catch (error) {
      console.error('Error reverting migration:', error);
      throw error;
    }
  }

  /**
   * Show migration status
   */
  static async showMigrationStatus(): Promise<void> {
    try {
      const executedMigrations = await AppDataSource.query(
        "SELECT * FROM migrations ORDER BY timestamp DESC"
      );
      
      console.log('Migration Status:');
      if (executedMigrations.length === 0) {
        console.log('  No migrations have been executed.');
      } else {
        executedMigrations.forEach((migration: any) => {
          console.log(`  ✓ ${migration.name} (${new Date(migration.timestamp).toISOString()})`);
        });
      }
    } catch (error) {
      console.error('Error checking migration status:', error);
      throw error;
    }
  }

  /**
   * Check if migrations are needed
   */
  static async needsMigration(): Promise<boolean> {
    try {
      const pendingMigrations = await AppDataSource.showMigrations();
      return pendingMigrations;
    } catch (error) {
      console.error('Error checking pending migrations:', error);
      throw error;
    }
  }
}
