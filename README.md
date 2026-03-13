# EcoNest

UK Housing & Rental Insights Platform — a full-stack application with an **Express + TypeScript** REST API and a **Vue 3 + Tailwind CSS** single-page frontend.

The backend is powered by **Prisma** and **PostgreSQL**. Authentication uses secure random **session tokens** stored in the database — no JWTs or API keys. Passwords are hashed with **bcrypt** (12 rounds).

The frontend provides interactive dashboards, price trend charts, a regional heatmap, property browsing with filters, saved listings, and a **property comparison tool** that lets users compare up to 3 properties side-by-side.

---

## Requirements

- Node.js 18+
- PostgreSQL 14+ (installed and running)

---

## Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Make sure `psql` is on your PATH

On macOS with Homebrew, PostgreSQL binaries are not on the PATH by default. Add this to your `~/.zshrc` (or `~/.bashrc`) so it persists across terminal sessions:

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

> Prisma requires `psql` to be accessible when running migrations. If you skip this step, `npx prisma migrate dev` will fail.

### 3. Configure environment variables

```bash
cd backend
cp .env.example .env
```

Open `.env` and set `DATABASE_URL` to match your local Postgres credentials. On a default Homebrew macOS install (no password, username = your macOS login name):

```
DATABASE_URL="postgresql://YOUR_MAC_USERNAME@localhost:5432/econest?schema=public"
```

### 4. Create the database

```bash
psql -U YOUR_MAC_USERNAME -d postgres -c "CREATE DATABASE econest;"
```

### 5. Run database migrations

```bash
cd backend
npx prisma migrate dev --name init
```

### 6. Import the HM Land Registry data

The 2025 dataset (570k records) is included in the repository. Import it:

```bash
cd backend
npm run import-data data/pp-2025.csv
```

> The 2024 dataset is not included (153 MB, exceeds GitHub's limit). You can download it from [HM Land Registry](https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads) and import it the same way if desired.

### 7. Start the development server

```bash
cd backend
npm run dev
```

The API will be available at `http://localhost:3000`.  
Interactive Swagger docs: `http://localhost:3000/api/docs`

### 8. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and automatically proxies API requests to `localhost:3000`.

---

## Scripts

### Backend (run from `backend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm test` | Run all tests |
| `npm run import-data <file>` | Import an HM Land Registry CSV |
| `npx prisma migrate dev` | Run database migrations |
| `npx prisma studio` | Open Prisma DB browser |

### Frontend (run from `frontend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/econest` |
| `PORT` | Port the server listens on | `3000` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

---

## Project Structure

```
backend/                      # Express API
├── src/
│   ├── app.ts                # Express app (middleware, routes)
│   ├── server.ts             # Entry point
│   ├── controllers/          # Request handlers
│   ├── middleware/
│   │   ├── auth.ts           # Session token validation
│   │   ├── errorHandler.ts   # Global error handler
│   │   └── validate.ts       # Zod request validation
│   ├── routes/               # Route definitions with Swagger annotations
│   ├── services/             # Business logic & database queries
│   ├── types/                # Shared TypeScript interfaces
│   └── utils/
│       ├── config.ts         # Environment config
│       ├── prisma.ts         # Prisma client singleton
│       └── swagger.ts        # OpenAPI spec setup
├── scripts/
│   └── importPriceData.ts    # HM Land Registry CSV importer
├── prisma/
│   └── schema.prisma         # Database schema
├── data/                     # Place CSV files here (git-ignored)
├── tests/                    # Vitest integration tests
├── package.json
├── tsconfig.json
└── vitest.config.ts
frontend/                     # Vue 3 SPA
├── src/
│   ├── main.ts               # App bootstrap
│   ├── App.vue               # Root component
│   ├── router/               # Vue Router (auth guards, lazy routes)
│   ├── components/           # Reusable UI components
│   │   ├── DashboardCard.vue
│   │   ├── HeatmapChart.vue
│   │   ├── MarketAssistant.vue
│   │   ├── PropertyFilters.vue
│   │   ├── SidebarNavigation.vue
│   │   └── TrendChart.vue
│   ├── views/                # Page-level views
│   │   ├── AppLayout.vue
│   │   ├── ComparisonView.vue
│   │   ├── DashboardView.vue
│   │   ├── HeatmapView.vue
│   │   ├── LoginView.vue
│   │   ├── PropertiesView.vue
│   │   ├── RegisterView.vue
│   │   ├── SavedView.vue
│   │   └── TrendsView.vue
│   ├── services/             # Axios API client
│   ├── stores/               # Pinia state (auth, filters, saved, comparison)
│   ├── types/                # Frontend TypeScript interfaces
│   └── assets/               # Tailwind CSS
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## API Overview

See [docs/API.md](docs/API.md) for full endpoint documentation.

| Group | Base path | Auth required |
|---|---|---|
| Auth | `/api/auth` | No (except `/me`, `/logout`) |
| Properties | `/api` | No |
| Market Insights | `/api/insights` | No |
| Saved Listings | `/api/saved` | Yes |

---

## Frontend Features

| Feature | Description |
|---|---|
| **Dashboard** | Stats overview with charts for price trends, property type distribution, and transaction volume |
| **Price Trends** | Interactive line chart with region, year, and property type filters |
| **Regional Heatmap** | Horizontal bar chart of average prices by county with a sortable breakdown table |
| **Property Browser** | Paginated grid of property sales with save and compare actions |
| **Saved Listings** | Persistent list of bookmarked properties with optional notes |
| **Property Comparison** | Side-by-side comparison of up to 3 properties with price highlighting and insight cards |
| **Market Insights** | On-demand regional analysis showing growth, affordability, tenure, and type breakdowns |
