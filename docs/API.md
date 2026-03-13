# EcoNest API Reference

Base URL: `http://localhost:3000`  
Interactive docs (Swagger UI): `http://localhost:3000/api/docs`  
Frontend: `http://localhost:5173` (Vite dev server, proxies `/api` to backend)

All responses follow the same envelope:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "message" }
```

---

## Authentication

EcoNest uses **session tokens** — no JWTs or API keys. On login or register you receive a random token. Pass it in the `Authorization` header for protected endpoints:

```
Authorization: Bearer <token>
```

Tokens expire after **7 days**. Logging out immediately deletes the token from the database.

---

## Auth Endpoints

### POST /api/auth/register

Register a new user account.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

- `password` must be at least 8 characters
- Passwords are hashed with bcrypt (12 rounds) — the plain-text password is never stored

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "createdAt": "2026-03-13T10:00:00.000Z"
    },
    "token": "a3f9c2..."
  }
}
```

**Errors:**
| Status | Meaning |
|---|---|
| `400` | Validation failed (invalid email / short password) |
| `409` | Email already registered |

---

### POST /api/auth/login

Log in with existing credentials.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "createdAt": "2026-03-13T10:00:00.000Z"
    },
    "token": "a3f9c2..."
  }
}
```

**Errors:**
| Status | Meaning |
|---|---|
| `401` | Invalid email or password |

---

### POST /api/auth/logout

🔒 Requires auth. Invalidates the current session token immediately.

**Response `200`:**
```json
{ "success": true, "message": "Logged out successfully" }
```

---

### GET /api/auth/me

🔒 Requires auth. Returns the currently authenticated user.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "uuid",
      "email": "user@example.com"
    }
  }
}
```

**Errors:**
| Status | Meaning |
|---|---|
| `401` | Missing, invalid, or expired token |

---

## Property Endpoints

### GET /api/trends

Returns monthly average price trends. Optionally filtered.

**Query parameters:**
| Parameter | Type | Description |
|---|---|---|
| `region` | string | City, district, or county name (case-insensitive) |
| `year` | string | 4-digit year e.g. `2024` |
| `propertyType` | string | `D` Detached · `S` Semi-detached · `T` Terraced · `F` Flat · `O` Other |

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "year": 2024,
      "month": 1,
      "avgPrice": 285000,
      "transactionCount": 312,
      "priceGrowth": 1.4
    }
  ]
}
```

---

### GET /api/heatmap

Returns average house price and total sales per county. Useful for rendering a choropleth / heatmap.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "region": "GREATER LONDON",
      "avgPrice": 548000,
      "totalSales": 24800
    }
  ]
}
```

Results are ordered by `avgPrice` descending.

---

### GET /api/properties

Paginated list of individual property sale records with optional filters.

**Query parameters:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| `region` | string | — | City, district, or county |
| `minPrice` | integer | — | Minimum sale price (£) |
| `maxPrice` | integer | — | Maximum sale price (£) |
| `propertyType` | string | — | `D` / `S` / `T` / `F` / `O` |
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Results per page (max 100) |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "price": 325000,
        "transferDate": "2024-06-15T00:00:00.000Z",
        "postcode": "LS1 4AB",
        "propertyType": "T",
        "newBuild": false,
        "tenure": "Freehold",
        "street": "CHURCH ROAD",
        "townCity": "LEEDS",
        "district": "LEEDS",
        "county": "WEST YORKSHIRE"
      }
    ],
    "total": 18450,
    "page": 1,
    "limit": 20,
    "totalPages": 923
  }
}
```

---

### GET /api/regions

Returns the list of all distinct counties present in the database.

**Response `200`:**
```json
{
  "success": true,
  "data": ["CAMBRIDGESHIRE", "CITY OF BRISTOL", "GREATER LONDON", "..."]
}
```

---

### GET /api/stats

Returns top-level market statistics across the whole dataset.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalProperties": 482000,
    "avgPrice": 298500,
    "latestSaleDate": "2025-12-30T00:00:00.000Z"
  }
}
```

---

## Market Insights

### POST /api/insights/region

Returns a rich set of computed market insights for a given region, derived from the Land Registry data.

**Request body:**
```json
{ "region": "LEEDS" }
```

