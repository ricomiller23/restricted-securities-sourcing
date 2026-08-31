# Specification: 0.003 Launch Time Optimization & Benchmarking

## 1. Overview
This specification details the launch time optimization, performance profiling, and empirical benchmarking for the Scout 144 / Restricted Securities Sourcing application. The target is to reduce end-to-end launch latency by **>75%** (from ~2.6s down to under 500ms) by replacing blind launcher wait loops with active readiness polling, utilizing a persistent pre-indexed filings cache, and parallelizing server bootstrap.

## 2. Baseline Performance Statistics (Before Optimization)

Empirical baseline metrics gathered on macOS:

| Component / Phase | Baseline Latency | Root Cause |
| :--- | :--- | :--- |
| **Raw Cache Disk Scan & Parse** | **221.89ms - 392.44ms** | Synchronously reading & parsing 117 separate JSON files (150 MB, 37,612 filings) |
| **Backend Express Server Boot** | **511.16ms** | Main JavaScript thread blocked by full re-scoring & indexing of 37k records before `app.listen()` |
| **Vite Dev Server Boot** | **102.82ms** | Cold start of Vite dev server on port 3000 |
| **Launcher Fixed Sleep** | **2,000.00ms** | Hardcoded `sleep 2` in [`Launch Scout 144.command`](file:///Users/ericmiller/NEW%20JUNE%2026/Launch%20Scout%20144.command) |
| **Total Baseline Launch Time** | **~2,613.98ms (2.61s)** | Combined startup latency from double-clicking launcher to browser open |

## 3. Goals & Optimization Targets
- **Target Launch Time**: Reduce end-to-end launch time from ~2.61s to **< 500ms** (>75% reduction).
- **Persistent Compact Index Cache (`cache/filings_index_cache.json`)**: Pre-compile indexed records into a single optimized payload (~4-5 MB instead of 150 MB across 117 files) with automatic mtime-based incremental updates.
- **Immediate Server Listen**: Allow Express to bind and accept HTTP requests in < 30ms, streaming/hydrating indices asynchronously.
- **Active Readiness Polling in Launcher**: Replace `sleep 2` in `Launch Scout 144.command` with sub-50ms HTTP readiness polling so Google Chrome opens immediately when Vite and Express are ready.
- **Repeatable Automated Benchmarking**: Provide `npm run benchmark` to measure and compare before vs after performance metrics anytime.

## 4. Architectural Changes
1. **Compact Index Cache**:
   - `server.js` checks `cache/filings_index_cache.json`.
   - If present and valid, loads the entire pre-indexed dataset in ~10-15ms.
   - If any new or modified `cache/2026-*.json` files exist, incrementally indexes only the changed files and writes back the updated compact cache.
2. **Asynchronous Express Initialization**:
   - `app.listen(5005)` is called immediately upon startup.
   - Initial endpoint requests queue or serve pre-indexed cache seamlessly.
3. **Smart Shell Launcher**:
   - `Launch Scout 144.command` polls `http://127.0.0.1:3000` with 25ms intervals instead of `sleep 2`.
4. **Benchmark Suite**:
   - `scripts/benchmark_launch.js` records and outputs detailed breakdown comparisons.

## 5. Acceptance Criteria
- [ ] `scripts/benchmark_launch.js` measures and outputs before vs after statistics.
- [ ] Disk cache indexing time reduced by >85% (from >200ms down to <25ms).
- [ ] Server cold start readiness reduced by >60% (from >500ms down to <150ms).
- [ ] Launcher opens browser via active polling without blind `sleep 2` delays.
- [ ] `npm run build` and all application functions (CRM, FTS, feed) remain 100% functionally identical.
