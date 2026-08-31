# Specification: 0.007 Direct SEC EDGAR Delisted Ingestion & Dataset Expansion

## 1. Overview
This specification expands the Delisted CRM Database from the initial static 1,704 snapshot by connecting direct ingestion from SEC EDGAR master archives and daily index feeds for all **Form 25** (Exchange Delistings & Removals) and **Form 15** (Voluntary SEC Deregistrations & Going-Private) filings.

## 2. Goals & Requirements
1. **Direct SEC EDGAR Delisting Ingester**:
   - Parse SEC EDGAR master index files (`master.idx`) for Form 25, 25-NSE, 15-12G, 15-12B, 15-15D, and 15F filings across 2024, 2025, and 2026.
   - Extract CIK, Company Name, Filing Date, Accession Number, Form Type, and Document URL.
2. **Harmonized Dataset Builder**:
   - Clean, normalize, and score newly discovered delisted issuers (Viability Score, Clean Shell Rating, Reason Category).
   - Match with CIK-to-ticker mapping and extract known legal counsel / contact intelligence.
   - Generate expanded dataset in `global_issuers_seed.js` and `delisted_issuers_seed.json`.
3. **Smart LocalStorage Version Invalidation**:
   - Update `LOCAL_STORAGE_KEY` version (e.g., `DELISTED_CRM_DATABASE_V12_GLOBAL`) in `src/App.jsx` with automatic migration so the browser loads the expanded dataset immediately without manual cache clearing.
4. **Live SEC EDGAR Delisting Sync**:
   - Update `triggerLiveSync()` and `scripts/daily_cron_sync.py` to continuously fetch recent Form 25 / Form 15 filings from SEC EDGAR.

## 3. Acceptance Criteria
- [x] SEC EDGAR Form 25 & Form 15 ingestion script extracts thousands of real delisted/deregistered issuers.
- [x] `global_issuers_seed.js` and `delisted_issuers_seed.json` are populated with the expanded real-world SEC dataset.
- [x] App automatically mounts and displays the expanded dataset (> 2,500+ records) upon launch.
- [x] Search, region filters, reason category filters, and Kanban/Table views render smoothly.
- [x] `npm run build` in `delisted-crm-database` compiles cleanly.
