# Manual Testing Guide: 0.007 TOCA Architecture

## Verification Checklist

### 1. Hook Isolation & State Persistence
- **Action**: Load application at `http://127.0.0.1:5173/`. Update issuer notes and status.
- **Expected Outcome**: State persists cleanly across reloads via `useIssuersSync`.

### 2. Zero UI Regression
- **Action**: Test Table View, Kanban View, Counsel View, Analytics View, and Modals.
- **Expected Outcome**: 100% visual layout, styling, and interactivity preserved.

### 3. Build & Chunk Optimization
- **Action**: Run `npm run build` in `delisted-crm-database`.
- **Expected Outcome**: Zero chunk size warnings; vendor bundles split cleanly.
