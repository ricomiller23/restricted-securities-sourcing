# Manual Testing Guide: 0.004 End-to-End Timing Observability & Telemetry

## Verification Checklist

### 1. HTTP Response Headers
- **Command**: `curl -i http://127.0.0.1:5005/api/settings`
- **Expected Outcome**:
  - Response contains `X-Response-Time: X.XXms`
  - Response contains `Server-Timing: total;dur=X.XX`

### 2. Metrics Endpoint Telemetry
- **Command**: `curl -s http://127.0.0.1:5005/api/metrics`
- **Expected Outcome**:
  - Returns JSON object with `system`, `startupTimings`, `routeMetrics`, and `cacheStats`.

### 3. Frontend Telemetry Widget
- **Action**: Open `http://127.0.0.1:3000/` and click the "⚡ Telemetry" badge in the navigation bar.
- **Expected Outcome**:
  - Drawer opens smoothly showing live API response latency, startup breakdown, route metrics, and memory utilization.

### 4. Launcher Timestamp Profiling
- **Action**: Run `./Launch\ Scout\ 144.command`
- **Expected Outcome**:
  - Terminal prints elapsed milliseconds for every milestone (Port clearing -> Process spawn -> Port readiness -> Chrome open).
