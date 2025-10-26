import fs from "fs";
import path from "path";
import { filesPath, filename } from "../config/crimegrade.config";

type CrimeRow = {
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
};

// A set of real US ZIP codes with matching city/state.
// This is intentionally curated, not scraped.
// You can expand this list with more ZIP/city/state tuples if you want more geographic diversity.
const seedLocations: Array<[string, string, string]> = [
  ["10001", "New York", "NY"],
  ["10002", "New York", "NY"],
  ["10003", "New York", "NY"],
  ["11201", "Brooklyn", "NY"],
  ["11211", "Brooklyn", "NY"],
  ["90001", "Los Angeles", "CA"],
  ["90011", "Los Angeles", "CA"],
  ["94102", "San Francisco", "CA"],
  ["94103", "San Francisco", "CA"],
  ["73301", "Austin", "TX"],
  ["75201", "Dallas", "TX"],
  ["77002", "Houston", "TX"],
  ["33101", "Miami", "FL"],
  ["33132", "Miami", "FL"],
  ["60601", "Chicago", "IL"],
  ["60629", "Chicago", "IL"],
  ["48201", "Detroit", "MI"],
  ["30303", "Atlanta", "GA"],
  ["19104", "Philadelphia", "PA"],
  ["20001", "Washington", "DC"],
  ["02115", "Boston", "MA"],
  ["85001", "Phoenix", "AZ"],
  ["98101", "Seattle", "WA"],
  ["96813", "Honolulu", "HI"],
  ["80202", "Denver", "CO"],
  ["73102", "Oklahoma City", "OK"],
  ["37203", "Nashville", "TN"],
  ["72201", "Little Rock", "AR"],
  ["64106", "Kansas City", "MO"],
  ["45202", "Cincinnati", "OH"],
];

// Street names for realistic address examples.
// These are intentionally generic/common US street names and well-known city streets.
// No guarantee the house number + street exists at that ZIP, which is fine for scoring simulations.
const streetNames = [
  "Main St",
  "Broadway",
  "1st Ave",
  "Elm St",
  "Maple Ave",
  "Pine St",
  "Cedar St",
  "Oak St",
  "Washington Ave",
  "Lexington Ave",
  "Fulton St",
  "Mission St",
  "Collins Ave",
  "Peachtree St NE",
  "Market St",
  "Canal St",
];

// Weighted distribution toward typical mid-range crime grades.
// More C/D than A/F.
const gradeDistribution = [
  "A",
  "B",
  "B",
  "C",
  "C",
  "C",
  "D",
  "D",
  "D",
  "F",
];

function chooseRandom<T>(list: T[]): T {
  const idx = Math.floor(Math.random() * list.length);
  return list[idx]!;
}

function randomHouseNumber(): number {
  // Typical US street addressing range
  return Math.floor(Math.random() * 9999) + 1;
}

function randomGrade(): string {
  return chooseRandom(gradeDistribution);
}

/**
 * Generate numeric crime rates that correlate loosely with the overall grade.
 * Lower grade (worse: F/D) => higher rates.
 * Higher grade (better: A/B) => lower rates.
 */
