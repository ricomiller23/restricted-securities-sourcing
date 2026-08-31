# Implementation Plan: 0.002 Automated Daily Morning Data Update Engine

## 1. Technical Strategy & Modules

### Step 1: Core Morning Sync Pipeline (`lib/morningSync.js` or `scripts/morning_sync.js`)
- Implement a dedicated Node.js module that:
  1. Computes the target business date (handling weekends and holidays).
  2. Updates `company_tickers.json` if cache > 24 hours old.
  3. Fetches the SEC Daily Index (`master.YYYYMMDD.idx`) for the latest market dates.
  4. Parses Form 144 / 144/A filings, fetches XML primary documents, parses with `xml2js`, applies scoring heuristics from `settings.json`, enriches with CIK contact details, and saves to `cache/YYYY-MM-DD.json`.
  5. Triggers `indexCachedFilings()` to update in-memory `filingsIndex`.
  6. Pings regional sync endpoints via `scripts/daily_sync_all_apps.cjs`.
  7. Updates `cache/sync_history.json` with execution details.

### Step 2: Server Integration & Background Scheduler (`server.js`)
- Integrate morning sync trigger into `server.js`:
  - Startup check: Compare `lastSyncDate` against current date; trigger background catch-up if stale.
  - Daily timer: Calculate milliseconds until next 8:00 AM EST (America/New_York) and register `setTimeout` / recurring 24-hour interval.
  - Endpoints: Add `GET /api/sync/status` and `POST /api/sync/trigger`.

### Step 3: Package Script & Launcher Integration
- Add `"sync:daily": "node scripts/morning_sync.js"` to `package.json`.
- Provide macOS LaunchAgent plist template (`com.scout144.morningupdate.plist`) for system-level scheduled execution at 8:00 AM daily.

### Step 4: Verification & Log Updates
- Validate CLI execution (`npm run sync:daily`).
- Validate server endpoints and startup hook.
- Run `npm run build` to ensure no frontend bundle regressions.

## 2. Dependencies & Constraints
- Native Node.js `fetch`, `fs`, `path`, `xml2js`.
- Respect SEC EDGAR rate limit policy (`< 10 req/sec`, user-agent header included).

## 3. Risks & Mitigations
| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| SEC daily index not yet published early in the morning | Medium | Check previous business day if today's index is 404/not yet released; retry hourly |
| Rate-limiting / network timeouts | Medium | Exponential backoff and polite delay (150ms) |
| App launch occurs after morning hours | Low | On-boot stale check ensures sync runs whenever user launches the app |
