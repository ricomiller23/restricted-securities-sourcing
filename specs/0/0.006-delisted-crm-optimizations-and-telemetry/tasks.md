# Task Breakdown: 0.006 Delisted CRM Database Optimization, Telemetry & 24h Freshness

## Status Legend
- `[ ]` Pending
- `[x]` Completed
- `[-]` Cancelled/Deferred

---

### Phase 1: Security Audit & Package Configuration
- [x] **Task 1.1**: Run `npm audit fix` and upgrade `vite` to `^6.4.3` in `delisted-crm-database` (0 vulnerabilities confirmed).
- [x] **Task 1.2**: Add `"sync:daily"` to `delisted-crm-database/package.json`.

### Phase 2: Launch Automation & Timestamp Profiling
- [x] **Task 2.1**: Create `Launch Delisted CRM.command` with milestone latency loggers and active HTTP readiness polling.

### Phase 3: 24-Hour Freshness Resolver Module
- [x] **Task 3.1**: Create `delisted-crm-database/src/utils/freshness.js` with market calendar resolver and 24h data validator.

### Phase 4: Observability & Telemetry UI
- [x] **Task 4.1**: Build `delisted-crm-database/src/components/TelemetryModal.jsx` displaying live latency, memory stats, 1,704 issuer metrics, and sync history.
- [x] **Task 4.2**: Integrate live Telemetry Badge and 24h Freshness Badge into `delisted-crm-database/src/components/Navbar.jsx`.

### Phase 5: Verification, Build & Documentation
- [x] **Task 5.1**: Run `npm run build` in `delisted-crm-database` to verify clean bundle.
- [x] **Task 5.2**: Test `Launch Delisted CRM.command`.
- [x] **Task 5.3**: Update `.config/ai/progress.ai` and `.config/ai/handoff.ai`.
