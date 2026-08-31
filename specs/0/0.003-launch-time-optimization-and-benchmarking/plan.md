# Implementation Plan: 0.003 Launch Time Optimization & Benchmarking

## 1. Technical Strategy

### Phase 1: Persistent Pre-Indexed Cache Engine (`server.js`)
- Add compact index management:
  - Cache file: `cache/filings_index_cache.json`.
  - Manifest file: `cache/filings_index_manifest.json` (stores mtimes of individual date files).
  - On startup:
    1. Read `cache/filings_index_cache.json` if available.
    2. Check `mtime` of `cache/2026-*.json` files against manifest.
    3. If manifest matches: instant load (< 15ms).
    4. If new/modified files detected: load cache + parse only the changed files + update compact cache asynchronously.

### Phase 2: Instant Express Server Binding (`server.js`)
- Move `app.listen()` to execute immediately on process start.
- Bind port 5005 right away so health checks and initial page loads connect without cold-start blocking.

### Phase 3: Launcher Active Polling (`Launch Scout 144.command`)
- Replace:
  ```bash
  sleep 2
  open -a "Google Chrome" "http://127.0.0.1:3000/"
  ```
  With high-speed readiness polling:
  ```bash
  for i in {1..40}; do
    if curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3000/" 2>/dev/null | grep -q "200"; then
      break
    fi
    sleep 0.05
  done
  open -a "Google Chrome" "http://127.0.0.1:3000/"
  ```

### Phase 4: Benchmarking Suite & npm Scripts (`package.json`)
- Add `"benchmark": "node scripts/benchmark_launch.js"` in `package.json`.
- Execute benchmark suite, generate `benchmark_results.json`, and compare before vs after numbers.

## 2. Risks & Mitigations
| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| Stale compact index if user updates `settings.json` weights | Medium | Check `mtime` of `settings.json` in addition to date files; invalidate compact cache if scoring weights change |
| Port polling loop hangs if Vite fails to start | Low | Fixed 40-iteration cap (2 seconds max) fallback |
