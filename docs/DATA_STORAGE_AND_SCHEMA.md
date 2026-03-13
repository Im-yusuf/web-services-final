# Data Storage and Schema

## Database technology

- PostgreSQL as primary datastore
- Prisma ORM for schema management and query access
- Migration-based schema evolution under `backend/prisma/migrations`

## Core tables

### users
Stores registered accounts.

Key fields:

- `id` UUID primary key
- `email` unique
- `password_hash`
- `created_at`, `updated_at`

### sessions
Stores active login sessions.

Key fields:

- `token` unique
- `user_id` foreign key
- `expires_at`

Indexes:

- token index for fast auth lookup
- user_id index for user-session operations

### property_sales
Stores HM Land Registry transaction records.

Key fields:

- `transaction_id` unique
- `price`
- `transfer_date`
- `postcode`
- `property_type`
- `new_build`
- `tenure`
- `street`, `town_city`, `district`, `county`

Indexes optimized for main query patterns:

- location columns (`town_city`, `district`, `county`, `postcode`)
- `transfer_date`
- `property_type`
- `price`

### saved_listings
Join-like table mapping users to saved properties.

Key fields:

- `user_id`
- `property_id`
- optional `notes`
- `created_at`

Constraint:

- unique `(user_id, property_id)` to prevent duplicate saves

### market_reports and user_preferences
Additional models for report caching and personalization-related data.

## Relationship summary

- User 1..* Sessions
- User 1..* SavedListings
- PropertySale 1..* SavedListings
- User 1..1 UserPreference

## Data integrity controls

- Unique constraints on `users.email`, `sessions.token`, `property_sales.transaction_id`
- Foreign keys with cascade deletes for session/saved listing cleanup
- Prisma type-safe access reduces runtime query-shape bugs

## Practical implications

- Auth checks are fast due to indexed session tokens
- Property browsing scales better due to location/date/type/price indexes
- Duplicate import entries are avoided by unique transaction IDs
- Saved listing ownership is enforced in both schema and service logic
