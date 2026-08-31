# Development Notes: 0.002 Automated Daily Morning Data Update Engine

## SEC EDGAR Daily Index Details
- SEC publishes daily indexes under `https://www.sec.gov/Archives/edgar/daily-index/{YEAR}/QTR{Q}/master.{YYYYMMDD}.idx`.
- Indexes for a trading day are typically published around 10:00 PM EST on that day or early the following morning.
- If today's index is not yet published (e.g. at 8:00 AM before markets open or on weekends/holidays), the sync engine falls back to verifying and pulling the most recent completed business days.

## Scheduling Strategy
- **In-process (Node server)**: Uses a timer calculating offset to 8:00 AM America/New_York + on-boot verification.
- **System-level (macOS LaunchAgent)**: Uses launchd plist configured with `StartCalendarInterval` (Hour 8, Minute 0) pointing to `npm run sync:daily`.
