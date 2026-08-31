# Development Notes: 0.005 Instant Sourcing Feed & 24h Freshness

## SEC Market Schedule & 24h Freshness Rules
- SEC filings are accepted Mon-Fri from 6:00 AM to 10:00 PM EST.
- Master daily index files (`master.YYYYMMDD.idx`) are published between 6:00 PM and 10:30 PM EST on trading days.
- Over weekends (Saturday/Sunday), the latest valid market day is Friday.
- A 24-hour freshness window corresponds to the most recent completed market trading session.
