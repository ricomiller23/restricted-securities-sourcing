# Development Notes: 0.006 Delisted CRM 24-Hour Sync

## Sync Design Principles
- **Strict UI Preservation**: No HTML tags, styling classes, or visual components are changed.
- **Non-Destructive Hydration**: Never overwrite existing user-authored statuses or notes during sync.
- **24-Hour Cadence**: 86,400,000 milliseconds interval / startup elapsed evaluation.
