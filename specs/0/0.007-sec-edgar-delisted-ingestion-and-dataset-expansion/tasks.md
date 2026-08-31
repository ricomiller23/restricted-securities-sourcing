# Task Breakdown: 0.007 Direct SEC EDGAR Delisted Ingestion & Dataset Expansion

## Status Legend
- `[ ]` Pending
- `[x]` Completed
- `[-]` Cancelled/Deferred

---

### Phase 1: SEC EDGAR Master Index Ingestion Script
- [x] **Task 1.1**: Create `delisted-crm-database/scripts/ingest_sec_edgar_delistings.js` to parse SEC master index files across 2024–2026 for Form 25 and Form 15 filings.
- [x] **Task 1.2**: Map discovered CIKs to company tickers using `cache/company_tickers.json`.

### Phase 2: Dataset Harmonization & Seed Generation
- [x] **Task 2.1**: Merge newly discovered SEC delisted companies with existing regional entries (AIM, Frankfurt, ASX) and contacts.
- [x] **Task 2.2**: Generate expanded `delisted_issuers_seed.json` and `global_issuers_seed.js`.

### Phase 3: Client Storage Version Migration
- [x] **Task 3.1**: Bump `LOCAL_STORAGE_KEY` to `DELISTED_CRM_DATABASE_V12_EXPANDED` in `src/App.jsx` with automatic migration.

### Phase 4: Daily Cron & Live Sync Update
- [x] **Task 4.1**: Update `scripts/daily_cron_sync.py` and `triggerLiveSync()` in `src/App.jsx`.

### Phase 5: Verification & Production Build
- [x] **Task 5.1**: Test loading the expanded database in `delisted-crm-database`.
- [x] **Task 5.2**: Run `npm run build` in `delisted-crm-database`.
- [x] **Task 5.3**: Update `.config/ai/progress.ai` and `.config/ai/handoff.ai`.
