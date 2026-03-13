# Testing and Validation

## Current test stack

Backend uses:

- Vitest
- Supertest

Location:

- `backend/tests/`

## Test coverage areas

- Auth endpoints: register, duplicate handling, login, token-based user info, logout
- General/health routes
- Property routes: trends, heatmap, properties, stats, regions
- Saved listings routes: auth guard, validation, list/read behavior, update/delete paths

## Running tests

From `backend/`:

```bash
npm test
```

## Type-check validation

Backend type-check:

```bash
npx tsc --noEmit
```

Frontend type-check:

```bash
cd ../frontend
npx vue-tsc --noEmit
```

## API validation strategy

- Request body schemas use Zod validation middleware
- Controllers map known domain errors to stable HTTP status codes
- Service layer centralizes query and business behavior

## Useful acceptance checks before demo

1. Register a new user from frontend
2. Login and confirm protected routes work
3. Save a property, edit note, delete note
4. Add/remove properties in comparison view
5. Verify trends/heatmap/dashboard data load
6. Reload browser and confirm session restoration

## Deployment validation checks

After deployment:

- backend health endpoint responds
- frontend can register/login without CORS errors
- sample property listing loads
- saved listing create/read/update/delete works

## Known operational pitfalls

- Wrong `VITE_API_BASE_URL` can produce 405 path errors
- Missing CORS origin causes preflight failures
- Importing large datasets can exceed managed DB storage
