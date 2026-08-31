# Implementation Plan: 0.006 Delisted CRM 24-Hour Automated Synchronization & Data Population

## 1. Technical Strategy

### Phase 1: 24-Hour Timer & Startup Check
- Define `LAST_SYNC_KEY = "DELISTED_CRM_LAST_SYNC_TIMESTAMP"`.
- In `App.jsx`, add a `useEffect` hook that:
  - Reads `LAST_SYNC_KEY` from `localStorage`.
  - If `Date.now() - lastSync > 24 * 60 * 60 * 1000` (or `!lastSync`), triggers `triggerLiveSync()`.
  - Sets up a `setInterval` running every 24 hours while the tab is active.

### Phase 2: Enhanced Smart Merge & Pagination
- Refactor `triggerLiveSync()`:
  - Dynamically page through upstream signal endpoints (`https://edgar-insider-scout.vercel.app/api/signals/fallen-angels/delisted-issuers`) until all available pages are fetched.
  - Fetch upstream contacts map (`https://edgar-insider-scout.vercel.app/api/contacts`).
  - Merge strategy:
    - Build a fast `Map<cik, item>` from existing `issuers`.
    - For each fetched item:
      - If existing: update missing fields (`email`, `phone`, `ceo`, `legalCounsel`) if new values exist and current is `"Not Available"`.
      - If new: create normalized record and add to `newItems`.
    - Combine `[...newItems, ...updatedExisting]`.
    - Save updated timestamp to `localStorage.setItem(LAST_SYNC_KEY, Date.now())`.

### Phase 3: Daily CLI Sync Script Update
- Update `delisted-crm-database/scripts/daily_cron_sync.py` to use dynamic pagination and merge with existing dataset so CLI cron also populates new data with existing data.

### Phase 4: Verification & Build
- Verify `npm run build` in `delisted-crm-database`.
- Test sync execution and state merge.
- Document in `progress.ai` and `handoff.ai`.
