# Task Breakdown: 0.003 Launch Time Optimization & Benchmarking

## Status Legend
- `[ ]` Pending
- `[x]` Completed
- `[-]` Cancelled/Deferred

---

### Phase 1: Benchmarking Suite & Baseline Recording
- [x] **Task 1.1**: Create `scripts/benchmark_launch.js` profiling disk parse, server boot, and frontend boot.
- [x] **Task 1.2**: Execute baseline benchmark and record initial metrics (221ms disk parse, 511ms backend boot, 2000ms launcher delay).

### Phase 2: Compact Indexed Cache Implementation
- [ ] **Task 2.1**: Implement pre-compiled `cache/filings_index_cache.json` and manifest invalidation in `server.js`.
- [ ] **Task 2.2**: Implement fast startup hydration using compact index and incremental updates for modified date files.

### Phase 3: Server Non-Blocking Listen & Launcher Polling
- [ ] **Task 3.1**: Move Express `app.listen()` to bind port 5005 immediately on process start.
- [ ] **Task 3.2**: Optimize `Launch Scout 144.command` with 25-50ms HTTP readiness polling replacing the hardcoded `sleep 2`.

### Phase 4: Verification, Post-Optimization Benchmark, and Documentation
- [ ] **Task 4.1**: Add `"benchmark": "node scripts/benchmark_launch.js"` script to `package.json`.
- [ ] **Task 4.2**: Run post-optimization benchmark and verify >75% latency reduction.
- [ ] **Task 4.3**: Verify `npm run build` and UI functionality.
- [ ] **Task 4.4**: Update `.config/ai/progress.ai`, `.config/ai/handoff.ai`, and benchmark comparison tables.
