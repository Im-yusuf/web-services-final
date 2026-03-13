# Deployment and Environment Guide

## Recommended hosting split

- Backend API + PostgreSQL: Railway
- Frontend SPA: Vercel

This aligns with the project’s Node/Prisma/Vite architecture.

## Backend environment variables

Required:

- `DATABASE_URL`
- `PORT`
- `NODE_ENV`
- `CORS_ORIGIN`

`CORS_ORIGIN` supports comma-separated values and quote-safe parsing.

## Frontend environment variables

Required in production:

- `VITE_API_BASE_URL`

Expected format:

- full URL ending in `/api`

Example:

- `https://your-backend.up.railway.app/api`

The frontend API client also normalizes common misconfigurations (missing protocol or missing `/api`).

## CORS behavior

Backend allows:

- explicit configured origins from `CORS_ORIGIN`
- Vercel preview/deployment domains matching `https://*.vercel.app`

If browser shows CORS preflight failures, verify both frontend URL and backend CORS env values, then redeploy backend.

## Railway database import notes

When importing from a local machine:

- use Railway public/external DB URL
- do not use internal hostnames (`*.railway.internal`) locally

If import fails with storage/WAL exhaustion:

- reduce dataset size
- truncate and retry
- or upgrade DB storage plan

## Basic production checklist

1. Backend deploy succeeds and `/api/health` returns 200
2. Migrations applied in deployed environment
3. Data import completed to expected row count
4. Frontend deployed with correct `VITE_API_BASE_URL`
5. Auth register/login works cross-origin
6. Protected endpoints accessible with valid token

## Security/operations checklist

- rotate exposed DB credentials immediately
- avoid logging secrets in terminal screenshots/chats
- use least-privilege project access in deployment platforms
- keep dependency versions updated periodically
