# Implementation Plan: 0.005 Instant Sourcing Feed & 24-Hour Data Freshness Guarantee

## 1. Technical Strategy

### Phase 1: 24-Hour Freshness Resolver (`lib/freshness.js`)
- Implement `getLatestMarketDate()` calculating the current active SEC market day (adjusting for weekends and time of day).
- Implement `validateDataFreshness(filedDate)`:
  - If filing date is within 24-48 hours (accounting for weekend gaps), returns `{ isFresh: true, ageHours: X }`.
  - If filing date is older than 24 market hours, returns `{ isFresh: false, reason: "Older than 24h" }`.
- Add endpoint `GET /api/feed/freshness` providing current market date, cached status, and freshness metadata.

### Phase 2: Accelerated Ingestion Pipeline (`lib/sec_ingest.js` & `server.js`)
- Replace the sequential `for (const f of filingsToFetch) { await sleep(150); ... }` in `server.js` and `morning_sync.js` with a concurrent worker queue:
  - 5 workers processing batches concurrently.
  - Strict token bucket / rate-limiter ensuring <= 9.5 requests/second (below SEC's 10 req/s hard cap).
  - Emits real-time progress state: `syncProgress = { date, processed, total, percent }`.
- Expose `GET /api/sync/progress` for client-side progress polling.

### Phase 3: Feed API Optimization (`server.js`)
- Update `/api/feed`:
  - If date is cached, instantly formats and returns scored targets in < 1ms.
  - If date is uncached, triggers non-blocking accelerated ingestion while returning `{ status: 'syncing', date, progress }`.
  - When sync completes, broadcasts completion so UI can seamlessly hydrate filings.

### Phase 4: Sourcing Feed UI Upgrades (`src/components/SourcingFeed.jsx`)
- Initialize `date` with `latestFreshMarketDate` fetched from `/api/feed/freshness`.
- Add live **Data Freshness Badge**:
  - `🟢 Verified Fresh (< 24h)` when data is from the active market day.
  - `🟡 Syncing Latest 24h Data...` with an animated progress bar during active crawl.
- Replace full-page loading spinner with the interactive progress bar.

### Phase 5: Verification & Documentation
- Measure feed load time (< 10ms for cached days).
- Measure live SEC crawl duration with 5-worker queue (< 3s).
- Verify `npm run build` and update progress/handoff logs.
