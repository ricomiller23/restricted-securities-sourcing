# Manual Testing Guide: 0.005 Instant Sourcing Feed & 24h Freshness

## Verification Checklist

### 1. Freshness Endpoint
- **Command**: `curl -s http://127.0.0.1:5005/api/feed/freshness`
- **Expected Outcome**: Returns `{ latestMarketDate: "YYYY-MM-DD", isCached: true/false, freshnessHours: N, certifiedFresh: true }`.

### 2. Instant Feed Load
- **Command**: `curl -w "\nTime: %{time_total}s\n" -s http://127.0.0.1:5005/api/feed?date=2026-08-28`
- **Expected Outcome**: Response in `< 0.01s` (< 10ms) returning filtered, scored Form 144 targets.

### 3. Accelerated Parallel Ingestion
- **Command**: `curl -s -X POST http://127.0.0.1:5005/api/sync/trigger`
- **Expected Outcome**: Ingestion completes in < 3s with active progress updates at `/api/sync/progress`.

### 4. Sourcing Feed UI
- **Action**: Open `http://127.0.0.1:3000/` in Google Chrome.
- **Expected Outcome**: Sourcing Feed loads immediately with `🟢 Verified Fresh (< 24h)` badge and displays recent filings without freezing.
