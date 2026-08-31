import React, { useState } from 'react';

const COMMON_QUERIES = [
  { label: "3(a)(10) Debt Settlement", q: '"Section 3(a)(10)"', forms: "8-K,S-1,S-3,424B3" },
  { label: "Convertible Debentures", q: '"convertible debenture"', forms: "8-K,10-Q" },
  { label: "Convertible Promissory Notes", q: '"convertible promissory note"', forms: "8-K" },
  { label: "Bona Fide Debt Settlement", q: '"settlement of bona fide debt"', forms: "8-K" },
  { label: "Selling Stockholders Resale", q: '"selling stockholders" "resale"', forms: "S-1,S-3,424B3" }
];

export default function FtsExplorer() {
  const [query, setQuery] = useState(COMMON_QUERIES[0].q);
  const [forms, setForms] = useState(COMMON_QUERIES[0].forms);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3); // Last 3 months by default
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [hits, setHits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setHits([]);
    try {
      const url = `/api/fts?q=${encodeURIComponent(query)}&forms=${encodeURIComponent(forms)}&start=${startDate}&end=${endDate}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Search failed with status ${res.status}`);
      const data = await res.json();
      setHits(data.hits?.hits || []);
    } catch (err) {
      setError(err.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const selectPreset = (preset) => {
    setQuery(preset.q);
    setForms(preset.forms);
  };

  const handleSaveFtsLead = async (hit) => {
    const source = hit._source || {};
    const issuerName = source.conm || 'Unknown Issuer';
    const cik = source.cik || '';
    const form = source.form || '';
    const fileDate = source.file_date || '';
    const accession = hit._id || '';

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accession,
          issuer: issuerName,
          issuerCik: cik,
          seller: "Selling Stockholders / Debt Holders",
          relationship: "N/A (FTS)",
          exchange: "OTC / Unknown",
          sharesToSell: 0,
          sharesOutstanding: 0,
          slicePct: 0,
          aggregateMktValue: 0,
          acquisitionBasis: `Discovered via FTS query: "${query}" in form ${form}`,
          isHighValue: true,
          broker: "",
          approxSaleDate: fileDate,
          score: 50 // Baseline FTS discovery score
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to save lead.');
        return;
      }

      alert(`Saved ${issuerName} to CRM leads successfully.`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>SEC Full-Text Search Explorer</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Query SEC EDGAR filing texts in near real-time to surface 3(a)(10) toxic structures or convertibles.
        </p>

        {/* Preset Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {COMMON_QUERIES.map(p => (
            <button 
              key={p.label}
              className="btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              onClick={() => selectPreset(p)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="search-controls">
          <div className="input-group">
            <label className="input-label">Search Query (Boolean Supported)</label>
            <input 
              type="text" 
              className="form-control" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 'convertible debenture'"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Forms (Comma Separated)</label>
            <input 
              type="text" 
              className="form-control" 
              value={forms}
              onChange={(e) => setForms(e.target.value)}
              placeholder="e.g. 8-K,10-Q"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Start Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">End Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button className="btn-primary" onClick={handleSearch} disabled={loading} style={{ height: '42px' }}>
            {loading ? 'Searching...' : 'Run Query'}
          </button>
        </div>
      </div>

      <div className="glass-panel">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Query Results</h3>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div className="status-dot" style={{ display: 'inline-block' }}></div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Querying SEC database index...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', color: 'var(--color-danger)', textAlign: 'center' }}>
            <p>⚠️ Query Error: {error}</p>
          </div>
        ) : hits.length === 0 ? (
          <div style={{ padding: '3rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            <p>No filings match the current query criteria.</p>
          </div>
        ) : (
          <div className="fts-results">
            {hits.map(hit => {
              const src = hit._source || {};
              // Clean up snippet formatting
              const snippet = hit.highlights?.[0]
                ? hit.highlights[0].replace(/<\/?[^>]+(>|$)/g, "") // Strip HTML if any remains
                : '';

              return (
                <div key={hit._id} className="fts-result-card">
                  <div className="fts-result-header">
                    <div>
                      <div className="fts-result-title">{src.conm}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Form <strong style={{ color: '#fff' }}>{src.form}</strong> | Filed: {src.file_date} | CIK: {src.cik}
                      </div>
                    </div>
                    
                    <button 
                      className="btn-secondary" 
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                      onClick={() => handleSaveFtsLead(hit)}
                    >
                      + Save as Lead
                    </button>
                  </div>

                  {snippet && (
                    <div className="fts-snippet">
                      "... {snippet} ..."
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <a 
                      href={`https://www.sec.gov/Archives/edgar/data/${src.cik}/${hit._id.split(':').pop()}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', textDecoration: 'none' }}
                    >
                      Open Filing on SEC ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
