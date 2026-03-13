# Analytics and Figure Derivations

This document explains how key metrics are calculated in backend services.

## Property trends endpoint (`GET /api/trends`)

Service: `PropertyService.getTrends`

### Input filters

- region (matches town, district, or county case-insensitively)
- year (restricts transfer date to selected calendar year)
- property type code

### Computation steps

1. Load matching transactions ordered by transfer date
2. Group by `(year, month)`
3. For each month:
   - `avgPrice = round(totalPrice / count)`
   - `transactionCount = count`
4. Compute month-over-month growth:

$$
priceGrowth\% = \frac{avgPrice_t - avgPrice_{t-1}}{avgPrice_{t-1}} \times 100
$$

First period uses 0 as baseline growth.

## Heatmap endpoint (`GET /api/heatmap`)

Service: `PropertyService.getHeatmap`

Grouped by county using DB aggregation:

- average price per county
- total transactions per county

Ordered by descending average price.

## Stats endpoint (`GET /api/stats`)

Service: `PropertyService.getStats`

Computed values:

- total properties: count of `property_sales`
- average price: rounded aggregate average
- latest sale date: max transfer date via latest record query

## Regional insights endpoint (`POST /api/insights/region`)

Service: `MarketInsightsService.getRegionInsights`

### Core outputs

- `avgPrice`, `minPrice`, `maxPrice`, `priceRange`
- `recentYearAvg`
- `oneYearGrowthPct`
- `fiveYearGrowthPct`
- `recentYearVolume`
- `affordabilityRatio`
- `marketSignal`
- `propertyTypeBreakdown`
- `newBuildShare`, `freeholdShare`
- `yearlyTrends`

### Time windows

- recent year: now minus 1 year to now
- previous year: 2 years ago to 1 year ago
- five-year comparison baseline: 6 to 5 years ago vs recent year

### Growth formulas

One-year growth:

$$
oneYearGrowth\% = \frac{recentYearAvg - prevYearAvg}{prevYearAvg} \times 100
$$

Five-year growth:

$$
fiveYearGrowth\% = \frac{recentWindowAvg - oldWindowAvg}{oldWindowAvg} \times 100
$$

Null is returned when denominator period has no valid average.

### Affordability ratio

Using configured UK median household income constant (£35,000):

$$
affordabilityRatio = \frac{avgPrice}{35000}
$$

### Property type shares

For each type group:

$$
share\% = \frac{typeCount}{totalTransactions} \times 100
$$

### Market signal classification

Based on one-year growth and sample size:

- insufficient-data: fewer than 10 transactions or no growth baseline
- strong-growth: growth >= 5%
- moderate-growth: growth >= 1%
- stable: growth >= -1%
- declining: growth < -1%

## Dashboard chart data

Frontend dashboard uses:

- trends data for volume bars
- heatmap top counties for pie segments
- stats endpoint for KPI cards

These values are direct API outputs (no random generation).
