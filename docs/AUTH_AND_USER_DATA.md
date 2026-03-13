# Authentication and User Data

## Authentication approach

EcoNest uses session-token authentication (not JWT).

On successful register/login:

- Backend creates a cryptographically random token
- Token is stored in the `sessions` table with expiry timestamp
- Token is returned to the frontend
- Frontend stores token in local storage and sends it as Bearer auth

## User account data

User records are stored in `users`:

- `id` (UUID)
- `email` (unique)
- `password_hash` (bcrypt hash only, never plaintext)
- timestamps (`created_at`, `updated_at`)

## Session data

Session records are stored in `sessions`:

- `id` (UUID)
- `token` (unique)
- `user_id` (FK to users)
- `expires_at`
- `created_at`

A login can create multiple active sessions over time. Logout removes the current token row.

## Password handling

- Hashing algorithm: bcrypt
- Cost factor: 12 rounds
- Validation: bcrypt compare against stored hash

This protects user credentials even if the DB is exposed.

## Protected endpoint flow

For routes requiring auth:

1. Client includes `Authorization: Bearer <token>`
2. Middleware looks up token in `sessions`
3. Middleware checks expiry
4. If valid, user payload is attached to request
5. Controller/service uses authenticated user ID

If invalid/expired:

- Request is rejected with 401
- Expired token is deleted from DB

## Frontend persistence behavior

Frontend stores:

- `econest_token`
- `econest_user`

On app startup, auth store restores these values. If parsing fails, local auth state is cleared.

## User-owned data

Saved listings are per-user and enforced server-side:

- `saved_listings.user_id` links records to the authenticated user
- Read/update/delete operations are filtered by user ID
- Users cannot modify another user’s saved entries

## Current security considerations

Strengths:

- No plaintext passwords
- Server-side token validation and expiry
- DB-level uniqueness constraints on identity fields

Potential future hardening:

- Rate limiting on auth endpoints
- Email verification / password reset flow
- Session revocation UI (device/session list)
- Optional httpOnly cookie session transport
