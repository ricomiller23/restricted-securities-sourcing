# Manual Testing Guide: 0.002 Automated Daily Morning Data Update Engine

## Verification Steps

### 1. Standalone Morning Sync Script
- **Command**: `npm run sync:daily`
- **Expected Outcome**:
  - Script identifies target market dates (e.g. today / last business day).
  - Fetches SEC daily index if available.
  - Parses and scores Form 144 records.
  - Updates `cache/YYYY-MM-DD.json` and `cache/sync_history.json`.
  - Pings regional apps without unhandled exceptions.

### 2. Server Sync Endpoints
- **Endpoint**: `GET http://127.0.0.1:5005/api/sync/status`
- **Expected Outcome**: Returns JSON object with `status` (`idle` or `syncing`), `lastSyncTime`, and `lastRecordsCount`.
- **Endpoint**: `POST http://127.0.0.1:5005/api/sync/trigger`
- **Expected Outcome**: Initiates background sync and returns `{ "message": "Morning synchronization initiated" }`.

### 3. Automatic Startup Sync Check
- **Action**: Start the server via `node server.js` or `npm run dev`.
- **Expected Outcome**: Server logs indicate whether today's data is present and schedules next sync for 8:00 AM EST.

### 4. Production Build Verification
- **Command**: `npm run build`
- **Expected Outcome**: Vite production build completes successfully.
