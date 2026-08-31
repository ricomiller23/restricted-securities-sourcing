# Manual Testing Guide: 0.006 Delisted CRM Database Optimization, Telemetry & 24h Freshness

## Verification Checklist

### 1. Security Audit
- **Command**: `cd delisted-crm-database && npm audit`
- **Expected Outcome**: Confirms 0 vulnerabilities.

### 2. Build Verification
- **Command**: `cd delisted-crm-database && npm run build`
- **Expected Outcome**: Production build compiles in < 500ms without warnings.

### 3. Telemetry & Freshness UI
- **Action**: Open Delisted CRM Database in browser and inspect Navbar.
- **Expected Outcome**:
  - `🟢 24h Verified Fresh` badge is visible.
  - `⚡ XXms Telemetry` button opens the live performance modal.

### 4. Desktop Launcher
- **Action**: Run `./Launch\ Delisted\ CRM.command`
- **Expected Outcome**: Prints milestone timestamps and opens browser immediately upon readiness.
