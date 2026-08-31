# Specification: 0.002 Automated Daily Morning Data Update Engine

## 1. Overview
This specification defines the architecture and implementation for automatically updating the Scout 144 / Restricted Securities Sourcing application every morning. The update engine will automatically ingest latest SEC Form 144 filings, refresh company tickers, synchronize regional data feeds, update delisted issuer records, and re-index cached datasets prior to market open.

## 2. Background & Problem Statement
Currently, data updates require manual triggers (e.g. initiating backfill from the UI or manually fetching dates in the sourcing feed). If a user launches the app in the morning, new filings from recent trading sessions are not automatically pre-cached or ingested unless the user manually visits each date or triggers a sync.

To ensure the sourcing console always contains the most up-to-date restricted stock and debt opportunities every morning without human intervention, an automated morning synchronization pipeline is required.

## 3. Goals
- **Automated Morning Schedule**: Run an automated daily sync every morning (default 8:00 AM EST / 5:00 AM PST, configurable) whenever the server or background runner is active.
- **On-Startup Auto-Catchup**: Check upon server / launcher startup (`Launch Scout 144.command` or `server.js` start) whether today's / recent business day filings are cached; automatically initiate a background sync if stale.
- **Multi-Source Data Synchronization**:
  1. SEC Ticker Mappings (`company_tickers.json`) refresh.
  2. Latest SEC Form 144 Daily Index ingestion & parsing (primary doc XML retrieval, scoring, and contact enrichment).
  3. Delisted CRM database synchronization (`delisted_issuers_seed.json`).
  4. Regional cloud app sync trigger ([`scripts/daily_sync_all_apps.cjs`](file:///Users/ericmiller/NEW%20JUNE%2026/scripts/daily_sync_all_apps.cjs)).
- **Resilient & Non-Blocking**: Execute updates asynchronously without freezing the UI or blocking Express endpoints.
- **Audit & History Logging**: Record all daily sync timestamps, records ingested, and errors to `.config/ai/progress.ai` and `cache/sync_history.json`.

## 4. Non-Goals
- Modifying the core UI layout of the CRM board or FTS explorer beyond showing a status indicator/timestamp of the latest morning sync.
- Scraping non-SEC external websites without rate limiting.

## 5. Architectural & System Design
- **Sync Engine Module (`scripts/morning_sync.js` / `lib/syncEngine.js`)**:
  - Encapsulates SEC daily index fetching, Form 144 XML parsing, scoring, issuer contact lookup, and local cache write.
  - Implements polite rate limiting against SEC EDGAR (`150ms` delay between requests and compliant User-Agent headers).
- **Scheduling Layer**:
  - In-process timer in `server.js` (fires daily at 8:00 AM EST and performs startup stale check).
  - Standalone CLI command: `npm run sync:daily` for headless or cron execution.
  - macOS launchd service template (`com.scout144.morningupdate.plist`) for optional background scheduling without needing browser/terminal open.
- **API Endpoints**:
  - `GET /api/sync/status`: Returns last sync timestamp, state (`idle`, `syncing`, `completed`, `failed`), and stats.
  - `POST /api/sync/trigger`: Allows manual or programmatic trigger of the daily sync cycle.

## 6. Acceptance Criteria
- [ ] Daily sync script (`npm run sync:daily`) executes successfully from CLI and fetches latest SEC daily index.
- [ ] Server automatically performs startup sync check on boot and schedules next 8:00 AM EST run.
- [ ] Ingested filings are properly scored, contact-enriched, and indexed in `cache/` and `filingsIndex`.
- [ ] `GET /api/sync/status` returns valid status and last execution timestamp.
- [ ] Progress log and sync history file record execution details and record counts.
- [ ] `npm run build` and tests pass without regressions.
