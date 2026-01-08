import { db } from "./db";
import { azDestinations } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";

async function importAzDestinations() {
  const csvPath = path.join(process.cwd(), "attached_assets", "Codes_2026-01-06T22-03-50_1767830383050.csv");
  
  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found:", csvPath);
    return;
  }

  console.log("Reading CSV file...");
  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split("\n").filter(line => line.trim());
  
  console.log(`Found ${lines.length} lines (including header)`);
  
  const destinations: { code: string; destination: string; region: string | null }[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(",");
    if (parts.length >= 3) {
      const code = parts[0].trim();
      const destination = parts[1].trim();
      const region = parts[2].trim() || null;
      
      if (code && destination) {
        destinations.push({ code, destination, region });
      }
    }
  }

  console.log(`Parsed ${destinations.length} destinations`);

  const existingCount = await db.select().from(azDestinations).limit(1);
  if (existingCount.length > 0) {
    console.log("Destinations already exist in database. Skipping import.");
    console.log("To reimport, first delete all destinations via API.");
    return;
  }

  const batchSize = 500;
  let inserted = 0;

  console.log("Inserting destinations in batches of", batchSize);
  
  for (let i = 0; i < destinations.length; i += batchSize) {
    const batch = destinations.slice(i, i + batchSize);
    await db.insert(azDestinations).values(batch);
    inserted += batch.length;
    console.log(`Inserted ${inserted}/${destinations.length} destinations...`);
  }

  console.log(`Import complete! ${inserted} destinations imported.`);
}

importAzDestinations().catch(console.error);
