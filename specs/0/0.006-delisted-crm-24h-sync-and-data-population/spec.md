# Specification: 0.006 Delisted CRM 24-Hour Automated Synchronization & Data Population

## 1. Overview
This specification implements an automated 24-hour background synchronization engine for the Delisted CRM Database ([https://delisted-crm-database.vercel.app](https://delisted-crm-database.vercel.app)). It guarantees that every 24 hours (and on initial daily app open), the database automatically checks for newly filed delisting notices, fallen angel signals, and contact updates, merging and populating new data seamlessly with existing records without altering any existing UI formatting, layout, or design.

## 2. Requirements & Constraints
1. **Zero UI / Formatting Alterations**:
   - Keep 100% of the existing user interface, styles, theme, color scheme, tabs, modals, and layouts identical.
2. **Automated 24-Hour Schedule**:
   - On application startup/mount: Compare current timestamp with `DELISTED_CRM_LAST_SYNC_TIMESTAMP`. If 24 hours (86,400,000 ms) have elapsed, trigger background synchronization automatically.
   - While application is open: Maintain an active 24-hour interval timer that executes synchronization cycles.
3. **Smart Data Population & Non-Destructive Merge**:
   - **New Issuers**: Discovered issuers not in the current database are automatically prepended and formatted into the active dataset.
   - **Existing Issuers**: For issuers already present in the database, enrich missing contact fields (`email`, `phone`, `ceo`, `legalCounsel`) if new details are discovered, while preserving all user-modified `status`, `notes`, `activities`, and `reminders`.
   - Update `DELISTED_CRM_LAST_SYNC_TIMESTAMP` and persist the merged state to local storage.

## 3. Acceptance Criteria
- [x] UI, layout, styling, themes, and modals remain completely unchanged.
- [x] Sync automatically triggers on mount if 24 hours have elapsed since last sync.
- [x] New delisting records are populated alongside existing data without duplicates.
- [x] Existing records are enriched with newly discovered contact intelligence while preserving user notes and custom status.
- [x] `npm run build` compiles with zero errors.
