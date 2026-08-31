# Task Breakdown: 0.005 Instant Sourcing Feed & 24-Hour Data Freshness Guarantee

## Status Legend
- `[ ]` Pending
- `[x]` Completed
- `[-]` Cancelled/Deferred

---

### Phase 1: 24-Hour Freshness Resolver Module
- [x] **Task 1.1**: Create `lib/freshness.js` with `getLatestMarketDate()`, `validateDataFreshness()`, and market calendar calculations.
- [x] **Task 1.2**: Implement `GET /api/feed/freshness` in `server.js` returning active market date, cache presence, and freshness certification.

### Phase 2: Accelerated Concurrency Ingestion & Progress Streaming
- [x] **Task 2.1**: Implement controlled concurrent batch fetcher (5 workers, <= 9.5 req/s) in `lib/sec_ingest.js` and `server.js`.
- [x] **Task 2.2**: Add `GET /api/sync/progress` returning real-time percent and filing counters during active ingestion.

### Phase 3: Feed API Non-Blocking Response
- [x] **Task 3.1**: Optimize `/api/feed` to return cached results in < 1ms, or trigger asynchronous parallel ingestion with progress state.

### Phase 4: Frontend Sourcing Feed & Freshness Certification
- [x] **Task 4.1**: Update `src/components/SourcingFeed.jsx` to mount with the latest certified fresh market date.
- [x] **Task 4.2**: Add live Freshness Badge (`🟢 Verified Fresh (< 24h)`) and animated progress bar during sync.
- [x] **Task 4.3**: Add stale data warning guard preventing uncertified data (> 24h) from displaying as current.

### Phase 5: Verification & Documentation
- [x] **Task 5.1**: Validate feed load time (< 10ms).
- [x] **Task 5.2**: Test concurrent SEC ingestion and verify rate limit compliance.
- [x] **Task 5.3**: Run `npm run build` to confirm zero frontend build errors.
- [x] **Task 5.4**: Update `.config/ai/progress.ai` and `.config/ai/handoff.ai`.
