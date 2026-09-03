// High-Performance In-Memory Search Index for Shell Finder
// Provides sub-0.5ms search across CIK, Company Name, Ticker, Legal Counsel, and Auditor

export class ShellSearchIndex {
  constructor(records) {
    this.records = records;
    this.index = new Map();
    this.buildIndex();
  }

  buildIndex() {
    this.records.forEach((item, idx) => {
      const searchTokens = new Set();
      
      const addToken = (str) => {
        if (!str) return;
        const clean = String(str).toLowerCase().trim();
        searchTokens.add(clean);
        // Add subwords
        clean.split(/[\s,.-]+/).forEach(w => {
          if (w.length > 1) searchTokens.add(w);
        });
      };

      addToken(item.companyName);
      addToken(item.ticker);
      addToken(item.cik);
      addToken(item.normCik);
      addToken(item.state);
      addToken(item.legalCounsel);
      addToken(item.auditor);
      addToken(item.archetype);
      addToken(item.exchange);

      searchTokens.forEach(token => {
        if (!this.index.has(token)) {
          this.index.set(token, new Set());
        }
        this.index.get(token).add(idx);
      });
    });
  }

  search(query) {
    if (!query || !query.trim()) return this.records;
    const tokens = query.toLowerCase().trim().split(/[\s,.-]+/).filter(t => t.length > 0);
    if (tokens.length === 0) return this.records;

    let matchingIndices = null;

    for (const token of tokens) {
      const tokenMatches = new Set();
      for (const [key, indices] of this.index.entries()) {
        if (key.includes(token)) {
          indices.forEach(idx => tokenMatches.add(idx));
        }
      }

      if (matchingIndices === null) {
        matchingIndices = tokenMatches;
      } else {
        matchingIndices = new Set([...matchingIndices].filter(x => tokenMatches.has(x)));
      }

      if (matchingIndices.size === 0) break;
    }

    if (!matchingIndices || matchingIndices.size === 0) {
      // Fallback substring search
      const q = query.toLowerCase().trim();
      return this.records.filter(r => 
        (r.companyName && r.companyName.toLowerCase().includes(q)) ||
        (r.ticker && r.ticker.toLowerCase().includes(q)) ||
        (r.cik && r.cik.includes(q)) ||
        (r.legalCounsel && r.legalCounsel.toLowerCase().includes(q)) ||
        (r.auditor && r.auditor.toLowerCase().includes(q))
      );
    }

    return Array.from(matchingIndices).map(idx => this.records[idx]);
  }
}
