# Architecture Overview

## High-level structure

EcoNest is a full-stack application split into two deployable parts:

- Backend API: Express + TypeScript + Prisma + PostgreSQL
- Frontend SPA: Vue 3 + Vite + Pinia + Axios + Tailwind

Repository layout:

- `backend/`: API service, Prisma schema, migration files, import scripts, tests
- `frontend/`: UI application, route views, components, client state stores
- `docs/`: project documentation and API reference

## Backend request flow

1. Client sends request to `/api/...`
2. Express app routes the request to the matching controller
3. Controller validates/parses request and calls service logic
4. Service executes Prisma queries against PostgreSQL
5. Controller returns API response envelope

Standard API response shape:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "..." }
```

## Backend layering

- Routes: endpoint definitions and request validation wiring
- Controllers: HTTP-level handling and status code mapping
- Services: business logic and database operations
- Middleware: auth token checks, validation, global error handling
- Utils: environment config, Prisma singleton, Swagger spec setup

## Frontend structure

- Router controls page navigation and auth-guarded areas
- Views are page-level containers (dashboard, trends, heatmap, properties, saved, compare)
- Components are reusable UI blocks (charts, filters, navigation, insights panel)
- Stores hold cross-page state (auth, saved listings, comparison, filters, cache)
- Services centralize API calls

## Data flow across frontend and backend

1. UI action triggers store/service method
2. Axios client sends HTTP request to backend
3. Backend returns JSON payload
4. Store/view updates reactive state
5. Components re-render charts/cards/tables from updated state

## Caching and performance design

A dedicated frontend cache store reduces repeated expensive calls when switching views:

- Cached endpoints: stats, default trends, heatmap, regions
- Time-to-live: 5 minutes
- Benefit: quicker view transitions and fewer redundant backend queries

## Security model summary

- Session-token authentication (database-backed sessions)
- Password hashing with bcrypt
- Protected endpoints require Bearer token
- Token expiry enforced server-side
- CORS restricted to configured origins (plus Vercel preview patterns)

## Why this architecture fits coursework goals

- Clear separation of concerns for maintainability and oral defense
- Real database integration with non-trivial queries and aggregations
- Well-defined API contract with documentation
- Testable units and integration endpoints
- Supports incremental feature growth without major rewrites
