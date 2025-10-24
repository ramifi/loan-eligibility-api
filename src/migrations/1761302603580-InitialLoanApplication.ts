import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialLoanApplication1761302603580 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "loan_applications" (
            "id" varchar PRIMARY KEY NOT NULL,
            "applicantName" varchar(255) NOT NULL,
            "propertyAddress" varchar(500) NOT NULL,
            "creditScore" integer NOT NULL,
            "monthlyIncome" decimal(10,2) NOT NULL,
            "requestedAmount" decimal(10,2) NOT NULL,
            "loanTermMonths" integer NOT NULL,
            "eligible" boolean NOT NULL,
            "reason" varchar(255) NOT NULL,
            "crimeGrade" varchar(1) NOT NULL,
            "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
            "updatedAt" datetime NOT NULL DEFAULT (datetime('now'))
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "loan_applications"`);
    }

}
