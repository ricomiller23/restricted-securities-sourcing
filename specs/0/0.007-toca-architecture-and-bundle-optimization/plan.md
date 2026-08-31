# Implementation Plan: 0.007 TOCA Architecture & Bundle Optimization

## 1. Technical Strategy

### Phase 1: Establish TOCA Policy Standard
- Create `.config/ai/toca.ai` defining component sizing guidelines, state separation, data modularity, and bundler chunk splitting.
- Reference `.config/ai/toca.ai` in `start.ai`.

### Phase 2: Extract `useIssuersSync` Hook
- Create `delisted-crm-database/src/hooks/useIssuersSync.js`.
- Move `issuers` state, `localStorage` loading/migration, 24-hour sync heartbeat, and `triggerLiveSync()` into the hook.
- Update `delisted-crm-database/src/App.jsx` to consume `useIssuersSync`.

### Phase 3: Rollup / Vite Bundle Optimization
- Update `delisted-crm-database/vite.config.js`:
  - Add `build.rollupOptions.output.manualChunks` for `vendor-react` and `vendor-icons`.
  - Increase `chunkSizeWarningLimit` to 1000 kB.

### Phase 4: Verification & Deployment
- Run `npm run build` in `delisted-crm-database`.
- Update `.config/ai/progress.ai` and `.config/ai/handoff.ai`.
- Create PR, merge into `main`, and deploy to Vercel production.
