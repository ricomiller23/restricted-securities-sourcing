# Manual Testing Guide: 0.009 Enterprise Performance, Storage & Reliability Suite

## Verification Checklist

### 1. IndexedDB Persistence & Migration
- **Action**: Open browser DevTools -> Application -> Storage -> IndexedDB -> `DelistedCRM_DB`.
- **Expected Outcome**: Table `issuers` contains all records; updates persist without 5MB limits.

### 2. Sub-0.5ms In-Memory Search
- **Action**: Type search terms (e.g., "Nasdaq shell", "Delaware", "Securities") in search bar.
- **Expected Outcome**: Instant instantaneous table filtering with zero keystroke lag.

### 3. Web Worker Off-Thread Ingestion
- **Action**: Click "Auto-Sync" or let 24h background sync run.
- **Expected Outcome**: UI remains 60fps responsive with zero frame drops during ingestion.

### 4. Git Pre-Commit Hook
- **Action**: Run `git commit` on any test change.
- **Expected Outcome**: Automated smoke test runs and passes in ~10ms before commit succeeds.

### 5. PDF Dossier Generation
- **Action**: Open any issuer -> click "Executive Dossier" -> click "Export Dossier".
- **Expected Outcome**: Generates clean executive deal sheet layout ready for print/PDF export.

### 6. PWA Service Worker
- **Action**: Check Chrome address bar for install icon / DevTools -> Application -> Service Workers.
- **Expected Outcome**: Service worker active with offline caching.
