# Data Enrichment & Audit Integrity Rules

## 1. Dual-Source Primary Data Redundancy
- **Never rely on a single external API** for critical dataset fields (e.g., C-suite officers, legal counsel, regulatory reasons). Third-party endpoints frequently rate-limit, 404, or serve Cloudflare maintenance HTML.
- **Always combine official regulatory filings** (e.g., SEC EDGAR Submissions & Filings) as the primary source of truth with market APIs (e.g., OTC Markets) and search engine fallback parsers.

## 2. Mandatory 100% Dataset Verification Suite
- **Never declare a data task complete based on spot-checking 1 or 2 records.** Spot checks mask widespread missing data.
- **Always write and execute an automated verification script** (`scripts/full_audit_verify.py`) that audits 100% of rows in the dataset, outputs percentage coverage metrics for every field (e.g. `% CEO`, `% Legal Counsel`, `% Reason`), and verifies zero regression before declaring completion.

## 3. Rate-Limit & Error Classification (No Silent Fallbacks)
- **Never swallow API errors** or set fields to `"Not Available"` when an HTTP request fails due to rate limits (429/403), timeouts, or Cloudflare maintenance HTML.
- **Always classify HTTP errors**: Distinguish 404 (genuinely not found) from rate throttling, use exponential backoff, and fallback to secondary primary sources.

## 4. Multi-Identifier & HTML Structure Resilience
- **Multi-Class Tickers**: Always resolve parent CIKs for companies with multiple tickers (e.g., `EXE, EXEEL, EXEEW, EXEEZ`).
- **Flexible Document Parsing**: When extracting officer signatures from SEC filings, do not rely on simple single-line regex. Parse HTML table structures where `/s/ Name` and `Title:` are located in separate adjacent `<TD>` cells.

## 5. Automatic Client Cache Invalidation
- When updating seed JSON data in single-page web applications that persist state in browser `localStorage`, **always update or increment the `LOCAL_STORAGE_KEY` version tag** in `App.jsx` so users automatically receive fresh seed data without needing to clear local storage manually.
