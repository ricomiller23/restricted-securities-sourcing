# Task Breakdown: 0.007 TOCA Architecture & Bundle Optimization

## Status Legend
- `[ ]` Pending
- `[x]` Completed
- `[-]` Cancelled/Deferred

---

### Phase 1: Policy Codification
- [x] **Task 1.1**: Create `.config/ai/toca.ai` with TOCA principles and implementation checklists.
- [x] **Task 1.2**: Update `start.ai` to link directly to `.config/ai/toca.ai`.

### Phase 2: Hook & Component Modularization
- [x] **Task 2.1**: Create `delisted-crm-database/src/hooks/useIssuersSync.js`.
- [x] **Task 2.2**: Refactor `delisted-crm-database/src/App.jsx` to use `useIssuersSync`.

### Phase 3: Bundler Optimization
- [x] **Task 3.1**: Configure `manualChunks` in `delisted-crm-database/vite.config.js`.

### Phase 4: Verification & Release
- [x] **Task 4.1**: Verify `npm run build` passes with zero chunk warnings.
- [x] **Task 4.2**: Update `.config/ai/progress.ai` and `.config/ai/handoff.ai`.
- [x] **Task 4.3**: Commit, push branch, create PR, and merge to `main`.
- [x] **Task 4.4**: Deploy to Vercel production.
