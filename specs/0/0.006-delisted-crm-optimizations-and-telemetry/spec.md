# Specification: 0.006 Delisted CRM Database Optimization, Telemetry & 24h Freshness

## 1. Overview
This specification delivers the full optimization suite to the **Delisted CRM Database** ([https://delisted-crm-database.vercel.app](https://delisted-crm-database.vercel.app)): dependency security vulnerability audit, launch optimization, automated daily morning sync, live timing observability & telemetry drawer, and a strict 24-hour data freshness guarantee.

## 2. Goals & Requirements
1. **Security Vulnerability Audit**: Resolve all npm security vulnerabilities (0 vulnerabilities).
2. **Launch Script (`Launch Delisted CRM.command`)**: High-precision startup script with port management and active HTTP readiness polling.
3. **Automated Daily Sync Engine**: Daily sync pipeline (`npm run sync:daily`) and macOS LaunchAgent for morning updates.
4. **Timing Observability & Telemetry (`TelemetryModal.jsx` / Navbar Badge)**: Real-time telemetry monitoring, network latency tracking, memory consumption, and sync history.
5. **24-Hour Freshness Guarantee**: Display active market date certification badge, validate that issuer and delisting filing data is within the 24-hour market window, and prevent stale unverified data from masquerading as current.

## 3. Acceptance Criteria
- [x] `npm audit` inside `delisted-crm-database` confirms 0 vulnerabilities.
- [x] `Launch Delisted CRM.command` starts the application with milestone latency loggers.
- [x] `npm run sync:daily` script is configured in `package.json`.
- [x] Live Telemetry & 24h Freshness badges are integrated into the Navbar.
- [x] `npm run build` in `delisted-crm-database` compiles cleanly with zero errors.
