// CLI script to import HM Land Registry Price Paid CSV data into PostgreSQL.
// Usage: tsx scripts/importPriceData.ts <path-to-csv>
//
// Supports both named-column and positional CSVs. Imports in batches of 500
// for performance, falling back to individual inserts on duplicate key conflicts.
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CsvRow {
  [key: string]: string;
}

interface PropertyRecord {
  transactionId: string;
  price: number;
  transferDate: Date;
  postcode: string;
  propertyType: string;
  newBuild: boolean;
  tenure: string;
  street: string;
  townCity: string;
  district: string;
  county: string;
}

const BATCH_SIZE = 500;

function parseRow(row: CsvRow, headers: string[]): PropertyRecord | null {
  try {
    let transactionId: string;
    let price: number;
    let dateStr: string;
    let postcode: string;
    let propertyType: string;
    let oldNew: string;
    let duration: string;
    let street: string;
    let townCity: string;
    let district: string;
    let county: string;

    if (row['transaction_id'] || row['Transaction unique identifier']) {
      transactionId = (row['transaction_id'] || row['Transaction unique identifier'] || '').replace(/[{}]/g, '');
      price = parseInt(row['price'] || row['Price'] || '0', 10);
      dateStr = row['date_of_transfer'] || row['Date of Transfer'] || '';
      postcode = row['postcode'] || row['Postcode'] || '';
      propertyType = row['property_type'] || row['Property Type'] || 'O';
      oldNew = row['old_new'] || row['Old/New'] || 'N';
      duration = row['duration'] || row['Duration'] || 'F';
      street = row['street'] || row['Street'] || '';
      townCity = row['town_city'] || row['Town/City'] || '';
      district = row['district'] || row['District'] || '';
      county = row['county'] || row['County'] || '';
    } else {
      const vals = Object.values(row);
      transactionId = (vals[0] || '').replace(/[{}]/g, '');
      price = parseInt(vals[1] || '0', 10);
      dateStr = vals[2] || '';
      postcode = vals[3] || '';
      propertyType = vals[4] || 'O';
      oldNew = vals[5] || 'N';
      duration = vals[6] || 'F';
      street = vals[9] || '';
      townCity = vals[11] || '';
      district = vals[12] || '';
      county = vals[13] || '';
    }

    if (!transactionId || !price || !dateStr) return null;

    const transferDate = new Date(dateStr);
    if (isNaN(transferDate.getTime())) return null;

    return {
      transactionId: transactionId.trim(),
      price,
      transferDate,
      postcode: postcode.trim(),
      propertyType: propertyType.trim(),
      newBuild: oldNew.trim().toUpperCase() === 'Y',
      tenure: duration.trim() === 'L' ? 'Leasehold' : 'Freehold',
      street: street.trim(),
      townCity: townCity.trim(),
      district: district.trim(),
      county: county.trim(),
    };
  } catch {
    return null;
  }
}

async function importCsv(filePath: string): Promise<void> {
  console.log(`📂 Importing data from: ${filePath}`);

  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ File not found: ${absolutePath}`);
    process.exit(1);
  }

  let batch: PropertyRecord[] = [];
  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalInserted = 0;
  let headers: string[] = [];

  const stream = fs.createReadStream(absolutePath).pipe(csv({ headers: false }));

  let isFirstRow = true;

  for await (const row of stream as AsyncIterable<CsvRow>) {
    if (isFirstRow) {
      isFirstRow = false;
      const firstVal = Object.values(row)[0] || '';
      if (firstVal.toLowerCase().includes('transaction') || firstVal.toLowerCase().includes('id')) {
        headers = Object.values(row) as string[];
        continue;
      }
    }

    const record = parseRow(row, headers);
    totalProcessed++;

    if (!record) {
      totalSkipped++;
      continue;
    }

    batch.push(record);

    if (batch.length >= BATCH_SIZE) {
      const inserted = await insertBatch(batch);
      totalInserted += inserted;
      batch = [];

      if (totalProcessed % 5000 === 0) {
        console.log(`  ⏳ Processed: ${totalProcessed} | Inserted: ${totalInserted} | Skipped: ${totalSkipped}`);
      }
    }
  }

  if (batch.length > 0) {
    const inserted = await insertBatch(batch);
    totalInserted += inserted;
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Total processed: ${totalProcessed}`);
  console.log(`   Total inserted: ${totalInserted}`);
  console.log(`   Total skipped: ${totalSkipped}`);
  console.log(`   Duplicates skipped: ${totalProcessed - totalSkipped - totalInserted}`);
}

async function insertBatch(records: PropertyRecord[]): Promise<number> {
  let inserted = 0;

  try {
    const result = await prisma.propertySale.createMany({
      data: records.map((r) => ({
        transactionId: r.transactionId,
        price: r.price,
        transferDate: r.transferDate,
        postcode: r.postcode,
        propertyType: r.propertyType,
        newBuild: r.newBuild,
        tenure: r.tenure,
        street: r.street,
        townCity: r.townCity,
        district: r.district,
        county: r.county,
      })),
      skipDuplicates: true,
    });
    inserted = result.count;
  } catch (error) {
    console.error('Batch insert error, falling back to individual inserts:', error);
    for (const record of records) {
      try {
        await prisma.propertySale.create({
          data: {
            transactionId: record.transactionId,
            price: record.price,
            transferDate: record.transferDate,
            postcode: record.postcode,
            propertyType: record.propertyType,
            newBuild: record.newBuild,
            tenure: record.tenure,
            street: record.street,
            townCity: record.townCity,
            district: record.district,
            county: record.county,
          },
        });
        inserted++;
      } catch {
        // Skip duplicate
      }
    }
  }

  return inserted;
}

const csvFile = process.argv[2];
if (!csvFile) {
  console.log('Usage: tsx scripts/importPriceData.ts <path-to-csv>');
  console.log('Example: tsx scripts/importPriceData.ts ./data/pp-complete.csv');
  process.exit(1);
}

importCsv(csvFile)
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('Import failed:', error);
    prisma.$disconnect();
    process.exit(1);
  });