The `region` field is matched case-insensitively against city name, district, and county.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "region": "LEEDS",
    "totalTransactions": 18450,
    "avgPrice": 265000,
    "medianPrice": 240000,
    "minPrice": 42000,
    "maxPrice": 1850000,
    "priceRange": 1808000,
    "recentYearAvg": 278000,
    "oneYearGrowthPct": 3.2,
    "fiveYearGrowthPct": 18.7,
    "recentYearVolume": 2140,
    "affordabilityRatio": 7.9,
    "marketSignal": "moderate-growth",
    "newBuildShare": 12.4,
    "freeholdShare": 71.8,
    "propertyTypeBreakdown": [
      {
        "propertyType": "T",
        "label": "Terraced",
        "count": 6200,
        "avgPrice": 198000,
        "share": 33.6
      }
    ],
    "yearlyTrends": [
      {
        "year": 2024,
        "avgPrice": 270000,
        "transactionCount": 2250,
        "priceGrowthPct": 2.1
      }
    ]
  }
}
```

**Field glossary:**

| Field | Description |
|---|---|
| `affordabilityRatio` | `avgPrice ÷ UK median household income (£35,000)` |
| `marketSignal` | Derived from 1-year growth: `strong-growth` (≥5%) · `moderate-growth` (≥1%) · `stable` (≥-1%) · `declining` · `insufficient-data` |
| `oneYearGrowthPct` | % change in avg price vs the prior 12-month period |
| `fiveYearGrowthPct` | % change comparing the most recent 12 months vs the period 5–6 years ago |
| `newBuildShare` | % of transactions that were new builds |
| `freeholdShare` | % of transactions with Freehold tenure |

**Errors:**
| Status | Meaning |
|---|---|
| `400` | `region` field missing from request body |

---

## Saved Listings

All saved listings endpoints require authentication.

### POST /api/saved

🔒 Requires auth. Save a property to the current user's list.

**Request body:**
```json
{
  "propertyId": "uuid",
  "notes": "Great location, near school"
}
```

- `propertyId` must be a valid UUID matching a record in the database
- `notes` is optional, max 500 characters

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "propertyId": "uuid",
    "notes": "Great location, near school",
    "createdAt": "2026-03-13T10:00:00.000Z",
    "property": { ... }
  }
}
```

**Errors:**
| Status | Meaning |
|---|---|
| `400` | Validation failed |
| `401` | Not authenticated |
| `404` | Property ID not found |

---

### GET /api/saved

🔒 Requires auth. Returns all saved listings for the current user, newest first.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "notes": "Great location",
      "createdAt": "2026-03-13T10:00:00.000Z",
      "property": {
        "id": "uuid",
        "price": 325000,
        "street": "CHURCH ROAD",
        "townCity": "LEEDS",
        "county": "WEST YORKSHIRE"
      }
    }
  ]
}
```

---

### PUT /api/saved/:id

🔒 Requires auth. Update the notes on a saved listing. Users can only update their own listings.

**Request body:**
```json
{ "notes": "Updated note text" }
```

- `notes` can be a string (max 500 characters) or `null` to clear

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "notes": "Updated note text",
    "createdAt": "2026-03-13T10:00:00.000Z",
    "property": { ... }
  }
}
```

**Errors:**
| Status | Meaning |
|---|---|
| `400` | Validation failed |
| `401` | Not authenticated |
| `404` | Listing not found or belongs to another user |

---

### DELETE /api/saved/:id

🔒 Requires auth. Remove a saved listing by its ID. Users can only delete their own listings.

**Response `200`:**
```json
{ "success": true, "message": "Listing removed" }
```

**Errors:**
| Status | Meaning |
|---|---|
| `401` | Not authenticated |
| `404` | Listing not found or belongs to another user |

---

## Health Check

### GET /api/health

No auth required. Confirms the server is running.

**Response `200`:**
```json
{ "status": "ok", "timestamp": "2026-03-13T10:00:00.000Z" }
```

---

## Frontend Pages

The Vue 3 frontend consumes all of the endpoints above and provides these pages:

| Route | View | Description |
|---|---|---|
| `/login` | LoginView | Email + password sign in |
| `/register` | RegisterView | Account creation with confirmation |
| `/dashboard` | DashboardView | Stats cards, price trend chart, pie chart, volume chart, market insights assistant |
| `/trends` | TrendsView | Trend line chart with region / year / type filters and growth summary |
| `/heatmap` | HeatmapView | Horizontal bar chart by county with regional breakdown table |
| `/properties` | PropertiesView | Paginated property grid with save and compare buttons |
| `/saved` | SavedView | User's saved listings with notes and compare button |
| `/compare` | ComparisonView | Side-by-side comparison of up to 3 selected properties |

### Property Comparison (client-side feature)

The comparison tool is entirely client-side — it requires no additional API endpoints. Users select properties from the Properties or Saved pages. The comparison store (`stores/comparison.ts`) holds up to 3 `PropertySale` objects in memory. The ComparisonView renders a table with rows for price, type, location, tenure, new-build status, and sale date, plus insight cards showing the price range, best-value pick, and unique regions.
