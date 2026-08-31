# Development Notes: 0.007 Direct SEC EDGAR Delisted Ingestion

## Ingestion Logic
- SEC EDGAR master index archives provide tab/pipe-delimited quarterly and daily listings:
  `CIK|Company Name|Form Type|Date Filed|Filename`
- Key form types to identify distressed, delisted, and deregistered issuers:
  - `25`, `25-NSE` (Delisting by National Securities Exchanges like Nasdaq / NYSE)
  - `15-12G`, `15-12B`, `15-15D` (Voluntary Deregistration of Equity / Debt)
  - `15F-12G`, `15F-12B`, `15F-15D` (Foreign Private Issuer Deregistrations)
