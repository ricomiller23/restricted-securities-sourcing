# Implementation Plan: 0.007 Direct SEC EDGAR Delisted Ingestion & Dataset Expansion

## 1. Technical Strategy

### Phase 1: SEC EDGAR Form 25 & 15 Batch Ingestion Engine
- Build `delisted-crm-database/scripts/ingest_sec_edgar_delistings.js`:
  - Downloads and parses SEC EDGAR `master.idx` quarterly index files for 2024, 2025, and 2026.
  - Filters for form types: `25`, `25-NSE`, `25/A`, `15-12G`, `15-12B`, `15-15D`, `15-12G/A`, `15-12B/A`, `15-15D/A`, `15F-12G`, `15F-12B`, `15F-15D`.
  - Maps CIKs to known ticker symbols using `company_tickers.json`.
  - Categorizes delisting event type, reason category, and clean shell viability score.

### Phase 2: Dataset Harmonization & Deduplication
- Merge existing enriched global records (AIM, Frankfurt, ASX, and pre-existing legal counsel contacts) with new SEC EDGAR delistings.
- Save to:
  - `delisted-crm-database/src/data/delisted_issuers_seed.json`
  - `delisted-crm-database/src/data/global_issuers_seed.js`

### Phase 3: Client Storage Version Migration
- Update `LOCAL_STORAGE_KEY` in `src/App.jsx` to `DELISTED_CRM_DATABASE_V12_EXPANDED`.
- Ensure fallback merge preserves user custom status/notes while loading the expanded catalog.

### Phase 4: Daily Cron & Live Sync Update
- Update `scripts/daily_cron_sync.py` and `triggerLiveSync()` in `App.jsx` to fetch active Form 25 / Form 15 index entries directly.

### Phase 5: Verification & Build
- Verify expanded record count in UI (> 2,500+ issuers).
- Verify table filtering, search, pagination, and Kanban rendering.
- Run `npm run build` in `delisted-crm-database`.
