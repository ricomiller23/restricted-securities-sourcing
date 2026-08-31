import React, { useState, useEffect, useMemo } from 'react';

export default function FilingsRegister({ onSaveToCrm }) {
  const [activeForm, setActiveForm] = useState(null); // null, 'FORM_3', 'FORM_4', 'S1', '13D', '3a10', '144'
  const [activeFilter, setActiveFilter] = useState(null); // null, 'debt', 'restricted', '3a10', 'today'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByNames, setSortByNames] = useState(false);
  
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState('0');
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Drawer state
  const [selectedFiling, setSelectedFiling] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [savedAccessions, setSavedAccessions] = useState(new Set());
  
  // Sync SEC State
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchFilings = async (offset = '0', append = false) => {
    if (offset === '0') {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');

    let url = `/api/filings?limit=20&cursor=${offset}`;
    if (activeForm) url += `&form=${activeForm}`;
    if (activeFilter) url += `&filter=${activeFilter}`;
    if (searchQuery.trim()) url += `&q=${encodeURIComponent(searchQuery)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server returned error ${res.status}`);
      const data = await res.json();
      
      if (append) {
        setFilings(prev => [...prev, ...(data.data || [])]);
      } else {
        setFilings(data.data || []);
      }
      
      setTotalCount(data.total || 0);
      setCursor(data.nextCursor || '0');
      setHasMore(data.nextCursor !== null);
    } catch (err) {
      setError(err.message || 'Failed to retrieve filings.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchSavedLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setSavedAccessions(new Set(data.map(l => l.accession)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger fetch when filters or search changes
  useEffect(() => {
    fetchFilings('0', false);
    fetchSavedLeads();
  }, [activeForm, activeFilter, searchQuery]);

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchFilings(cursor, true);
    }
  };

  const handleSyncSEC = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/backfill/start', { method: 'POST' });
      if (res.ok) {
        alert("SEC 2026 Historical Backfill started in the background. It will index newly cached files automatically.");
        setTimeout(() => fetchFilings('0', false), 3000);
      } else {
        const err = await res.json();
        alert(`Sync failed: ${err.error || 'Unknown error'}`);
      }
    } catch (e) {
      alert("Error starting backfill process.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRowClick = async (filing) => {
    setDrawerLoading(true);
    setSelectedFiling(filing);
    setIsDrawerOpen(true);
    
    try {
      const res = await fetch(`/api/filings/${filing.id}`);
      if (res.ok) {
        const detailed = await res.json();
        setSelectedFiling(detailed);
      }
    } catch (e) {
      console.error("Error loading filing details:", e);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleSaveToCrmInsideDrawer = async () => {
    if (!selectedFiling) return;
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accession: selectedFiling.accessionNumber,
          issuer: selectedFiling.Issuer.name,
          issuerCik: selectedFiling.Issuer.cik,
          seller: selectedFiling.Insider.fullName,
          relationship: selectedFiling.relationship,
          exchange: selectedFiling.Issuer.marketTier === "NASDAQ" ? "NASDAQ" : "OTC",
          sharesToSell: selectedFiling.sharesToSell,
          sharesOutstanding: selectedFiling.sharesOutstanding,
          slicePct: selectedFiling.slicePct,
          aggregateMktValue: selectedFiling.aggregateMktValue,
          impliedPrice: selectedFiling.impliedPrice,
          acquisitionBasis: selectedFiling.acquisitionBasis,
          isHighValue: selectedFiling.hasAgedDebt,
          broker: selectedFiling.broker,
          approxSaleDate: selectedFiling.approxSaleDate,
          sellerAddress: selectedFiling.sellerAddress,
          brokerAddress: selectedFiling.brokerAddress,
          issuerPhone: selectedFiling.issuerPhone,
          issuerAddress: selectedFiling.issuerAddress,
          depositWindow: selectedFiling.depositWindow,
          saleWindow: selectedFiling.saleWindow,
          score: selectedFiling.score
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to save lead.');
        return;
      }

      const saved = await res.json();
      onSaveToCrm(saved);
      setSavedAccessions(prev => new Set([...prev, selectedFiling.accessionNumber]));
      alert("Filing successfully saved to your CRM Board.");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard: " + text);
  };

  // Sort filings in memory if "Sort by Human Names" is enabled
  const sortedFilings = useMemo(() => {
    let result = [...filings];
    if (sortByNames) {
      result.sort((a, b) => {
        const nameA = a.Insider?.fullName || "";
        const nameB = b.Insider?.fullName || "";
        const compare = nameA.localeCompare(nameB);
        if (compare !== 0) return compare;
        return (b.score || 0) - (a.score || 0);
      });
    }
    return result;
  }, [filings, sortByNames]);

  const getScoreClass = (score) => {
    if (score >= 75) return 'score-indicator score-high';
    if (score >= 45) return 'score-indicator score-medium';
    return 'score-indicator';
  };

  const handleFormTabChange = (formType) => {
    setActiveForm(formType);
    setActiveFilter(null);
  };

  const handleFilterToggle = (filterName) => {
    if (activeFilter === filterName) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filterName);
      setActiveForm(null);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      
      {/* Search Header Row */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Filings Register</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            SEC Form 3, 4, S-1, 13D, 13G & 144 (2026 Historical Backfill Data)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn-primary" 
            onClick={handleSyncSEC} 
            disabled={isSyncing} 
            style={{ height: '42px', background: 'var(--color-success)', color: '#07080B', boxShadow: '0 4px 15px rgba(0, 230, 70, 0.2)' }}
          >
            🔄 {isSyncing ? "Syncing..." : "Sync SEC"}
          </button>

          <button 
            className={`btn-secondary ${sortByNames ? 'active' : ''}`}
            onClick={() => setSortByNames(!sortByNames)}
            style={{ 
              height: '42px', 
              borderColor: sortByNames ? 'var(--accent-blue)' : 'var(--glass-border)',
              color: sortByNames ? 'var(--accent-blue)' : 'var(--text-primary)',
              background: sortByNames ? 'rgba(0, 229, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)'
            }}
          >
            🔀 {sortByNames ? "Sorted: Human Names" : "Sort: Human Names"}
          </button>

          <button 
            className={`btn-secondary ${activeFilter === 'debt' ? 'active' : ''}`} 
            onClick={() => handleFilterToggle('debt')}
            style={{ 
              height: '42px',
              borderColor: activeFilter === 'debt' ? 'var(--color-warning)' : 'var(--glass-border)',
              color: activeFilter === 'debt' ? 'var(--color-warning)' : 'var(--text-primary)'
            }}
          >
            ⚠️ Debt Block
          </button>
        </div>
      </div>

      {/* Tab Filter Button Bar */}
      <div className="glass-panel" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', background: 'rgba(0,0,0,0.15)' }}>
        <button 
          className={`nav-btn ${activeForm === null && activeFilter === null ? 'active' : ''}`} 
          onClick={() => { setActiveForm(null); setActiveFilter(null); }}
        >
          All Filings
        </button>
        <button 
          className={`nav-btn ${activeForm === 'FORM_3' ? 'active' : ''}`} 
          onClick={() => handleFormTabChange('FORM_3')}
        >
          Form 3
        </button>
        <button 
          className={`nav-btn ${activeForm === 'FORM_4' ? 'active' : ''}`} 
          onClick={() => handleFormTabChange('FORM_4')}
        >
          Form 4
        </button>
        <button 
          className={`nav-btn ${activeForm === 'S1' ? 'active' : ''}`} 
          onClick={() => handleFormTabChange('S1')}
        >
          Form S-1
        </button>
        <button 
          className={`nav-btn ${activeForm === '13D' ? 'active' : ''}`} 
          onClick={() => handleFormTabChange('13D')}
        >
          Form 13D
        </button>
        <button 
          className={`nav-btn ${activeForm === '144' ? 'active' : ''}`} 
          onClick={() => handleFormTabChange('144')}
        >
          Form 144
        </button>
        <button 
          className={`nav-btn ${activeFilter === '3a10' ? 'active' : ''}`} 
          onClick={() => handleFilterToggle('3a10')}
        >
          3(a)(10) Exemption
        </button>
      </div>

      {/* Search Input Box */}
      <div className="glass-panel" style={{ padding: '0.75rem 1rem' }}>
        <input 
          type="text" 
          placeholder="Search filings by ticker, company name, insider, or broker..."
          className="form-control"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Results Table Container */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          <span>Showing {filings.length} of {totalCount} records</span>
        </div>

        {loading ? (
          <div style={{ padding: '5rem', textAlign: 'center' }}>
            <div className="status-dot" style={{ display: 'inline-block', marginBottom: '1rem' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Searching indexed backfill filings...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-danger)' }}>
            <p>⚠️ Error: {error}</p>
            <button className="btn-secondary" onClick={() => fetchFilings('0', false)} style={{ marginTop: '1rem' }}>Retry</button>
          </div>
        ) : sortedFilings.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No filings match your criteria.</p>
            <p style={{ fontSize: '0.85rem' }}>Ensure the Historical Backfiller has compiled data or clear your search/filters.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Score</th>
                    <th>Ticker</th>
                    <th>Issuer / Insider</th>
                    <th>Tier</th>
                    <th>Flags</th>
                    <th>Form</th>
                    <th style={{ textAlign: 'right' }}>Filed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFilings.map((f, index) => (
                    <tr 
                      key={`${f.id}-${index}`} 
                      onClick={() => handleRowClick(f)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <span className={getScoreClass(f.score)}>
                          {f.score}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                          {f.Issuer.ticker || "OTC"}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{f.Insider.fullName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{f.Issuer.name}</div>
                        {(f.Insider.city || f.Insider.state) && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            {f.Insider.city}{f.Insider.city && f.Insider.state ? ', ' : ''}{f.Insider.state}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-otc" style={{ fontSize: '0.7rem' }}>
                          {f.Issuer.marketTier?.replace('_', ' ') || "PINK"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {f.hasAgedDebt && <span className="badge badge-high-value" style={{ background: 'rgba(255, 234, 0, 0.15)', color: '#ffee58', border: '1px solid rgba(255, 234, 0, 0.2)', padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>DEBT</span>}
                          {f.hasRestricted && <span className="badge badge-control" style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>144</span>}
                          {f.has3a10 && <span className="badge badge-otc" style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>3A10</span>}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{f.formType}</span>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {f.filedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button 
                  className="btn-secondary" 
                  onClick={loadMore} 
                  disabled={loadingMore}
                  style={{ width: '150px' }}
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Side-Over Detailed Drawer */}
      {isDrawerOpen && selectedFiling && (
        <div className="modal-overlay" onClick={() => setIsDrawerOpen(false)} style={{ justifyContent: 'flex-end', alignItems: 'stretch' }}>
          <div 
            className="glass-panel" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              width: '100%', 
              maxWidth: '550px', 
              borderRadius: '16px 0 0 16px', 
              borderLeft: '1px solid var(--glass-border)',
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.5rem',
              height: '100vh',
              overflowY: 'auto',
              animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <div>
                <span className="badge badge-otc" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', marginBottom: '0.5rem' }}>
                  {selectedFiling.formType}
                </span>
                <h3 style={{ fontSize: '1.4rem', fontFamily: 'Outfit', color: '#fff' }}>
                  {selectedFiling.Issuer.name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                  ACC #{selectedFiling.accessionNumber}
                </span>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.8rem', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            {drawerLoading ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div className="status-dot"></div>
                <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading filing metadata...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <a 
                    href={selectedFiling.primaryDocUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-secondary" 
                    style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    📄 SEC Primary Doc
                  </a>
                  <a 
                    href={selectedFiling.rawHtmlUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-secondary" 
                    style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    🌐 Open HTML Filing
                  </a>
                </div>

                {/* Forensic Analysis */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '1.25rem', borderRadius: '12px' }}>
                  <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🔍 Forensic Analysis
                  </h4>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span className="badge badge-high-value" style={{ background: 'rgba(0, 230, 70, 0.15)', color: '#00e676' }}>
                      Score {selectedFiling.score}
                    </span>
                    <span className="badge badge-otc" style={{ background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff' }}>
                      {selectedFiling.hasAgedDebt ? "Convertible/Debenture" : "Restricted Block"}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Detected a high-priority Form {selectedFiling.formType} filing for {selectedFiling.Issuer.name}. 
                    {selectedFiling.sharesToSell > 0 && ` Sourced position block of ${selectedFiling.sharesToSell.toLocaleString()} shares (representing ${selectedFiling.slicePct}% of company outstanding shares) with aggregate market value of $${selectedFiling.aggregateMktValue.toLocaleString()}.`}
                    {selectedFiling.hasAgedDebt ? " The position is marked as a debt/debenture settlement, indicating potentially convertible terms." : " The position represents restricted shares subject to Form 144 sale rules."}
                    {" The transaction warrants deeper review."}
                  </p>
                </div>

                {/* Insider and Sourcing Timelines */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Deposit Window</span>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--accent-blue)' }}>{selectedFiling.depositWindow || "Immediate"}</strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Sale Window</span>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--accent-pink)' }}>{selectedFiling.saleWindow || "Immediate"}</strong>
                  </div>
                </div>

                {/* Verified Operator Contacts */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '1.25rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', margin: 0 }}>
                    📞 Verified Operator Contacts
                  </h4>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Issuer Phone</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{selectedFiling.issuerPhone || "Not available"}</strong>
                      {selectedFiling.issuerPhone && (
                        <button 
                          onClick={() => handleCopy(selectedFiling.issuerPhone)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          📋 Copy
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Issuer Address</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, paddingRight: '1rem' }}>
                        {selectedFiling.issuerAddress || "Not available"}
                      </p>
                      {selectedFiling.issuerAddress && (
                        <button 
                          onClick={() => handleCopy(selectedFiling.issuerAddress)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          📋 Copy
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Insider / Seller Name</span>
                    <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{selectedFiling.Insider.fullName}</strong>
                  </div>

                  {selectedFiling.sellerAddress && (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Seller Address</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, paddingRight: '1rem' }}>
                          {selectedFiling.sellerAddress}
                        </p>
                        <button 
                          onClick={() => handleCopy(selectedFiling.sellerAddress)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedFiling.broker && (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Broker / Clearing House</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: '#fff', display: 'block' }}>{selectedFiling.broker}</strong>
                          {selectedFiling.brokerAddress && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedFiling.brokerAddress}</span>}
                        </div>
                        <button 
                          onClick={() => handleCopy(selectedFiling.broker)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sourcing details */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Shares to Sell</span>
                    <strong style={{ color: '#fff' }}>{selectedFiling.sharesToSell?.toLocaleString() || "N/A"}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Shares Outstanding</span>
                    <strong style={{ color: '#fff' }}>{selectedFiling.sharesOutstanding?.toLocaleString() || "N/A"}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Position Size %</span>
                    <strong style={{ color: '#fff' }}>{selectedFiling.slicePct ? `${selectedFiling.slicePct}%` : "N/A"}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Implied Price</span>
                    <strong style={{ color: 'var(--accent-blue)' }}>{selectedFiling.impliedPrice ? `$${selectedFiling.impliedPrice.toFixed(2)}` : "N/A"}</strong>
                  </div>
                  {selectedFiling.acquisitionBasis && (
                    <div style={{ marginTop: '0.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Acquisition Basis</span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                        "{selectedFiling.acquisitionBasis}"
                      </p>
                    </div>
                  )}
                </div>

                {/* CRM Save Button */}
                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                  <button 
                    className="btn-primary" 
                    onClick={handleSaveToCrmInsideDrawer}
                    disabled={savedAccessions.has(selectedFiling.accessionNumber)}
                    style={{ width: '100%', justifyContent: 'center', height: '45px' }}
                  >
                    {savedAccessions.has(selectedFiling.accessionNumber) ? '✓ Saved to CRM Board' : '📥 Save to CRM Board'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide-over CSS Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />
    </div>
  );
}
