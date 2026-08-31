# Manual Testing Guide: 0.007 Direct SEC EDGAR Delisted Ingestion

## Verification Checklist

### 1. Ingestion Execution
- **Command**: `cd delisted-crm-database && node scripts/ingest_sec_edgar_delistings.js`
- **Expected Outcome**: Ingests hundreds/thousands of Form 25 and Form 15 filings from SEC EDGAR.

### 2. Record Count in UI
- **Action**: Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/)
- **Expected Outcome**: Navbar and table display the expanded dataset count (significantly greater than 1,704).

### 3. Filters & Views
- **Action**: Switch between Grid Table, Pipeline (Kanban), Counsel, and Analytics views.
- **Expected Outcome**: All views render with the expanded dataset without errors.

### 4. Build Test
- **Command**: `cd delisted-crm-database && npm run build`
- **Expected Outcome**: Clean production build with zero warnings/errors.
