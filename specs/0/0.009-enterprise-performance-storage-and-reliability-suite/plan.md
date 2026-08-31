# Implementation Plan: 0.009 Enterprise Performance, Storage & Reliability Suite

## 1. Technical Strategy

### Phase 1: High-Capacity IndexedDB Storage Engine
- Build `delisted-crm-database/src/utils/db.js` providing `openDatabase()`, `getAllIssuers()`, `saveIssuers()`, `getMetadata()`, and `setMetadata()`.
- Implement automatic migration from `localStorage` (`DELISTED_CRM_DATABASE_V11_GLOBAL`).
- Integrate into `delisted-crm-database/src/hooks/useIssuersSync.js`.

### Phase 2: In-Memory Multi-Token Search Index
- Build `delisted-crm-database/src/utils/searchIndex.js` with inverted token map and prefix matching.
- Connect into `delisted-crm-database/src/App.jsx` filtered issuers calculation.

### Phase 3: Web Worker Background Sync Engine
- Build `delisted-crm-database/src/workers/secSyncWorker.js` to execute dynamic multi-page SEC signal fetching, deduplication, schema validation, and contact enrichment off the main thread.
- Integrate worker messaging into `useIssuersSync.js`.

### Phase 4: Pre-Commit Hook Guard
- Build `scripts/pre_commit.sh` that executes `npm run test:smoke`.
- Install hook into `.git/hooks/pre-commit`.

### Phase 5: Executive PDF Deal Dossier Generator
- Build `delisted-crm-database/src/utils/pdfExport.js` to format and trigger printable/exportable executive deal sheets with company profiles, contacts, shell ratings, and SEC filing history.

### Phase 6: PWA Manifest & Service Worker
- Build `delisted-crm-database/public/manifest.json` and `delisted-crm-database/public/sw.js`.
- Register service worker in `delisted-crm-database/src/main.jsx`.

### Phase 7: Verification & Release
- Test `npm run test:smoke` and `npm run build:all`.
- Update `.config/ai/progress.ai` and `.config/ai/handoff.ai`.
- Create PR #11, merge to `main`, and deploy to Vercel production.
