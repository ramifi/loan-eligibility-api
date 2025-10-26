import { MigrationInterface, QueryRunner } from "typeorm";

export class CrimeGrade1761302603581 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "crime_grades" (
            "id" varchar PRIMARY KEY NOT NULL,
            "zip_code" varchar(10) NOT NULL,
            "city" varchar(255) NOT NULL,
            "state" varchar(50) NOT NULL,
            "address_example" varchar(255) NOT NULL,
            "overall_grade" varchar(1) NOT NULL,
            "violent_crime_grade" varchar(1) NOT NULL,
            "property_crime_grade" varchar(1) NOT NULL,
            "violent_crimes_per_1000" decimal(10,1) NOT NULL,
            "property_crimes_per_1000" decimal(10,1) NOT NULL,
            "total_crimes_per_1000" decimal(10,1) NOT NULL,
            "cost_of_crime_per_household_usd" integer NOT NULL,
            "confidence" decimal(3,2) NOT NULL,
            "retrievedAtUtc" varchar(50) NOT NULL,
            "createdAt" datetime NOT NULL DEFAULT (datetime('now'))
        )`);
        
        await queryRunner.query(`CREATE INDEX "IDX_crime_grades_zip_code" ON "crime_grades" ("zip_code")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_crime_grades_zip_code"`);
        await queryRunner.query(`DROP TABLE "crime_grades"`);
    }

}
