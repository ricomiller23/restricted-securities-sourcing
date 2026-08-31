# Specification: 0.005 Instant Sourcing Feed & 24-Hour Data Freshness Guarantee

## 1. Overview
This specification details the architecture and implementation for instant Sourcing Feed loading (<10ms) paired with a strict **24-Hour Data Freshness Guarantee**. The application will ensure that users are never presented with stale data older than 24 market hours, while eliminating initial page crawl freezing through parallelized background ingestion and smart cache resolution.

## 2. Problem Statement
1. **Initial Page Freeze (10-20s)**: When the user opens the application, `SourcingFeed` requests today's date (`/api/feed?date=YYYY-MM-DD`). Because today's date has not yet been cached, the backend performs a synchronous, single-threaded SEC web crawl that freezes the feed UI with a loading spinner for 10-30 seconds.
2. **Stale Data Ambiguity**: If today is a weekend, holiday, or early morning before the SEC daily index is published, the app must strictly identify and load the most recent market business day (within 24 market hours) and clearly certify data freshness to the user.

## 3. Goals & Requirements
- **24-Hour Freshness Guarantee**: Never present data older than 24 market business hours as current sourcing opportunities. Form 144 filings must be certified within the active market window.
- **Instant Feed Load (< 10ms)**: When cached 24h data is available, load and render the feed in under 10ms directly from in-memory index.
- **Accelerated Parallel Ingestion**: If the latest 24h data needs to be ingested from SEC EDGAR, replace single-threaded sequential sleeps with a 5-worker concurrent pipeline (respecting the SEC 10 req/sec rate limit), reducing full day ingestion from ~20s down to < 2s.
- **Live Ingestion Progress UI**: If an uncached date is being fetched, display a live progress bar (`Ingesting SEC Filings: 48/120 (40%)`) instead of a frozen blank spinner.
- **Data Freshness Badge**: Render a prominent freshness certification badge in the feed header (e.g. `🟢 Fresh: 2026-08-31 (< 24h old)`).

## 4. Architectural Design
1. **Freshness Resolver (`lib/freshness.js`)**:
   - Calculates the active SEC market date window (accounting for weekends and market holidays).
   - Determines whether cached data meets the 24h freshness requirement.
2. **Accelerated Batch Ingestion (`lib/sec_ingest.js` / `scripts/morning_sync.js`)**:
   - Utilizes controlled concurrency (5 workers, 100ms interval) to maximize SEC throughput up to 10 req/s.
   - Emits real-time progress events (`processed`, `total`, `percent`).
3. **Optimized `/api/feed` Endpoint**:
   - Checks if target date is in memory. If so, returns instantly.
   - If uncached, triggers non-blocking accelerated ingestion and returns live sync status.
4. **Sourcing Feed UI (`src/components/SourcingFeed.jsx`)**:
   - Mounts instantly with the latest certified fresh date.
   - Displays real-time progress bar if background sync is actively updating the latest 24h dataset.

## 5. Acceptance Criteria
- [x] Feed loads and renders in < 10ms when recent 24h market cache is present.
- [x] Ingestion of a full day of Form 144 filings completes in < 3s via parallel worker pipeline.
- [x] Live progress bar is shown in UI during active SEC data ingestion.
- [x] Prominent 24-hour freshness badge is displayed on Sourcing Feed header.
- [x] No data older than 24 market hours is displayed without explicit staleness warning.
- [x] `npm run build` succeeds cleanly.
