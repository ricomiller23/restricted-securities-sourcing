# Development Notes: 0.004 Timing Observability & Telemetry

## W3C Server-Timing Specification
- Standardized header syntax: `Server-Timing: total;dur=12.4, db;dur=3.1`
- Modern browsers (Chrome DevTools Network tab) automatically parse this header and display backend execution timing in the "Server Timing" section of the waterfall breakdown.

## High-Resolution Clock
- Using `performance.now()` (via Node.js `perf_hooks` / global) guarantees sub-millisecond precision unaffected by system clock adjustments.
