# Task Breakdown: 0.002 Automated Daily Morning Data Update Engine

## Status Legend
- `[ ]` Pending
- `[x]` Completed
- `[-]` Cancelled/Deferred

---

### Phase 1: Core Morning Sync Pipeline
- [ ] **Task 1.1**: Create `scripts/morning_sync.js` encapsulating SEC daily index retrieval, Form 144 XML parsing, scoring, and contact enrichment.
- [ ] **Task 1.2**: Implement business day calculation logic (skipping weekends and handling previous business day fallback).
- [ ] **Task 1.3**: Integrate regional cloud application sync trigger (`scripts/daily_sync_all_apps.cjs`).
- [ ] **Task 1.4**: Implement persistent sync state & audit history tracking in `cache/sync_history.json`.

### Phase 2: Express Server & Scheduler Integration
- [ ] **Task 2.1**: Implement `GET /api/sync/status` and `POST /api/sync/trigger` in `server.js`.
- [ ] **Task 2.2**: Implement startup check in `server.js` to auto-trigger catchup sync if today's cache is missing.
- [ ] **Task 2.3**: Schedule daily in-process timer aligned to 8:00 AM EST (America/New_York).

### Phase 3: CLI Script & macOS LaunchAgent Support
- [ ] **Task 3.1**: Add `"sync:daily"` script to `package.json`.
- [ ] **Task 3.2**: Create `scripts/com.scout144.morningupdate.plist` launchd configuration template and install helper script.

### Phase 4: Validation, Build, and Progress Documentation
- [ ] **Task 4.1**: Execute `npm run sync:daily` and verify cache output and logs.
- [ ] **Task 4.2**: Verify `npm run build` succeeds without bundle regressions.
- [ ] **Task 4.3**: Update `.config/ai/progress.ai` and `.config/ai/handoff.ai`.
