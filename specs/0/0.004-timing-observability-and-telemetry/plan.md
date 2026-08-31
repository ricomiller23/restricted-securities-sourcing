# Implementation Plan: 0.004 End-to-End Timing Observability & Telemetry

## 1. Technical Strategy

### Phase 1: Server Telemetry Core (`lib/telemetry.js` & `server.js`)
- Build a lightweight `lib/telemetry.js` module tracking:
  - `startupTimers`: `processStart`, `serverBindMs`, `tickerLoadMs`, `indexHydrationMs`, `startupCatchupMs`, `totalWarmupMs`.
  - `routeMetrics`: Map of `[METHOD] [route]` -> `{ count, totalMs, minMs, maxMs, avgMs, last50 }`.
  - `systemStats`: Node version, platform, memory usage (`rss`, `heapUsed`, `heapTotal`, `external`), uptime.
- Add Express middleware in `server.js`:
  - Starts high-resolution timer on `req`.
  - Intercepts `res.on('finish')` to calculate exact elapsed milliseconds.
  - Sets `X-Response-Time` and `Server-Timing` headers.
  - Logs formatted entry: `[API] GET /api/filings?form=144 200 (14.2ms)`.
- Expose `GET /api/metrics` and `GET /api/observability`.

### Phase 2: Sync Engine Granular Timing (`scripts/morning_sync.js`)
- Add stage timers to `runMorningSync()`:
  - Ticker refresh duration.
  - Per-date SEC index fetch duration.
  - Batch Form 144 XML parsing duration & filings/second throughput.
  - Regional app ping response times.
- Save detailed stage timings into `cache/sync_history.json`.

### Phase 3: Launcher Timing Milestones (`Launch Scout 144.command`)
- Instrument the shell script with millisecond timing math using `perl` or `date +%s%N`:
  - Print elapsed time for: Port clearing, dev process spawn, Vite port 3000 ready, Express port 5005 ready, Chrome launch.

### Phase 4: Frontend UI Telemetry Component (`src/components/TelemetryDrawer.jsx` & `src/App.jsx`)
- Create a sleek, modern Telemetry Badge in the navbar showing live backend ping/latency (e.g. `⚡ 14ms`) and a button to open the Telemetry Drawer.
- The drawer displays:
  - Startup lifecycle breakdown bars (bind, tickers, index, warmup).
  - Live route performance table (calls, average latency, min/max).
  - Memory consumption gauges.
  - Last sync timestamp and status.

### Phase 5: Verification & Documentation
- Test API endpoints and headers.
- Test frontend telemetry drawer and verify `npm run build`.
- Update `.config/ai/progress.ai` and `.config/ai/handoff.ai`.

## 2. Risks & Mitigations
| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| Telemetry overhead adds latency | Low | In-memory atomic counters and `performance.now()` have sub-microsecond overhead (<0.01ms) |
| UI clutter | Low | Non-intrusive badge in navbar header with collapsible drawer/modal |
