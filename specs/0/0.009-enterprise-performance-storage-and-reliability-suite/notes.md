# Development Notes: 0.009 Enterprise Performance, Storage & Reliability Suite

- IndexedDB is backed by Promise-based transactions with transparent localStorage fallback.
- In-memory search index creates an inverted word token map over company names, tickers, CIKs, and locations.
- Web Worker utilizes `self.postMessage` to send validated batches back to main React state.
- Pre-commit hook invokes `npm run test:smoke` directly.
