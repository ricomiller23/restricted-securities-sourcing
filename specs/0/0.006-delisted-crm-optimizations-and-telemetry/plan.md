# Implementation Plan: 0.006 Delisted CRM Database Optimization, Telemetry & 24h Freshness

## 1. Technical Strategy

### Phase 1: Security Audit & Package Configuration
- Verified `npm audit` and upgraded dependencies to 0 vulnerabilities.
- Add `"sync:daily"` and `"benchmark"` scripts to `delisted-crm-database/package.json`.

### Phase 2: Launch Automation (`Launch Delisted CRM.command`)
- Create `delisted-crm-database/Launch Delisted CRM.command` with:
  - Port clearing (port 5173 / 3001).
  - Dev server spawn.
  - Active sub-50ms polling against local server.
  - Timestamp milestone loggers.

### Phase 3: Daily Morning Sync & Freshness Resolver
- Create `delisted-crm-database/src/utils/freshness.js`:
  - Active market calendar calculator.
  - 24-hour freshness verification.
- Connect daily cron sync script.

### Phase 4: Observability & Telemetry UI Component
- Build `delisted-crm-database/src/components/TelemetryModal.jsx`:
  - Live round-trip ping.
  - Total issuer records indexed (1,704).
  - Memory usage and data freshness breakdown.
- Integrate Telemetry & Freshness badges into `Navbar.jsx`.

### Phase 5: Verification & Documentation
- Test build in `delisted-crm-database`.
- Test launcher and update progress/handoff logs.
