# Troubleshooting Guide

## 1) CORS errors in browser

Symptom:

- preflight blocked
- missing `Access-Control-Allow-Origin`

Checks:

- frontend origin matches `CORS_ORIGIN`
- backend redeployed after env/code changes
- frontend points to correct backend URL

Fix:

- set `CORS_ORIGIN` to deployed frontend URL
- redeploy backend

## 2) Login/Register returns 405 from Vercel URL

Symptom:

- request path looks like Vercel domain + Railway hostname as path segment

Root cause:

- malformed `VITE_API_BASE_URL`

Fix:

- set exact value, for example:
  `https://your-backend.up.railway.app/api`
- redeploy frontend

## 3) Prisma cannot reach Railway DB (`railway.internal`)

Symptom:

- `Can't reach database server at ...railway.internal`

Root cause:

- internal Railway host used from local machine

Fix:

- use Railway external/public Postgres URL for local import commands

## 4) Import fails with no space left on device

Symptom:

- WAL write failure / storage exhaustion

Fix options:

- import smaller dataset subset
- clear/truncate and re-import
- upgrade database storage plan

## 5) Massive TypeScript error list in editor

Typical causes:

- stale TypeScript server state
- wrong workspace root opened
- old generated artifacts referenced

Fix steps:

1. run backend/frontend type checks manually
2. restart TypeScript server in editor
3. reload VS Code window

## 6) Git push rejected by file size

Symptom:

- file exceeds 100 MB hard limit

Fix:

- keep large CSVs out of git tracking
- commit trimmed subsets when required for reproducibility
- use `.gitignore` to prevent accidental re-add

## 7) Railway repo not visible during setup

Fix:

- ensure Railway GitHub app has access to that repository
- verify account/org permissions and app installation scope

## Quick diagnostics commands

Backend type check:

```bash
cd backend && npx tsc --noEmit
```

Frontend type check:

```bash
cd frontend && npx vue-tsc --noEmit
```

Backend tests:

```bash
cd backend && npm test
```
