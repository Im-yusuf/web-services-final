# Data Import Pipeline

## Source dataset

Primary source is HM Land Registry Price Paid CSV data.

Current repository setup:

- Included: `backend/data/pp-2025.csv` (trimmed subset for GitHub size limits)
- Not included: 2024 full file (exceeded GitHub hard file-size limit)

## Import command

Run from `backend/`:

```bash
npm run import-data data/pp-2025.csv
```

Script entrypoint:

- `backend/scripts/importPriceData.ts`

## Parsing behavior

The importer supports two CSV structures:

1. Named-column CSVs (header-based access)
2. Positional CSVs (index-based access)

For each row, parser extracts:

- transaction ID
- price
- transfer date
- postcode
- property type
- old/new flag
- duration (mapped to Freehold/Leasehold)
- street, town/city, district, county

Invalid rows are skipped.

## Normalization rules

- Transaction IDs are stripped of braces
- Dates are parsed into JS Date objects
- New-build flag is `Y` => true, otherwise false
- Duration `L` => Leasehold, otherwise Freehold
- Text fields are trimmed

## Insert strategy

- Batch size: 500 rows
- Primary mode: `createMany(..., skipDuplicates: true)`
- Duplicate handling: based on unique `transaction_id`
- Fallback mode: if batch fails, importer retries individual row inserts

This design maximizes throughput while still progressing through partial/dirty data.

## Progress reporting

Importer logs cumulative stats while running:

- processed rows
- inserted rows
- skipped rows

Final summary includes duplicate estimate:

- duplicates = processed - skipped - inserted

## Error modes seen in deployment

### Connection errors

If DB host is internal (for example `*.railway.internal`) and import runs locally, Prisma cannot connect.

Fix:

- use public/external Railway connection URL for local import commands

### Storage exhaustion

Error like `No space left on device` indicates database disk/WAL limits were hit.

Fix options:

- import smaller subset
- increase DB storage plan
- truncate and re-import reduced dataset

## Recommended deploy-safe strategy

For coursework demos, import a bounded subset first, verify the app end-to-end, then optionally scale data volume if storage permits.
