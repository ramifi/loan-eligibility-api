# TypeORM Migrations Guide

This project uses TypeORM migrations to manage database schema changes. Here's how to work with migrations:

## Available Commands

### Generate a new migration
```bash
npm run migration:generate src/migrations/MigrationName
```
This will compare your entities with the current database schema and generate a migration file with the necessary changes.

### Create an empty migration
```bash
npm run migration:create src/migrations/MigrationName
```
This creates an empty migration file that you can manually populate with SQL commands.

### Run migrations
```bash
npm run migration:run
```
Runs all pending migrations in chronological order.

### Revert the last migration
```bash
npm run migration:revert
```
Reverts the most recently executed migration.

### Show migration status
```bash
npm run migration:show
```
Shows which migrations have been executed and which are pending.

## Migration Workflow

1. **Make changes to your entities** - Update your TypeORM entities with new fields, relationships, or constraints.

2. **Generate migration** - Run `npm run migration:generate` to create a migration file with the detected changes.

3. **Review the migration** - Check the generated migration file to ensure it contains the correct SQL commands.

4. **Run the migration** - Execute `npm run migration:run` to apply the changes to your database.

5. **Test your changes** - Verify that your application works correctly with the new schema.

## Important Notes

- **Synchronization is disabled** - The database configuration has `synchronize: false` to ensure all schema changes go through migrations.
- **Migrations run on startup** - The application automatically runs pending migrations when it starts.
- **Production safety** - Always test migrations in a development environment before deploying to production.
- **Backup your data** - Consider backing up your database before running migrations in production.

## Migration Files

Migration files are stored in `src/migrations/` and follow the naming convention:
`{timestamp}-{MigrationName}.ts`

Each migration file contains:
- `up()` method - Contains the SQL commands to apply the migration
- `down()` method - Contains the SQL commands to revert the migration

## Example Migration

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailToUser1234567890123 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "email" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "email"`);
    }
}
```
