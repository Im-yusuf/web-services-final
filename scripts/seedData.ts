import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  const regions = [
    { townCity: 'LONDON', district: 'CITY OF LONDON', county: 'GREATER LONDON', postcodePrefix: 'EC' },
    { townCity: 'LONDON', district: 'WESTMINSTER', county: 'GREATER LONDON', postcodePrefix: 'SW' },
    { townCity: 'MANCHESTER', district: 'MANCHESTER', county: 'GREATER MANCHESTER', postcodePrefix: 'M' },
    { townCity: 'BIRMINGHAM', district: 'BIRMINGHAM', county: 'WEST MIDLANDS', postcodePrefix: 'B' },
    { townCity: 'LEEDS', district: 'LEEDS', county: 'WEST YORKSHIRE', postcodePrefix: 'LS' },
    { townCity: 'BRISTOL', district: 'CITY OF BRISTOL', county: 'CITY OF BRISTOL', postcodePrefix: 'BS' },
    { townCity: 'SHEFFIELD', district: 'SHEFFIELD', county: 'SOUTH YORKSHIRE', postcodePrefix: 'S' },
    { townCity: 'LIVERPOOL', district: 'LIVERPOOL', county: 'MERSEYSIDE', postcodePrefix: 'L' },
    { townCity: 'NEWCASTLE UPON TYNE', district: 'NEWCASTLE UPON TYNE', county: 'TYNE AND WEAR', postcodePrefix: 'NE' },
    { townCity: 'NOTTINGHAM', district: 'NOTTINGHAM', county: 'NOTTINGHAMSHIRE', postcodePrefix: 'NG' },
    { townCity: 'CAMBRIDGE', district: 'CAMBRIDGE', county: 'CAMBRIDGESHIRE', postcodePrefix: 'CB' },
    { townCity: 'OXFORD', district: 'OXFORD', county: 'OXFORDSHIRE', postcodePrefix: 'OX' },
    { townCity: 'BATH', district: 'BATH AND NORTH EAST SOMERSET', county: 'SOMERSET', postcodePrefix: 'BA' },
    { townCity: 'YORK', district: 'YORK', county: 'NORTH YORKSHIRE', postcodePrefix: 'YO' },
    { townCity: 'EDINBURGH', district: 'CITY OF EDINBURGH', county: 'CITY OF EDINBURGH', postcodePrefix: 'EH' },
  ];

  const streets = [
    'HIGH STREET', 'CHURCH ROAD', 'PARK AVENUE', 'VICTORIA ROAD', 'QUEEN STREET',
    'KINGS ROAD', 'MILL LANE', 'THE GROVE', 'STATION ROAD', 'BRIDGE STREET',
    'LONDON ROAD', 'GREEN LANE', 'MANOR ROAD', 'CASTLE STREET', 'NEW ROAD',
    'NORTH STREET', 'SOUTH ROAD', 'WEST AVENUE', 'EAST LANE', 'MAPLE DRIVE',
  ];

  const propertyTypes = ['D', 'S', 'T', 'F', 'O'];
  const tenures = ['Freehold', 'Leasehold'];

  const basePrices: Record<string, number> = {
    'GREATER LONDON': 550000,
    'GREATER MANCHESTER': 220000,
    'WEST MIDLANDS': 200000,
    'WEST YORKSHIRE': 190000,
    'CITY OF BRISTOL': 310000,
    'SOUTH YORKSHIRE': 170000,
    'MERSEYSIDE': 165000,
    'TYNE AND WEAR': 155000,
    'NOTTINGHAMSHIRE': 185000,
    'CAMBRIDGESHIRE': 380000,
    'OXFORDSHIRE': 420000,
    'SOMERSET': 340000,
    'NORTH YORKSHIRE': 280000,
    'CITY OF EDINBURGH': 300000,
  };

  const typeMultiplier: Record<string, number> = {
    D: 1.6, S: 1.0, T: 0.85, F: 0.7, O: 0.9,
  };

  const records = [];
  let txCounter = 0;

  for (let year = 2020; year <= 2024; year++) {
    const yearGrowth = 1 + (year - 2020) * 0.04;

    for (let month = 1; month <= 12; month++) {
      for (const region of regions) {
        const basePrice = basePrices[region.county] || 250000;
        const txCount = 5 + Math.floor(Math.random() * 11);

        for (let i = 0; i < txCount; i++) {
          txCounter++;
          const type = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
          const tenure = tenures[Math.floor(Math.random() * tenures.length)];
          const street = streets[Math.floor(Math.random() * streets.length)];
          const newBuild = Math.random() < 0.15;

          const multiplier = typeMultiplier[type] || 1;
          const randomFactor = 0.7 + Math.random() * 0.6;
          const price = Math.round(basePrice * multiplier * yearGrowth * randomFactor);

          const day = 1 + Math.floor(Math.random() * 28);
          const transferDate = new Date(year, month - 1, day);

          const postcode = `${region.postcodePrefix}${1 + Math.floor(Math.random() * 9)} ${Math.floor(Math.random() * 10)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

          records.push({
            transactionId: `SEED-${String(txCounter).padStart(8, '0')}`,
            price,
            transferDate,
            postcode,
            propertyType: type,
            newBuild,
            tenure,
            street,
            townCity: region.townCity,
            district: region.district,
            county: region.county,
          });
        }
      }
    }
  }

  console.log(`📊 Generated ${records.length} synthetic records`);

  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const result = await prisma.propertySale.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += result.count;

    if ((i + BATCH_SIZE) % 5000 < BATCH_SIZE) {
      console.log(`  ⏳ Inserted: ${inserted}/${records.length}`);
    }
  }

  console.log(`\n✅ Seed complete! Inserted ${inserted} records.`);
}

seed()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('Seed failed:', error);
    prisma.$disconnect();
    process.exit(1);
  });
