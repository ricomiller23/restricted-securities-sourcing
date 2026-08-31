# Task Breakdown: 0.004 End-to-End Timing Observability & Telemetry

## Status Legend
- `[ ]` Pending
- `[x]` Completed
- `[-]` Cancelled/Deferred

---

### Phase 1: Server Telemetry Module & Middleware
- [x] **Task 1.1**: Create `lib/telemetry.js` providing in-memory route performance aggregators, lifecycle timing trackers, and memory telemetry.
- [x] **Task 1.2**: Implement timing middleware in `server.js` injecting `X-Response-Time` and `Server-Timing` headers with colorized console logs.
- [x] **Task 1.3**: Implement `GET /api/metrics` and `GET /api/observability` endpoints.
- [x] **Task 1.4**: Instrument startup lifecycle phases (`serverBindMs`, `tickerLoadMs`, `indexHydrationMs`, `totalWarmupMs`).

### Phase 2: Morning Sync Timing Instrumentation
- [x] **Task 2.1**: Instrument `scripts/morning_sync.js` with per-stage timing (ticker refresh, SEC index fetch, XML parsing throughput, regional app pings).
- [x] **Task 2.2**: Update `cache/sync_history.json` schema with granular stage breakdown metrics.

### Phase 3: Launcher Milestone Timestamp Profiling
- [x] **Task 3.1**: Instrument `Launch Scout 144.command` with milestone latency timers (port clear, process spawn, port 3000/5005 readiness, Chrome open).

### Phase 4: Frontend Live Telemetry UI
- [x] **Task 4.1**: Create `src/components/TelemetryDrawer.jsx` rendering live latency badge, startup milestone breakdown, memory stats, and route metrics table.
- [x] **Task 4.2**: Integrate `TelemetryDrawer` into `src/App.jsx` header.

### Phase 5: Validation, Build, and Progress Documentation
- [x] **Task 5.1**: Test `/api/metrics` and inspect HTTP response headers.
- [x] **Task 5.2**: Test `Launch Scout 144.command` and verify terminal milestone output.
- [x] **Task 5.3**: Run `npm run build` to confirm zero frontend bundle errors.
- [x] **Task 5.4**: Update `.config/ai/progress.ai` and `.config/ai/handoff.ai`.
