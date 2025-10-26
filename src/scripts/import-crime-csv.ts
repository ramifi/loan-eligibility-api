import fs from "fs";
import path from "path";
import { DataSource } from "typeorm";
import { CrimeGrade } from "@entities/CrimeGrade";
import { filesPath, filename } from "@config/crimegrade.config";

interface CsvRow {
  zip_code: string;
  city: string;
  state: string;
  address_example: string;
  overall_grade: string;
  violent_crime_grade: string;
  property_crime_grade: string;
  violent_crimes_per_1000: number;
  property_crimes_per_1000: number;
  total_crimes_per_1000: number;
  cost_of_crime_per_household_usd: number;
  confidence: number;
  retrievedAtUtc: string;
}

function parseCsvLine(line: string): CsvRow {
  const values = line.split(",");
  
  return {
    zip_code: values[0] || "",
    city: values[1] || "",
    state: values[2] || "",
    address_example: values[3] || "",
    overall_grade: values[4] || "",
    violent_crime_grade: values[5] || "",
    property_crime_grade: values[6] || "",
    violent_crimes_per_1000: parseFloat(values[7] || "0"),
    property_crimes_per_1000: parseFloat(values[8] || "0"),
    total_crimes_per_1000: parseFloat(values[9] || "0"),
    cost_of_crime_per_household_usd: parseInt(values[10] || "0", 10),
    confidence: parseFloat(values[11] || "0"),
    retrievedAtUtc: values[12] || "",
  };
}

async function importCsvToDb() {
  const dataSource = new DataSource({
    type: "better-sqlite3",
    database: process.env["DATABASE_PATH"] || "db/loan_eligibility.db",
    entities: [CrimeGrade],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log("Database connection established successfully");

    const filePath = path.resolve(filesPath, filename);
    console.log(`Reading CSV file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const csvContent = fs.readFileSync(filePath, "utf-8");
    const lines = csvContent.trim().split("\n");

    if (lines.length < 2) {
      throw new Error("CSV file is empty or has no data rows");
    }

    console.log(`Found ${lines.length - 1} data rows`);

    const repository = dataSource.getRepository(CrimeGrade);

    // Check if table already has data
    const existingCount = await repository.count();
    if (existingCount > 0) {
      console.log(`Warning: Table already contains ${existingCount} rows.`);
      console.log("Clearing existing data...");
      await repository.clear();
    }

    // Batch insert for better performance
    const BATCH_SIZE = 100;
    const rows: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]!.trim();
      if (!line) continue;

      try {
        const row = parseCsvLine(line);
        rows.push(row);
      } catch (error) {
        console.error(`Error parsing line ${i + 1}:`, error);
      }
    }

    console.log(`Importing ${rows.length} rows in batches of ${BATCH_SIZE}...`);

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      
      const entities = batch.map((row) => {
        const crimeGrade = new CrimeGrade();
        crimeGrade.zip_code = row.zip_code;
        crimeGrade.city = row.city;
        crimeGrade.state = row.state;
        crimeGrade.address_example = row.address_example;
        crimeGrade.overall_grade = row.overall_grade;
        crimeGrade.violent_crime_grade = row.violent_crime_grade;
        crimeGrade.property_crime_grade = row.property_crime_grade;
        crimeGrade.violent_crimes_per_1000 = row.violent_crimes_per_1000;
        crimeGrade.property_crimes_per_1000 = row.property_crimes_per_1000;
        crimeGrade.total_crimes_per_1000 = row.total_crimes_per_1000;
        crimeGrade.cost_of_crime_per_household_usd = row.cost_of_crime_per_household_usd;
        crimeGrade.confidence = row.confidence;
        crimeGrade.retrievedAtUtc = row.retrievedAtUtc;
        return crimeGrade;
      });

      await repository.save(entities);
      
      const processed = Math.min(i + BATCH_SIZE, rows.length);
      console.log(`Imported ${processed}/${rows.length} rows...`);
    }

    const totalCount = await repository.count();
    console.log(`\nImport completed successfully!`);
    console.log(`Total records in database: ${totalCount}`);
  } catch (error) {
    console.error("Error during import:", error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log("Database connection closed");
  }
}

// Run the import
importCsvToDb()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
