import React, { useState, useEffect, useRef, useCallback } from 'react';
import TimelineVisual from './components/TimelineVisual.jsx';

// Smart helper to default to the latest weekday (since SEC Edgar doesn't file on weekends)
const getDefaultDate = () => {
  const d = new Date();
  const day = d.getDay(); // 0 = Sunday, 6 = Saturday
  if (day === 0) {
    d.setDate(d.getDate() - 2); // Go back to Friday
  } else if (day === 6) {
    d.setDate(d.getDate() - 1); // Go back to Friday
  }
  return d.toISOString().split('T')[0];
};

export default function App() {
  const [activeTab, setActiveTab] = useState('feed');
  
  // Live Feed states
  const [feedData, setFeedData] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState('');
  const [totalFound, setTotalFound] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [processedCount, setProcessedCount] = useState(0); // how many filings attempted server-side
  const [filterOtc, setFilterOtc] = useState('all');
  const [showRepeats, setShowRepeats] = useState(true); // Toggle to show repeats or dedup
  const [cacheWarming, setCacheWarming] = useState('');
  const [newFetches, setNewFetches] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);
  const [showCompleteToast, setShowCompleteToast] = useState(false);
  const pollingRef = useRef(null);

  // Sort state — newest filings first by default
  const [sortBy, setSortBy] = useState('filedAt');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <span style={{ opacity: 0.3, marginLeft: '4px' }}>⇅</span>;
    return <span style={{ marginLeft: '4px', color: 'var(--accent-cyan)' }}>{sortDir === 'desc' ? '▼' : '▲'}</span>;
  };

  // Search & Filter
  const [localSearch, setLocalSearch] = useState('');

  // FTS Convertibles states
  const [ftsQuery, setFtsQuery] = useState('convertible OR debenture OR "convertible note" OR "debt conversion"');
  const [ftsData, setFtsData] = useState([]);
  const [ftsLoading, setFtsLoading] = useState(false);
  const [ftsError, setFtsError] = useState('');

  // Modal state
  const [selectedFiling, setSelectedFiling] = useState(null);

  // Fetch Live Feed (sync=1 for background sync/warming)
  const fetchFeed = useCallback(async (warm = false) => {
    if (!warm) {
      setFeedLoading(true);
      setFeedError('');
    }
    try {
      const res = await fetch(`/api/feed${warm ? '?sync=1' : ''}`);
      if (!res.ok) throw new Error(`Failed to load feed (HTTP ${res.status})`);
      const json = await res.json();
      const incoming = json.targets || [];
      
      setFeedData(prev => {
        if (!warm) return incoming;
        const existingSet = new Set(prev.map(f => f.accession));
        return [...prev, ...incoming.filter(t => !existingSet.has(t.accession))];
      });
      setTotalFound(prev => Math.max(prev, json.processedCount || 0));
      setTotalAvailable(json.totalFilingsFound || 0);
      setProcessedCount(prev => Math.max(prev, json.processedCount || 0));
      setCacheWarming(json.cacheWarmingProgress || '');
      setNewFetches(json.newFetchesMade || 0);
      
      if (json.cacheWarmingProgress === 'Complete') {
        setAllLoaded(true);
        setShowCompleteToast(true);
        setTimeout(() => setShowCompleteToast(false), 10000);
        if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
      }
    } catch (err) {
      if (!warm) { setFeedError(err.message); setFeedData([]); }
    } finally {
      if (!warm) setFeedLoading(false);
    }
  }, []);

  const triggerSync = async () => {
    setCacheWarming('In Progress');
    setAllLoaded(false);
    setNewFetches(0);
    await fetchFeed(true);
  };

  // Fetch Full Text Search (Convertibles)
  const fetchFts = async (queryStr) => {
    setFtsLoading(true);
    setFtsError('');
    try {
      const res = await fetch(`/api/fts?q=${encodeURIComponent(queryStr)}`);
      if (!res.ok) {
        throw new Error(`FTS Search failed (HTTP ${res.status})`);
      }
      const json = await res.json();
      setFtsData(json.hits || []);
    } catch (err) {
      setFtsError(err.message);
      setFtsData([]);
    } finally {
      setFtsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'feed') {
      fetchFeed(false);
    } else if (activeTab === 'convertibles' && ftsData.length === 0) {
      fetchFts(ftsQuery);
    }
  }, [activeTab]);

  // Auto-poll to continue cache warming until all filings loaded
  useEffect(() => {
    if (cacheWarming === 'In Progress' && !allLoaded) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => fetchFeed(true), 5000);
    }
    return () => { if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; } };
  }, [cacheWarming, allLoaded, fetchFeed]);

  const handleFtsSubmit = (e) => {
    e.preventDefault();
    fetchFts(ftsQuery);
  };

  // Number Formatter
  const formatVal = (val, isCurrency = false) => {
    if (val === undefined || val === null || isNaN(val)) return 'N/A';
    if (isCurrency) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    }
    return new Intl.NumberFormat('en-US').format(val);
  };

  // Score styling helper
  const getScoreClass = (score) => {
    if (score >= 40) return 'score-high';
    if (score >= 20) return 'score-medium';
    return 'score-low';
  };

  // Sort + filter feed items
  // Step 1: sort by selected column
  const sortedFeed = [...feedData.filter(item => {
    const matchesSearch =
      (item.issuer || '').toLowerCase().includes(localSearch.toLowerCase()) ||
      (item.ticker && item.ticker.toLowerCase().includes(localSearch.toLowerCase())) ||
      (item.seller || '').toLowerCase().includes(localSearch.toLowerCase());
    if (filterOtc === 'otc') return matchesSearch && item.isOtc;
    if (filterOtc === 'listed') return matchesSearch && !item.isOtc;
    return matchesSearch;
  })].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case 'filedAt': aVal = new Date(a.filedAt || 0).getTime(); bVal = new Date(b.filedAt || 0).getTime(); break;
      case 'sharesToSell': aVal = a.sharesToSell || 0; bVal = b.sharesToSell || 0; break;
      case 'currentPrice': aVal = (a.currentPrice ?? a.impliedPrice) || 0; bVal = (b.currentPrice ?? b.impliedPrice) || 0; break;
      case 'avgVolume': aVal = a.avgVolume || 0; bVal = b.avgVolume || 0; break;
      case 'aggregateMktValue': aVal = a.aggregateMktValue || 0; bVal = b.aggregateMktValue || 0; break;
      default: aVal = a.score || 0; bVal = b.score || 0;
    }
    return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
  });

  // Step 2: count total occurrences per issuer in the sorted list
  const issuerTotals = {};
  sortedFeed.forEach(item => {
    const k = (item.issuer || '').toLowerCase().trim();
    issuerTotals[k] = (issuerTotals[k] || 0) + 1;
  });

  // Step 3: dedup — if issuer has 3+ entries, keep only the first 2 (already sorted most-recent first)
  const issuerShown = {};
  const filteredFeed = sortedFeed.filter(item => {
    if (showRepeats) return true; // Bypass dedup if showRepeats is checked
    const k = (item.issuer || '').toLowerCase().trim();
    if (issuerTotals[k] >= 3) {
      issuerShown[k] = (issuerShown[k] || 0) + 1;
      return issuerShown[k] <= 2;
    }
    return true;
  });

  // Extract upcoming sellers (filings with future or active sale windows/eligibility dates)
  // Let's pull them from the current active feed data and sort by closest eligibility/sale date
  const upcomingSellers = [...feedData]
    .filter(item => item.status.includes('Upcoming') || item.status.includes('Restricted') || item.status.includes('Active'))
    .sort((a, b) => {
      // Sort items with dates closest to today first
      if (a.eligibleDate && b.eligibleDate) {
        return new Date(a.eligibleDate) - new Date(b.eligibleDate);
      }
      if (a.approxSaleDate && b.approxSaleDate) {
        return new Date(a.approxSaleDate) - new Date(b.approxSaleDate);
      }
      return b.score - a.score;
    });

  // Calculate summary metrics
  const totalMarketValue = feedData.reduce((acc, curr) => acc + (curr.aggregateMktValue || 0), 0);
  const otcCount = feedData.filter(i => i.isOtc).length;
  const convertibleCount = feedData.filter(i => i.isConvertible).length;

  return (
    <div className="app-container">
      {/* Completion Toast */}
      {showCompleteToast && (
        <div style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
          background: 'linear-gradient(135deg, rgba(0,255,163,0.15), rgba(0,200,255,0.1))',
          border: '1px solid var(--accent-cyan)', borderRadius: '16px',
          padding: '18px 28px', backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 40px rgba(0,255,163,0.25)',
          maxWidth: '380px', animation: 'fadeInUp 0.4s ease'
        }}>
          <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--accent-cyan)', marginBottom: '6px' }}>✅ All Filings Loaded!</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>All {totalAvailable} OTC Pink/QB/QX Form 144 filings from the past 6 months are now displayed and ranked.</div>
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="logo-section">
          <span className="logo-icon">📈</span>
          <h1 className="logo-text">144 Analysis Daily</h1>
        </div>

        <nav className="nav-tabs">
          <button 
            className={`nav-btn ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            📊 Live 144 Feed
          </button>
          <button 
            className={`nav-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            📅 Upcoming Sellers
          </button>
          <button 
            className={`nav-btn ${activeTab === 'convertibles' ? 'active' : ''}`}
            onClick={() => setActiveTab('convertibles')}
          >
            ⛓️ Convertibles Explorer
          </button>
        </nav>

        <div className="header-meta" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="system-status">
            <span className="status-dot"></span>
            <span>SEC Data Live</span>
          </div>
          {cacheWarming === 'In Progress' ? (
            <div className="system-status" style={{ background: 'rgba(255,199,0,0.05)', borderColor: 'rgba(255,199,0,0.15)', color: 'var(--accent-gold)' }}>
              <span className="status-dot" style={{ backgroundColor: 'var(--accent-gold)', boxShadow: '0 0 8px var(--accent-gold)' }}></span>
              <span>Syncing SEC...</span>
            </div>
          ) : (
            <button 
              onClick={triggerSync}
              className="nav-btn"
              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '30px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              🔄 Sync SEC
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        
        {/* VIEW 1: LIVE 144 FEED */}
        {activeTab === 'feed' && (
          <div>
            <div className="view-header">
              <h2 className="view-title">Live Form 144 Filings Analysis</h2>
              <p className="view-subtitle">Insiders filing declarations of intent to sell restricted or affiliate shares under Rule 144</p>
            </div>

            {/* Stats Summary Panel */}
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-title">Filing Window</span>
                <span className="stat-value text-cyan" style={{ fontSize: '20px', color: 'var(--accent-cyan)' }}>
                  ⏳ Last 6 Months
                </span>
                <span className="stat-sub">Scans SEC live index daily</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Loaded / Total OTC Filings</span>
                <span className="stat-value">
                  {feedData.length}
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}> / {totalAvailable || '...'}</span>
                </span>
                {!allLoaded && cacheWarming === 'In Progress' ? (
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '5px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '4px',
                        background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-gold))',
                        width: totalAvailable ? `${Math.min(100, Math.round((processedCount / totalAvailable) * 100))}%` : '10%',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <span className="stat-sub" style={{ color: 'var(--accent-gold)' }}>🔄 Scanning... {totalAvailable ? Math.min(100, Math.round((processedCount / totalAvailable) * 100)) : 0}% ({processedCount}/{totalAvailable} checked)</span>
                  </div>
                ) : (
                  <span className="stat-sub" style={{ color: 'var(--accent-cyan)' }}>✅ {allLoaded ? 'All loaded' : 'Cache sync\'d'}</span>
                )}
              </div>
              <div className="stat-card">
                <span className="stat-title">Total Declared Value</span>
                <span className="stat-value text-cyan" style={{ color: 'var(--accent-cyan)' }}>{formatVal(totalMarketValue, true)}</span>
                <span className="stat-sub">Qualifying insider sales</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Convertibles Detected</span>
                <span className="stat-value" style={{ color: 'var(--accent-gold)' }}>{convertibleCount}</span>
                <span className="stat-sub">Aged debt or converted notes</span>
              </div>
            </div>

            {/* Toolbar */}
            <div className="dashboard-toolbar glass-panel">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Filter by Ticker, Issuer, or Seller..." 
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
              </div>

              <div className="filter-group">
                {cacheWarming === "In Progress" && (
                  <div className="system-status" style={{ border: '1px solid var(--accent-gold)', background: 'rgba(255, 199, 0, 0.05)', color: 'var(--accent-gold)' }}>
                    <span className="status-dot" style={{ backgroundColor: 'var(--accent-gold)', boxShadow: '0 0 8px var(--accent-gold)' }}></span>
                    <span>Parsing (+{newFetches} fetched)...</span>
                  </div>
                )}

                <button 
                  type="button" 
                  className="action-btn-secondary" 
                  style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderRadius: '8px' }}
                  onClick={() => fetchFeed()}
                >
                  🔄 Scan & Fetch More
                </button>

                <select 
                  className="filter-select"
                  value={filterOtc}
                  onChange={(e) => setFilterOtc(e.target.value)}
                >
                  <option value="all">Market: All</option>
                  <option value="otc">Market: OTC Pink/QB/QX Only</option>
                  <option value="listed">Market: Exchanges (Nasdaq/NYSE)</option>
                </select>

                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: 'pointer', 
                  fontSize: '13px', 
                  color: 'var(--text-secondary)',
                  userSelect: 'none',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <input 
                    type="checkbox" 
                    checked={showRepeats} 
                    onChange={(e) => setShowRepeats(e.target.checked)} 
                    style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                  />
                  <span>Show All Filings (Include Repeats)</span>
                </label>
              </div>
            </div>

            {/* Feed Table */}
            {feedLoading && feedData.length === 0 ? (
              <div className="loader-wrapper glass-panel">
                <div className="spinner"></div>
                <p>Establishing connection with SEC Edgar and scanning the last 6 months of index records...</p>
              </div>
            ) : feedError ? (
              <div className="glass-panel empty-state" style={{ borderColor: 'var(--accent-rose)' }}>
                <span className="empty-icon">❌</span>
                <h3>Failed to Load Data</h3>
                <p style={{ marginTop: '8px', color: 'var(--accent-rose)' }}>{feedError}</p>
                <button 
                  className="action-btn-secondary" 
                  style={{ marginTop: '16px', maxWidth: '200px' }}
                  onClick={() => fetchFeed()}
                >
                  Retry Connection
                </button>
              </div>
            ) : filteredFeed.length === 0 ? (
              <div className="glass-panel empty-state">
                <span className="empty-icon">📂</span>
                <h3>No qualifying filings tracked</h3>
                <p style={{ marginTop: '8px' }}>
                  No Form 144 filings from the last 6 months qualify. Try clicking "Scan & Fetch More" to check for newer entries.
                </p>
              </div>
            ) : (
              <div className="glass-panel table-container">
                <table className="analysis-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('score')}>
                        Rank / Score<SortIcon col="score" />
                      </th>
                      <th style={{ width: '100px' }}>Ticker</th>
                      <th>Issuer Name</th>
                      <th style={{ width: '110px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('filedAt')}>
                        Filing Date<SortIcon col="filedAt" />
                      </th>
                      <th>Seller / Relationship</th>
                      <th style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('sharesToSell')}>
                        Shares to Sell<SortIcon col="sharesToSell" />
                      </th>
                      <th style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('currentPrice')}>
                        Stock Price<SortIcon col="currentPrice" />
                      </th>
                      <th style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('avgVolume')}>
                        Avg Vol (3mo)<SortIcon col="avgVolume" />
                      </th>
                      <th style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('aggregateMktValue')}>
                        Total Value<SortIcon col="aggregateMktValue" />
                      </th>
                      <th style={{ width: '180px', textAlign: 'center' }}>Rule 144 Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFeed.map((item, index) => (
                      <tr key={item.accession} onClick={() => setSelectedFiling(item)}>
                        <td className="score-cell">
                          <span className={getScoreClass(item.score)}>{item.score}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>#{index + 1}</span>
                        </td>
                        <td>
                          <span className={`ticker-badge ${item.isOtc ? 'otc' : ''}`}>
                            {item.ticker}
                          </span>
                        </td>
                        <td>
                          <div className="company-cell">
                            <span className="company-name">{item.issuer}</span>
                            <span className="company-cik">CIK: {item.issuerCik}</span>
                          </div>
                        </td>
                        <td>
                          <div className="company-cell">
                            <span className="company-name" style={{ fontSize: '13px', fontWeight: '500' }}>
                              {item.filedAt ? new Date(item.filedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                            </span>
                            <span className="company-cik" style={{ fontSize: '10px' }}>SEC Lodged</span>
                          </div>
                        </td>
                        <td>
                          <div className="company-cell">
                            <span className="company-name" style={{ fontSize: '13px' }}>{item.seller}</span>
                            <span className="company-cik" style={{ fontSize: '10px' }}>{item.relationship || 'Affiliate'}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '500' }}>
                          {formatVal(item.sharesToSell)}
                        </td>
                        <td style={{ textAlign: 'right' }} className="currency-text">
                          {item.currentPrice !== null && item.currentPrice !== undefined ? `$${Number(item.currentPrice).toFixed(2)}` : (item.impliedPrice !== null && item.impliedPrice !== undefined ? `$${Number(item.impliedPrice).toFixed(2)}` : 'N/A')}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {item.avgVolume !== null ? formatVal(item.avgVolume) : 'N/A'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }} className="currency-text text-cyan">
                          {formatVal(item.aggregateMktValue, true)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${
                            item.status.includes('Active') ? 'badge-green' : 
                            item.status.includes('Eligible') ? 'badge-green' : 
                            item.status.includes('Upcoming') ? 'badge-gold' : 
                            item.status.includes('Restricted') ? 'badge-rose' : 'badge-muted'
                          }`}>
                            {item.status}
                          </span>
                          {item.isConvertible && (
                            <span style={{ 
                              display: 'block', 
                              fontSize: '9px', 
                              color: 'var(--accent-gold)', 
                              fontWeight: '700',
                              marginTop: '3px',
                              textTransform: 'uppercase'
                            }}>
                              ⛓️ Convertible Debt
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: UPCOMING SELLERS */}
        {activeTab === 'upcoming' && (
          <div>
            <div className="view-header">
              <h2 className="view-title">Upcoming 144 Sellers & Sales</h2>
              <p className="view-subtitle">Chronological schedule of sellers preparing to enter the market or clear holding periods</p>
            </div>

            {feedLoading ? (
              <div className="loader-wrapper glass-panel">
                <div className="spinner"></div>
                <p>Analyzing active dates from filings...</p>
              </div>
            ) : upcomingSellers.length === 0 ? (
              <div className="glass-panel empty-state">
                <span className="empty-icon">📅</span>
                <h3>No Upcoming/Restricted Sellers</h3>
                <p style={{ marginTop: '8px' }}>
                  No upcoming sellers with holding thresholds or future sale dates were identified in the tracked data.
                </p>
              </div>
            ) : (
              <div className="glass-panel">
                <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Timeline Roster ({upcomingSellers.length} Sellers)</h3>
                
                <div className="upcoming-timeline-list">
                  {upcomingSellers.map((item) => (
                    <div 
                      key={item.accession} 
                      className="upcoming-item-card"
                      onClick={() => setSelectedFiling(item)}
                    >
                      <div className="upcoming-details">
                        <span className={`ticker-badge ${item.isOtc ? 'otc' : ''}`} style={{ fontSize: '14px', padding: '6px 12px' }}>
                          {item.ticker}
                        </span>
                        
                        <div className="upcoming-meta">
                          <span className="upcoming-meta-title">{item.issuer}</span>
                          <span className="upcoming-meta-sub">
                            👤 Seller: <strong>{item.seller}</strong> ({item.relationship || 'Affiliate'})
                          </span>
                          <span className="upcoming-meta-sub" style={{ color: 'var(--accent-cyan)' }}>
                            💰 Value: <strong>{formatVal(item.aggregateMktValue, true)}</strong> ({formatVal(item.sharesToSell)} shares)
                          </span>
                        </div>
                      </div>

                      {/* Timeline Bar Sub-Visualizer */}
                      <div style={{ flex: '1', minWidth: '280px', maxWidth: '440px' }}>
                        <div className="progress-container-timeline" style={{ height: '8px', marginBottom: '4px' }}>
                          <div 
                            className="progress-bar-timeline" 
                            style={{ 
                              width: item.status.includes('Active') || item.status.includes('Eligible') ? '100%' : '50%',
                              background: item.status.includes('Active') || item.status.includes('Eligible')
                                ? 'linear-gradient(90deg, var(--accent-emerald), var(--accent-cyan))'
                                : 'linear-gradient(90deg, var(--accent-gold), var(--accent-rose))'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          <span>Acquired: {item.acquiredDate ? new Date(item.acquiredDate).toLocaleDateString() : 'N/A'}</span>
                          <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{item.status}</span>
                        </div>
                      </div>

                      <div className="upcoming-dates">
                        <span>Holding Clears: <strong className="upcoming-date-highlight">{item.eligibleDate ? new Date(item.eligibleDate).toLocaleDateString() : 'Immediate'}</strong></span>
                        <span>Filing Date: <span>{item.filedAt ? new Date(item.filedAt).toLocaleDateString() : 'N/A'}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: CONVERTIBLES EXPLORER */}
        {activeTab === 'convertibles' && (
          <div>
            <div className="view-header">
              <h2 className="view-title">⛓️ Convertible Debentures & Notes Intelligence</h2>
              <p className="view-subtitle">Real-time scan of the SEC Full-Text Search database for upcoming sellers converting debt securities</p>
            </div>

            {/* Toolbar for Custom FTS Query */}
            <form onSubmit={handleFtsSubmit} className="dashboard-toolbar glass-panel">
              <div className="search-input-wrapper" style={{ maxWidth: '600px' }}>
                <span className="search-icon">⛓️</span>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Query (e.g. convertible debenture, promissory note)..." 
                  value={ftsQuery}
                  onChange={(e) => setFtsQuery(e.target.value)}
                />
              </div>
              
              <button type="submit" className="action-btn-primary" style={{ flex: 'none', width: '160px', padding: '10px' }}>
                Search SEC FTS
              </button>
            </form>

            {ftsLoading ? (
              <div className="loader-wrapper glass-panel">
                <div className="spinner"></div>
                <p>Searching and downloading Form 144 XMLs for convertible debt records...</p>
              </div>
            ) : ftsError ? (
              <div className="glass-panel empty-state" style={{ borderColor: 'var(--accent-rose)' }}>
                <span className="empty-icon">❌</span>
                <h3>Search Request Failed</h3>
                <p style={{ marginTop: '8px', color: 'var(--accent-rose)' }}>{ftsError}</p>
              </div>
            ) : ftsData.length === 0 ? (
              <div className="glass-panel empty-state">
                <span className="empty-icon">🔍</span>
                <h3>No Debentures Found</h3>
                <p style={{ marginTop: '8px' }}>
                  No convertible debt filings matched your search. Try tweaking the query syntax.
                </p>
              </div>
            ) : (
              <div className="glass-panel table-container">
                <table className="analysis-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px', textAlign: 'center' }}>Score</th>
                      <th style={{ width: '100px' }}>Ticker</th>
                      <th>Company</th>
                      <th>Seller / Debt Nature</th>
                      <th style={{ textAlign: 'right' }}>Shares</th>
                      <th style={{ textAlign: 'right' }}>Stock Price</th>
                      <th style={{ textAlign: 'right' }}>Avg Vol (3mo)</th>
                      <th style={{ textAlign: 'right' }}>Mkt Value</th>
                      <th>Acquired Date</th>
                      <th style={{ width: '180px', textAlign: 'center' }}>Holding Eligibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ftsData.map((item) => (
                      <tr key={item.id} onClick={() => setSelectedFiling(item)}>
                        <td className="score-cell">
                          <span className={getScoreClass(item.score)}>{item.score}</span>
                        </td>
                        <td>
                          <span className={`ticker-badge ${item.ticker === 'OTC' ? 'otc' : ''}`}>
                            {item.ticker}
                          </span>
                        </td>
                        <td>
                          <div className="company-cell">
                            <span className="company-name">{item.companyName}</span>
                            <span className="company-cik">Filed: {new Date(item.fileDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td>
                          <div className="company-cell">
                            <span className="company-name" style={{ fontSize: '13px' }}>
                              {item.seller || 'Debt Holder'}
                            </span>
                            <span className="company-cik" style={{ fontSize: '10.5px', color: 'var(--accent-gold)', maxWidth: '240px', whiteSpace: 'normal' }}>
                              {item.acquisitionBasis || item.snippet.replace(/<\/?b>/g, '')}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '500' }}>
                          {item.sharesToSell > 0 ? formatVal(item.sharesToSell) : 'N/A'}
                        </td>
                        <td style={{ textAlign: 'right' }} className="currency-text">
                          {item.currentPrice !== null && item.currentPrice !== undefined ? `$${Number(item.currentPrice).toFixed(2)}` : (item.impliedPrice !== null && item.impliedPrice !== undefined ? `$${Number(item.impliedPrice).toFixed(2)}` : 'N/A')}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {item.avgVolume !== null ? formatVal(item.avgVolume) : 'N/A'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }} className="currency-text text-cyan">
                          {item.aggregateMktValue > 0 ? formatVal(item.aggregateMktValue, true) : 'N/A'}
                        </td>
                        <td>
                          {item.acquiredDate ? new Date(item.acquiredDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${
                            item.status.includes('Active') ? 'badge-green' : 
                            item.status.includes('Eligible') ? 'badge-green' : 
                            item.status.includes('Upcoming') ? 'badge-gold' : 
                            item.status.includes('Restricted') ? 'badge-rose' : 'badge-muted'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* DETAIL MODAL */}
      {selectedFiling && (
        <div className="modal-overlay" onClick={() => setSelectedFiling(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-area">
                <span className={`ticker-badge ${selectedFiling.isOtc ? 'otc' : ''}`} style={{ alignSelf: 'flex-start', marginBottom: '8px' }}>
                  {selectedFiling.ticker}
                </span>
                <h3 className="view-title" style={{ fontSize: '24px', marginBottom: '0' }}>{selectedFiling.issuer}</h3>
                <span className="view-subtitle">CIK: {selectedFiling.issuerCik} | Accession: {selectedFiling.accession}</span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedFiling(null)}>×</button>
            </div>

            <div className="modal-body">
              
              {/* Timeline Visual Progress Bar */}
              <TimelineVisual 
                acquiredDate={selectedFiling.acquiredDate}
                eligibleDate={selectedFiling.eligibleDate}
                approxSaleDate={selectedFiling.approxSaleDate}
                status={selectedFiling.status}
                isConvertible={selectedFiling.isConvertible}
              />

              <div className="modal-grid-two">
                
                {/* Securities Details Block */}
                <div className="info-block">
                  <h5>Securities To Be Sold</h5>
                  <div className="info-row">
                    <span>Shares To Sell:</span>
                    <span>{formatVal(selectedFiling.sharesToSell)}</span>
                  </div>
                  <div className="info-row">
                    <span>Outstanding Shares:</span>
                    <span>{formatVal(selectedFiling.sharesOutstanding)}</span>
                  </div>
                  <div className="info-row">
                    <span>Slice of Outstanding:</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>
                      {selectedFiling.slicePct !== null ? `${selectedFiling.slicePct}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span>Filing Price (Bid):</span>
                    <span>
                      {selectedFiling.impliedPrice !== null && selectedFiling.impliedPrice !== undefined
                        ? `$${Number(selectedFiling.impliedPrice).toFixed(2)}`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span>Aggregate Value:</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>{formatVal(selectedFiling.aggregateMktValue, true)}</span>
                  </div>
                  <div className="info-row">
                    <span>Acquisition Basis:</span>
                    <span style={{ maxWidth: '180px', color: 'var(--accent-gold)' }}>{selectedFiling.acquisitionBasis}</span>
                  </div>
                </div>

                {/* Seller & Contact Block */}
                <div className="info-block">
                  <h5>Filer & Broker Info</h5>
                  <div className="info-row">
                    <span>Seller Name:</span>
                    <span>{selectedFiling.seller || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span>Relationship:</span>
                    <span>{selectedFiling.relationship || 'Affiliate'}</span>
                  </div>
                  <div className="info-row">
                    <span>Broker:</span>
                    <span>{selectedFiling.broker || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span>Issuer Phone:</span>
                    <span>{selectedFiling.issuerPhone || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span>Seller Address:</span>
                    <span style={{ fontSize: '11px', maxWidth: '180px' }}>{selectedFiling.sellerAddress || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span>Issuer Address:</span>
                    <span style={{ fontSize: '11px', maxWidth: '180px' }}>{selectedFiling.issuerAddress || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Kimi Corporate Officers Enrichment */}
              {(selectedFiling.ceo || selectedFiling.cfo || selectedFiling.legalCounsel || selectedFiling.lawFirm) && (
                <div className="info-block" style={{ marginTop: '20px', width: '100%', border: '1px solid rgba(0, 255, 163, 0.15)', background: 'linear-gradient(135deg, rgba(0,255,163,0.03), rgba(0,200,255,0.02))' }}>
                  <h5 style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span>🏢</span> Corporate Officers & Counsel (Kimi Enrichment)
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px', borderBottom: 'none', padding: '0' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chief Executive Officer (CEO)</span>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: selectedFiling.ceo && selectedFiling.ceo !== 'Not Available' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {selectedFiling.ceo || 'Not Available'}
                      </span>
                    </div>
                    <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px', borderBottom: 'none', padding: '0' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chief Financial Officer (CFO)</span>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: selectedFiling.cfo && selectedFiling.cfo !== 'Not Available' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {selectedFiling.cfo || 'Not Available'}
                      </span>
                    </div>
                    <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px', borderBottom: 'none', padding: '0' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>General Counsel (GC)</span>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: selectedFiling.legalCounsel && selectedFiling.legalCounsel !== 'Not Available' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {selectedFiling.legalCounsel || 'Not Available'}
                      </span>
                    </div>
                    <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px', borderBottom: 'none', padding: '0' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Outside Law Firm</span>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: selectedFiling.lawFirm && selectedFiling.lawFirm !== 'Not Available' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {selectedFiling.lawFirm || 'Not Available'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Links */}
              <div className="link-buttons">
                {selectedFiling.rawXmlUrl && (
                  <a 
                    href={selectedFiling.rawXmlUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="action-btn-primary"
                  >
                    📄 View Original XML Doc
                  </a>
                )}
                {selectedFiling.rawHtmlUrl && (
                  <a 
                    href={selectedFiling.rawHtmlUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="action-btn-secondary"
                  >
                    🌐 Open in SEC Archives
                  </a>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
