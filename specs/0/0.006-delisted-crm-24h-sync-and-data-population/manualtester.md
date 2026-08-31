# Manual Testing Guide: 0.006 Delisted CRM 24-Hour Sync

## Verification Checklist

### 1. 24-Hour Timer & Startup Check
- **Action**: Check `localStorage.getItem("DELISTED_CRM_LAST_SYNC_TIMESTAMP")` in browser console.
- **Expected Outcome**: Populated with current timestamp; next sync triggers automatically after 24h.

### 2. Non-Destructive Data Population
- **Action**: Modify a note or status on an issuer in Delisted CRM and trigger a sync.
- **Expected Outcome**:
  - User-edited note and status are 100% preserved.
  - Missing contact fields (if newly discovered upstream) are filled in.
  - New issuers are added without altering layout or table columns.

### 3. Build Test
- **Command**: `cd delisted-crm-database && npm run build`
- **Expected Outcome**: Clean production build with zero errors.
