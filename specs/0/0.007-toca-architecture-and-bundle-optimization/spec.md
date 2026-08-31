# Specification: 0.007 Token Optimized Component Architecture (TOCA) & Bundle Optimization

## 1. Overview
This specification establishes the Token Optimized Component Architecture (TOCA) standard across all current and future builds in this repository. It codifies `.config/ai/toca.ai` as the governing architectural policy, refactors `delisted-crm-database` state/sync logic into a dedicated custom hook (`src/hooks/useIssuersSync.js`), and configures Rollup `manualChunks` in `vite.config.js` to eliminate monolithic chunk warnings and dramatically reduce AI context window bloat.

## 2. Requirements & Constraints
1. **TOCA Policy Definition ([`.config/ai/toca.ai`](file:///Users/ericmiller/NEW%20JUNE%2026/.config/ai/toca.ai))**:
   - Codify TOCA principles: Component size limits (< 250 lines), separation of state hooks from JSX presentation, isolated data/service boundaries, and bundle chunk splitting.
2. **State & Synchronization Hook Extraction**:
   - Extract localStorage persistence, 24-hour sync intervals, and upstream EDGAR signal fetching into `src/hooks/useIssuersSync.js`.
   - Maintain 100% of existing UI layout, styles, components, and user experience.
3. **Vite/Rollup Bundle Optimization**:
   - Configure `manualChunks` in `vite.config.js` to split vendor dependencies (`vendor-react`, `vendor-icons`) and prevent > 500kB monolithic chunk warnings.
4. **Verification**:
   - Verify `npm run build` compiles with zero chunk size warnings.

## 3. Acceptance Criteria
- [x] `.config/ai/toca.ai` is created and referenced.
- [x] `src/hooks/useIssuersSync.js` manages state and 24h sync cleanly.
- [x] `src/App.jsx` imports `useIssuersSync` with zero UI/styling regressions.
- [x] `vite.config.js` configures `manualChunks` properly.
- [x] `npm run build` compiles without warnings.
