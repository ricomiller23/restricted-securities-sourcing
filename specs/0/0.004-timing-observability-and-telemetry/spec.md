# Specification: 0.004 End-to-End Timing Observability & Telemetry

## 1. Overview
This specification details the comprehensive timing observability, real-time latency monitoring, and telemetry system for the Scout 144 / Restricted Securities Sourcing application. The goal is to provide complete transparency into startup phases, API route latencies, SEC ingestion throughput, and frontend network performance.

## 2. Background & Problem Statement
While launch optimizations (Spec 0.003) significantly improved startup speeds, there was no continuous observability mechanism to monitor real-time latencies, diagnose bottlenecks in production/dev workflows, track SEC rate-limit consumption, or inspect startup milestones in real time.

Engineers and users need instant visibility into:
1. Server bootstrap and indexing lifecycle milestones.
2. Individual API endpoint response times and request throughput.
3. Morning sync pipeline performance (filings/second, SEC index fetch duration).
4. Client-side network fetch times and UI render latency.

## 3. Goals & Requirements
- **Server Lifecycle Timing**: Instrument and record exact durations (in milliseconds) for server port binding, company ticker hydration, compact index load, and startup sync verification.
- **Request-Level Timing Middleware**: Add standard `X-Response-Time` and W3C `Server-Timing` headers to all Express responses, with structured colorized console logs.
- **Real-Time Telemetry API (`GET /api/metrics`)**: Expose live server metrics including memory usage (`rss`, `heapUsed`), route-level performance aggregates (calls, min/max/avg latency), cache statistics, and startup phase timings.
- **Frontend Observability Component**: Add a live telemetry status indicator and performance drawer/modal in the React UI displaying real-time API response times, memory health, and sync freshness.
- **Launcher Milestone Profiling**: Instrument [`Launch Scout 144.command`](file:///Users/ericmiller/NEW%20JUNE%2026/Launch%20Scout%20144.command) with high-precision timestamp markers to log exact launch milestones to terminal.
- **Sync Pipeline Telemetry**: Instrument [`scripts/morning_sync.js`](file:///Users/ericmiller/NEW%20JUNE%2026/scripts/morning_sync.js) with granular per-stage timers and filings-per-second throughput metrics.

## 4. Architectural Design
- **Telemetry Manager (`lib/telemetry.js`)**: In-memory singleton collecting route latency histograms, startup milestones, and system resources.
- **Express Middleware (`server.js`)**: High-resolution timer (`performance.now()`) wrapped around request lifecycles.
- **React Telemetry Widget (`src/components/TelemetryDrawer.jsx`)**: Displays live metrics without interfering with existing CRM / FTS workflows.
- **Metrics Endpoint (`GET /api/metrics`)**: Standardized JSON endpoint for monitoring tools and frontend dashboard.

## 5. Acceptance Criteria
- [x] `GET /api/metrics` returns full startup breakdown, route latencies, memory stats, and cache status.
- [x] All API responses include `X-Response-Time` and `Server-Timing` headers.
- [x] Console logs format API requests with colorized method, path, status, and duration.
- [x] `Launch Scout 144.command` prints high-precision milestone timestamps.
- [x] Frontend displays live telemetry badge/drawer showing latency and system health.
- [x] `npm run build` succeeds cleanly without performance degradation.