function generateRatesForGrade(overallGrade: string): {
  violentPer1k: number;
  propertyPer1k: number;
  totalPer1k: number;
  costOfCrime: number;
} {
  // Base ranges by grade
  // These are synthetic and heuristic, not real values.
  // Violent crime per 1,000 people
  const gradeToRange: Record<
    string,
    { violentLow: number; violentHigh: number }
  > = {
    A: { violentLow: 1.0, violentHigh: 5.0 },
    B: { violentLow: 2.0, violentHigh: 10.0 },
    C: { violentLow: 4.0, violentHigh: 20.0 },
    D: { violentLow: 7.0, violentHigh: 35.0 },
    F: { violentLow: 10.0, violentHigh: 50.0 },
  };

  const range = gradeToRange[overallGrade] ?? gradeToRange["C"]!;
  const violentPer1kRaw =
    Math.random() * (range!.violentHigh - range!.violentLow) + range!.violentLow;
  const violentPer1k = Number(violentPer1kRaw.toFixed(1));

  // Property crime rate is usually significantly higher numerically
  const propertyLow = violentPer1k * 2.5;
  const propertyHigh = violentPer1k * 4.0;
  const propertyPer1kRaw =
    Math.random() * (propertyHigh - propertyLow) + propertyLow;
  const propertyPer1k = Number(propertyPer1kRaw.toFixed(1));

  const totalPer1k = Number((violentPer1k + propertyPer1k).toFixed(1));

  // Cost of crime per household (rough synthetic estimate)
  // We make it scale somewhat with total crime rate.
  const costBase =
    300 + totalPer1k * (3 + Math.random() * 5); // ~300-800 typical range
  const costOfCrime = Math.floor(costBase);

  return {
    violentPer1k,
    propertyPer1k,
    totalPer1k,
    costOfCrime,
  };
}

/**
 * Confidence is meant to indicate how close the score resolution is to the address.
 * Since we're assuming direct ZIP match, we keep confidence high.
 */
function generateConfidence(): number {
  const min = 0.8;
  const max = 0.95;
  const value = min + Math.random() * (max - min);
  return Number(value.toFixed(2));
}

function generateOneRow(): CrimeRow {
  const [zip, city, state] = chooseRandom(seedLocations);

  const address_example = `${randomHouseNumber()} ${chooseRandom(
    streetNames
  )}`;

  const overall_grade = randomGrade();
  const violent_crime_grade = randomGrade();
  const property_crime_grade = randomGrade();

  const {
    violentPer1k,
    propertyPer1k,
    totalPer1k,
    costOfCrime,
  } = generateRatesForGrade(overall_grade);

  const confidence = generateConfidence();
  const retrievedAtUtc = new Date().toISOString() + "Z";

  return {
    zip_code: zip,
    city,
    state,
    address_example,
    overall_grade,
    violent_crime_grade,
    property_crime_grade,
    violent_crimes_per_1000: violentPer1k,
    property_crimes_per_1000: propertyPer1k,
    total_crimes_per_1000: totalPer1k,
    cost_of_crime_per_household_usd: costOfCrime,
    confidence,
    retrievedAtUtc,
  };
}

function toCsvLine(row: CrimeRow): string {
  // Naive CSV serialization. All fields here are simple (no commas in ZIP/city/state).
  // If you later add text fields that may contain commas or quotes,
  // you'll want to wrap with quotes and escape correctly.
  return [
    row.zip_code,
    row.city,
    row.state,
    row.address_example,
    row.overall_grade,
    row.violent_crime_grade,
    row.property_crime_grade,
    row.violent_crimes_per_1000.toString(),
    row.property_crimes_per_1000.toString(),
    row.total_crimes_per_1000.toString(),
    row.cost_of_crime_per_household_usd.toString(),
    row.confidence.toString(),
    row.retrievedAtUtc,
  ].join(",");
}

function main() {
  const ROW_COUNT = 5000;
  const outFile = path.resolve(filesPath, filename);

  const header = [
    "zip_code",
    "city",
    "state",
    "address_example",
    "overall_grade",
    "violent_crime_grade",
    "property_crime_grade",
    "violent_crimes_per_1000",
    "property_crimes_per_1000",
    "total_crimes_per_1000",
    "cost_of_crime_per_household_usd",
    "confidence",
    "retrievedAtUtc",
  ].join(",");

  const lines: string[] = [header];

  for (let i = 0; i < ROW_COUNT; i++) {
    const row = generateOneRow();
    lines.push(toCsvLine(row));
  }

  fs.writeFileSync(outFile, lines.join("\n"), { encoding: "utf-8" });

  console.log(`Done. File written to ${outFile} with ${ROW_COUNT} rows.`);
}

main();