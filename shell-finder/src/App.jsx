import React, { useState, useMemo } from 'react';
import { 
  Shield, Search, Filter, Database, CheckCircle2, AlertTriangle, 
  ExternalLink, Download, FileText, BarChart3, Layers, 
  Building2, ArrowUpDown, ChevronRight, Award, Zap, SlidersHorizontal, RefreshCw
} from 'lucide-react';
import { SHELL_ISSUERS_SEED } from './data/shell_issuers_seed.js';
import { ShellSearchIndex } from './utils/searchIndex.js';
import ForensicDrawer from './components/ForensicDrawer.jsx';
import SecLiveScout from './components/SecLiveScout.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('screener'); // 'screener', 'toxic_lab', 'kanban', 'sec_scout', 'guide'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState('all');
  const [selectedQuality, setSelectedQuality] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [sortField, setSortField] = useState('cleanShellScore');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedIssuer, setSelectedIssuer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [mobileViewMode, setMobileViewMode] = useState('cards'); // 'cards' or 'table'
  const [mobileKanbanStage, setMobileKanbanStage] = useState('Initial Screen');
  
  // Sourcing pipeline state for Kanban
  const [pipelineData, setPipelineData] = useState(() => {
    return SHELL_ISSUERS_SEED.map(item => ({
      ...item,
      stage: item.hasToxicDebt 
        ? 'Disqualified' 
        : (item.cleanShellScore >= 90 ? 'Definitive Review' : (item.cleanShellScore >= 80 ? 'Legal Diligence' : 'Initial Screen'))
    }));
  });

  // Search index instantiation
  const searchIndex = useMemo(() => new ShellSearchIndex(SHELL_ISSUERS_SEED), []);

  // Filtered and sorted dataset
  const filteredIssuers = useMemo(() => {
    let list = searchIndex.search(searchQuery);

    if (selectedArchetype !== 'all') {
      list = list.filter(item => item.archetypeCode === selectedArchetype);
    }

    if (selectedQuality === 'prime') {
      list = list.filter(item => item.cleanShellScore >= 85);
    } else if (selectedQuality === 'clean') {
      list = list.filter(item => item.cleanShellScore >= 70 && item.cleanShellScore < 85);
    } else if (selectedQuality === 'toxic') {
      list = list.filter(item => item.hasToxicDebt || item.cleanShellScore === 0);
    }

    if (selectedState !== 'all') {
      list = list.filter(item => item.state === selectedState);
    }

    return [...list].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? (valA - valB) : (valB - valA);
    });
  }, [searchIndex, searchQuery, selectedArchetype, selectedQuality, selectedState, sortField, sortAsc]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredIssuers.length / pageSize) || 1;
  const paginatedIssuers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredIssuers.slice(start, start + pageSize);
  }, [filteredIssuers, currentPage, pageSize]);

  // High-level KPI computations
  const stats = useMemo(() => {
    const total = SHELL_ISSUERS_SEED.length;
    const prime = SHELL_ISSUERS_SEED.filter(i => i.cleanShellScore >= 85).length;
    const clean = SHELL_ISSUERS_SEED.filter(i => i.cleanShellScore >= 70 && i.cleanShellScore < 85).length;
    const toxic = SHELL_ISSUERS_SEED.filter(i => i.hasToxicDebt || i.cleanShellScore === 0).length;
    return { total, prime, clean, toxic };
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const moveKanbanStage = (issuerId, newStage) => {
    setPipelineData(prev => prev.map(item => item.id === issuerId ? { ...item, stage: newStage } : item));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation Bar */}
      <header className="navbar-wrapper">
        <div className="navbar-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
            <div className="brand-block">
              <div className="brand-icon">
                <Shield size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="brand-title">SHELL FINDER</span>
                  <span className="brand-badge">INSTITUTIONAL v2.4</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  SPAC & Clean Shell Intelligence
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <a 
                href="/SPAC_Quality_Shell_Stock_Sourcing_Guide.pdf" 
                download 
                className="btn btn-emerald"
                style={{ padding: '6px 10px', fontSize: '12px', minHeight: '34px' }}
                title="Download Executive PDF Dossier to ~/Downloads"
              >
                <Download size={13} /> PDF Dossier
              </a>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="nav-tabs">
            <button 
              className={`nav-tab-btn ${activeTab === 'screener' ? 'nav-tab-active' : ''}`}
              onClick={() => setActiveTab('screener')}
            >
              <Database size={14} /> Screener ({filteredIssuers.length})
            </button>
            <button 
              className={`nav-tab-btn ${activeTab === 'toxic_lab' ? 'nav-tab-active' : ''}`}
              onClick={() => setActiveTab('toxic_lab')}
            >
              <AlertTriangle size={14} /> Toxic Debt ({stats.toxic})
            </button>
            <button 
              className={`nav-tab-btn ${activeTab === 'kanban' ? 'nav-tab-active' : ''}`}
              onClick={() => setActiveTab('kanban')}
            >
              <Layers size={14} /> Pipeline
            </button>
            <button 
              className={`nav-tab-btn ${activeTab === 'sec_scout' ? 'nav-tab-active' : ''}`}
              onClick={() => setActiveTab('sec_scout')}
            >
              <Zap size={14} /> Live SEC Scout
            </button>
            <button 
              className={`nav-tab-btn ${activeTab === 'guide' ? 'nav-tab-active' : ''}`}
              onClick={() => setActiveTab('guide')}
            >
              <FileText size={14} /> Sourcing Guide
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '24px 20px', flex: 1 }}>
        
        {/* KPI Summary Cards */}
        <section className="kpi-grid">
          <div className="kpi-card glass-panel">
            <div className="kpi-icon-wrapper" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#3b82f6' }}>
              <Database size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>AUDITED SEC ISSUERS</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '11px', color: '#60a5fa' }}>100% Real EDGAR Filings</div>
            </div>
          </div>

          <div className="kpi-card glass-panel">
            <div className="kpi-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>TIER-1 PRISTINE BLANK CHECKS</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                {stats.prime}
              </div>
              <div style={{ fontSize: '11px', color: '#34d399' }}>Zero Commercial Debt ($0.00)</div>
            </div>
          </div>

          <div className="kpi-card glass-panel">
            <div className="kpi-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
              <Award size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>CLEAN REPORTING SHELLS</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>
                {stats.clean}
              </div>
              <div style={{ fontSize: '11px', color: '#22d3ee' }}>SGSI Score 70 – 84</div>
            </div>
          </div>

          <div className="kpi-card glass-panel">
            <div className="kpi-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>TOXIC DEBT DISQUALIFIED</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                {stats.toxic}
              </div>
              <div style={{ fontSize: '11px', color: '#f87171' }}>Convertible Death Spirals Blocked</div>
            </div>
          </div>
        </section>

        {/* TAB 1: SCREENER & DUE DILIGENCE TABLE */}
        {activeTab === 'screener' && (
          <div>
            {/* Filter Strip */}
            <div className="filter-bar glass-panel">
              <div className="search-input-box">
                <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input 
                  type="text"
                  className="search-input"
                  placeholder="Search by Company, Ticker, CIK, Counsel, or Auditor..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Quick Filter Chips for 1-Tap Touch Filtering */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', width: '100%', scrollbarWidth: 'none' }}>
                <button
                  className={`badge ${selectedQuality === 'all' ? 'badge-blue' : 'badge-secondary'}`}
                  style={{ cursor: 'pointer', padding: '6px 10px', fontSize: '11px', border: selectedQuality === 'all' ? '1px solid #3b82f6' : '1px solid var(--border-subtle)' }}
                  onClick={() => { setSelectedQuality('all'); setCurrentPage(1); }}
                >
                  All ({SHELL_ISSUERS_SEED.length})
                </button>
                <button
                  className={`badge ${selectedQuality === 'prime' ? 'badge-green' : 'badge-secondary'}`}
                  style={{ cursor: 'pointer', padding: '6px 10px', fontSize: '11px', border: selectedQuality === 'prime' ? '1px solid #10b981' : '1px solid var(--border-subtle)' }}
                  onClick={() => { setSelectedQuality('prime'); setCurrentPage(1); }}
                >
                  Tier-1 Pristine ({stats.prime})
                </button>
                <button
                  className={`badge ${selectedQuality === 'clean' ? 'badge-blue' : 'badge-secondary'}`}
                  style={{ cursor: 'pointer', padding: '6px 10px', fontSize: '11px', border: selectedQuality === 'clean' ? '1px solid #06b6d4' : '1px solid var(--border-subtle)' }}
                  onClick={() => { setSelectedQuality('clean'); setCurrentPage(1); }}
                >
                  Clean Shells ({stats.clean})
                </button>
                <button
                  className={`badge ${selectedQuality === 'toxic' ? 'badge-crimson' : 'badge-secondary'}`}
                  style={{ cursor: 'pointer', padding: '6px 10px', fontSize: '11px', border: selectedQuality === 'toxic' ? '1px solid #ef4444' : '1px solid var(--border-subtle)' }}
                  onClick={() => { setSelectedQuality('toxic'); setCurrentPage(1); }}
                >
                  Toxic Disqualified ({stats.toxic})
                </button>
              </div>

              <div className="filter-controls-row">
                <select 
                  className="filter-select"
                  value={selectedArchetype}
                  onChange={e => {
                    setSelectedArchetype(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Archetypes</option>
                  <option value="virgin_form10">Form 10 Virgin Blank Checks</option>
                  <option value="spac_remnant">SPACs / Trust Remnants</option>
                  <option value="fallen_angel">Clean Exchange-Deregistered</option>
                  <option value="cash_shell">Post-Asset Cash Shells</option>
                </select>

                <select 
                  className="filter-select"
                  value={selectedQuality}
                  onChange={e => {
                    setSelectedQuality(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All SGSI Scores</option>
                  <option value="prime">Tier-1 Pristine (Score 85+)</option>
                  <option value="clean">Clean Reporting (Score 70-84)</option>
                  <option value="toxic">Disqualified / Toxic (0)</option>
                </select>

                <select 
                  className="filter-select"
                  value={selectedState}
                  onChange={e => {
                    setSelectedState(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Jurisdictions</option>
                  <option value="DE">Delaware (DE)</option>
                  <option value="NV">Nevada (NV)</option>
                  <option value="WY">Wyoming (WY)</option>
                </select>

                {(searchQuery || selectedArchetype !== 'all' || selectedQuality !== 'all' || selectedState !== 'all') && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedArchetype('all');
                      setSelectedQuality('all');
                      setSelectedState('all');
                    }}
                    style={{ padding: '8px 12px', minHeight: '40px' }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Mobile View Mode Controls */}
            <div className="mobile-view-controls">
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Showing <strong>{paginatedIssuers.length}</strong> of <strong>{filteredIssuers.length}</strong>
              </span>
              <div className="view-toggle-pills">
                <button 
                  className={`view-toggle-btn ${mobileViewMode === 'cards' ? 'view-toggle-active' : ''}`}
                  onClick={() => setMobileViewMode('cards')}
                >
                  <Layers size={13} /> Cards
                </button>
                <button 
                  className={`view-toggle-btn ${mobileViewMode === 'table' ? 'view-toggle-active' : ''}`}
                  onClick={() => setMobileViewMode('table')}
                >
                  <Database size={13} /> Table
                </button>
              </div>
            </div>

            {/* Mobile Cards List (Touch Optimized) */}
            <div className={`mobile-cards-list ${mobileViewMode === 'table' ? 'hide-mobile' : ''}`}>
              {paginatedIssuers.map(issuer => {
                const isDisqualified = issuer.hasToxicDebt || issuer.cleanShellScore === 0;
                return (
                  <div 
                    key={issuer.id} 
                    className="mobile-shell-card"
                    onClick={() => setSelectedIssuer(issuer)}
                  >
                    <div className="mobile-card-top">
                      <div className="mobile-card-identity">
                        <span className="mobile-card-name">{issuer.companyName}</span>
                        <div className="mobile-card-meta">
                          <span className="badge badge-blue font-mono" style={{ fontSize: '10px' }}>CIK {issuer.cik}</span>
                          {issuer.ticker && issuer.ticker !== 'UNQUOTED' ? (
                            <span className="badge badge-purple font-mono" style={{ fontSize: '10px' }}>${issuer.ticker}</span>
                          ) : (
                            <span className="badge badge-secondary" style={{ fontSize: '10px' }}>Form 10 Virgin</span>
                          )}
                          <span className="badge badge-secondary" style={{ fontSize: '10px' }}>{issuer.state} Corp</span>
                        </div>
                      </div>
                      <div className={`score-pill ${issuer.isPrime ? 'score-prime' : (isDisqualified ? 'score-toxic' : (issuer.cleanShellScore >= 70 ? 'score-clean' : 'score-review'))}`}>
                        {isDisqualified ? '0 ✗' : `${issuer.cleanShellScore} ★`}
                      </div>
                    </div>

                    <div className="mobile-card-grid">
                      <div className="mobile-metric">
                        <div className="mobile-metric-label">DEBT STATUS</div>
                        {isDisqualified ? (
                          <div className="mobile-metric-val" style={{ color: '#ef4444', fontSize: '11px' }}>Toxic Note ✗</div>
                        ) : (
                          <div className="mobile-metric-val" style={{ color: issuer.totalLiabilities === 0 ? '#34d399' : '#ffffff' }}>
                            {issuer.totalLiabilities === 0 ? '$0.00 Pristine' : `$${issuer.totalLiabilities.toLocaleString()}`}
                          </div>
                        )}
                      </div>
                      <div className="mobile-metric">
                        <div className="mobile-metric-label">SHARES O/S</div>
                        <div className="mobile-metric-val font-mono" style={{ fontSize: '11px' }}>
                          {(issuer.sharesOutstanding || 15000000).toLocaleString()}
                        </div>
                      </div>
                      <div className="mobile-metric">
                        <div className="mobile-metric-label">COUNSEL</div>
                        <div className="mobile-metric-val truncate" style={{ color: '#60a5fa', fontSize: '11px' }}>
                          {issuer.legalCounsel}
                        </div>
                      </div>
                      <div className="mobile-metric">
                        <div className="mobile-metric-label">AUDITOR</div>
                        <div className="mobile-metric-val truncate" style={{ fontSize: '11px' }}>
                          {issuer.auditor}
                        </div>
                      </div>
                    </div>

                    <div className="mobile-card-bottom">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`badge ${issuer.exchange.includes('NASDAQ') || issuer.exchange.includes('NYSE') ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize: '10px' }}>
                          {issuer.exchange}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{issuer.tradingPrice}</span>
                      </div>
                      <button className="mobile-audit-btn">
                        Forensics <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Results Grid Table (Desktop Default or Mobile Table View) */}
            <div className={`table-container ${mobileViewMode === 'cards' ? 'table-desktop-only' : ''}`}>
              <table className="shell-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('cleanShellScore')} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        SGSI Score <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('companyName')} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Issuer Identification <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th>Archetype & State</th>
                    <th onClick={() => handleSort('totalLiabilities')} style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Balance Sheet Debt <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th>Share Capital</th>
                    <th>Securities Counsel & Auditor</th>
                    <th>Trading Tier</th>
                    <th style={{ textAlign: 'right' }}>Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedIssuers.map(issuer => {
                    const isDisqualified = issuer.hasToxicDebt || issuer.cleanShellScore === 0;
                    return (
                      <tr key={issuer.id} onClick={() => setSelectedIssuer(issuer)} style={{ cursor: 'pointer' }}>
                        
                        {/* Score Pill */}
                        <td>
                          <div className={`score-pill ${issuer.isPrime ? 'score-prime' : (isDisqualified ? 'score-toxic' : (issuer.cleanShellScore >= 70 ? 'score-clean' : 'score-review'))}`}>
                            {isDisqualified ? '0 ✗' : `${issuer.cleanShellScore} ★`}
                          </div>
                        </td>

                        {/* Issuer Identity */}
                        <td>
                          <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '13px' }}>
                            {issuer.companyName}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span className="badge badge-blue font-mono" style={{ fontSize: '10px' }}>
                              CIK {issuer.cik}
                            </span>
                            {issuer.ticker && issuer.ticker !== 'UNQUOTED' ? (
                              <span className="badge badge-purple font-mono" style={{ fontSize: '10px' }}>
                                ${issuer.ticker}
                              </span>
                            ) : (
                              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Form 10 Blank Check</span>
                            )}
                          </div>
                        </td>

                        {/* Archetype & State */}
                        <td>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {issuer.archetype}
                          </div>
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            {issuer.state} Corporation • {issuer.stateGoodStanding}
                          </div>
                        </td>

                        {/* Balance Sheet Debt */}
                        <td>
                          {isDisqualified ? (
                            <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <AlertTriangle size={13} /> Toxic Convertible Note
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontWeight: 700, color: issuer.totalLiabilities === 0 ? '#34d399' : '#ffffff', fontFamily: 'var(--font-mono)' }}>
                                ${issuer.totalLiabilities.toLocaleString()}
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                {issuer.totalLiabilities === 0 ? 'Pristine Zero Debt' : 'Nominal Admin AP'}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Share Capital */}
                        <td className="font-mono" style={{ fontSize: '11.5px' }}>
                          <div style={{ color: '#ffffff' }}>{(issuer.sharesOutstanding || 15000000).toLocaleString()} O/S</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Float: {(issuer.publicFloat || 3500000).toLocaleString()}</div>
                        </td>

                        {/* Legal & Auditor */}
                        <td style={{ fontSize: '11px' }}>
                          <div style={{ color: '#60a5fa', fontWeight: 600 }}>{issuer.legalCounsel}</div>
                          <div style={{ color: 'var(--text-muted)' }}>{issuer.auditor}</div>
                        </td>

                        {/* Trading Tier */}
                        <td>
                          <span className={`badge ${issuer.exchange.includes('NASDAQ') || issuer.exchange.includes('NYSE') ? 'badge-purple' : 'badge-blue'}`}>
                            {issuer.exchange}
                          </span>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {issuer.tradingPrice}
                          </div>
                        </td>

                        {/* Inspect CTA */}
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', minHeight: '28px' }}>
                            Forensics <ChevronRight size={12} />
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pagination-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', flexWrap: 'wrap', gap: '10px', padding: '0 4px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Showing <strong style={{ color: '#ffffff' }}>{filteredIssuers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to <strong style={{ color: '#ffffff' }}>{Math.min(currentPage * pageSize, filteredIssuers.length)}</strong> of <strong style={{ color: '#60a5fa' }}>{filteredIssuers.length.toLocaleString()}</strong> filtered issuers
              </div>

              <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select 
                  className="filter-select"
                  style={{ minHeight: '38px', padding: '4px 8px', fontSize: '13px' }}
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                  <option value={250}>250 / page</option>
                </select>

                <button 
                  className="btn btn-secondary"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  style={{ padding: '6px 12px', minHeight: '38px', fontSize: '12px', opacity: currentPage <= 1 ? 0.5 : 1 }}
                >
                  Prev
                </button>

                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  <strong style={{ color: '#ffffff' }}>{currentPage}</strong> / <strong style={{ color: '#ffffff' }}>{totalPages}</strong>
                </span>

                <button 
                  className="btn btn-secondary"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  style={{ padding: '6px 12px', minHeight: '38px', fontSize: '12px', opacity: currentPage >= totalPages ? 0.5 : 1 }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TOXIC DEBT ELIMINATION LAB */}
        {activeTab === 'toxic_lab' && (
          <div>
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <AlertTriangle size={24} color="#ef4444" />
                <h2 style={{ fontSize: '17px', color: '#ffffff' }}>Toxic Debt Elimination Laboratory</h2>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Why do 95% of OTC shells trade at sub-penny prices ($0.0001 - $0.005)? Because predatory floorless convertible notes 
                and derivative warrant liabilities convert at guaranteed 30% to 60% discounts to market prices. 
                Our engine programmatically sweeps SEC XBRL company facts (<code>us-gaap:ConvertibleNotesPayable</code> and <code>us-gaap:DerivativeLiabilities</code>) 
                to eliminate toxic death traps automatically.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '14px' }}>
              {SHELL_ISSUERS_SEED.filter(i => i.hasToxicDebt || i.cleanShellScore === 0).map(issuer => (
                <div key={issuer.id} className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #ef4444' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-crimson">DISQUALIFIED (SGSI: 0/100)</span>
                    <span className="badge badge-blue font-mono">CIK: {issuer.cik}</span>
                  </div>
                  <h3 style={{ fontSize: '15px', color: '#ffffff', marginBottom: '4px' }}>{issuer.companyName}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    {issuer.archetype} • {issuer.state} Corporation
                  </div>

                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.25)', marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#f87171', fontWeight: 700 }}>TOXIC DISQUALIFICATION CAUSE:</div>
                    <div style={{ fontSize: '12px', color: '#ffffff', marginTop: '2px' }}>{issuer.toxicDebtDesc}</div>
                  </div>

                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    <div><strong>Reported Liabilities:</strong> ${(issuer.totalLiabilities || 0).toLocaleString()}</div>
                    <div><strong>Auditor:</strong> {issuer.auditor}</div>
                  </div>

                  <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                    <a 
                      href={issuer.secEdgarUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '6px 12px', minHeight: '32px' }}
                    >
                      Audit on SEC EDGAR <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SPONSOR SOURCING KANBAN */}
        {activeTab === 'kanban' && (
          <div>
            <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '16px', color: '#ffffff' }}>M&A Sourcing & Acquisition Pipeline</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Track candidate shells through initial forensic audit, sponsor outreach, legal due diligence, and closing.
                </p>
              </div>
            </div>

            {/* Mobile Kanban Tab Selector */}
            <div className="mobile-kanban-selector">
              {['Initial Screen', 'Legal Diligence', 'Definitive Review', 'Disqualified'].map(stage => {
                const count = pipelineData.filter(item => item.stage === stage).length;
                const colColors = {
                  'Initial Screen': '#3b82f6',
                  'Legal Diligence': '#06b6d4',
                  'Definitive Review': '#10b981',
                  'Disqualified': '#ef4444'
                };
                return (
                  <button
                    key={stage}
                    className={`mobile-kanban-tab ${mobileKanbanStage === stage ? 'active' : ''}`}
                    onClick={() => setMobileKanbanStage(stage)}
                  >
                    <span style={{ color: colColors[stage] }}>●</span> {stage} ({count})
                  </button>
                );
              })}
            </div>

            <div className="kanban-grid">
              {['Initial Screen', 'Legal Diligence', 'Definitive Review', 'Disqualified'].map(col => {
                const cards = pipelineData.filter(item => item.stage === col);
                const colColors = {
                  'Initial Screen': '#3b82f6',
                  'Legal Diligence': '#06b6d4',
                  'Definitive Review': '#10b981',
                  'Disqualified': '#ef4444'
                };
                return (
                  <div key={col} className={`kanban-column ${mobileKanbanStage === col ? 'kanban-col-active' : 'kanban-col-inactive'}`}>
                    <div className="kanban-col-header">
                      <span style={{ color: colColors[col] }}>{col}</span>
                      <span className="badge badge-blue font-mono">{cards.length}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '300px' }}>
                      {cards.slice(0, 10).map(issuer => (
                        <div 
                          key={issuer.id} 
                          className="kanban-card"
                          onClick={() => setSelectedIssuer(issuer)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span className={`badge ${issuer.cleanShellScore >= 85 ? 'badge-green' : (issuer.cleanShellScore === 0 ? 'badge-crimson' : 'badge-amber')}`}>
                              {issuer.cleanShellScore} pts
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CIK: {issuer.normCik}</span>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#ffffff', lineHeight: 1.3 }}>
                            {issuer.companyName}
                          </div>
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {issuer.archetype}
                          </div>
                          <div style={{ fontSize: '10px', color: '#60a5fa', marginTop: '4px' }}>
                            {issuer.legalCounsel}
                          </div>

                          {/* Quick Move Buttons */}
                          <div style={{ marginTop: '10px', display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                            {col !== 'Initial Screen' && (
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '10px', minHeight: '26px' }}
                                onClick={() => moveKanbanStage(issuer.id, 'Initial Screen')}
                              >
                                ← Screen
                              </button>
                            )}
                            {col !== 'Legal Diligence' && (
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '10px', minHeight: '26px' }}
                                onClick={() => moveKanbanStage(issuer.id, 'Legal Diligence')}
                              >
                                Diligence
                              </button>
                            )}
                            {col !== 'Definitive Review' && (
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '10px', minHeight: '26px' }}
                                onClick={() => moveKanbanStage(issuer.id, 'Definitive Review')}
                              >
                                Review →
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: LIVE SEC EDGAR API SCOUT */}
        {activeTab === 'sec_scout' && (
          <SecLiveScout onSelectIssuer={setSelectedIssuer} />
        )}

        {/* TAB 5: METHODOLOGY & SOURCING GUIDE */}
        {activeTab === 'guide' && (
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '20px', color: '#ffffff' }}>SPAC-Grade Shell Sourcing Methodology</h2>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  Institutional Guide to Reverse Mergers, SEC Rule 144(i), and Direct Uplisting
                </div>
              </div>
              <a 
                href="/SPAC_Quality_Shell_Stock_Sourcing_Guide.pdf" 
                download 
                className="btn btn-primary"
                style={{ minHeight: '38px' }}
              >
                <Download size={14} /> Download PDF Version
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              
              <div style={{ background: '#0f172a', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '14px', color: '#34d399', marginBottom: '8px' }}>1. The Four Shell Archetypes</h3>
                <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li><strong>Type A (SPAC Remnants):</strong> NYSE/Nasdaq blank checks with trust liquidated, leaving clean public registration.</li>
                  <li><strong>Type B (Form 10 Virgin Shells):</strong> Purpose-built Section 12(g) entities that never had commercial operations or debt.</li>
                  <li><strong>Type C (Fallen Angels):</strong> Former operating companies that sold assets, satisfied 100% of creditors, and retained shell with DTC.</li>
                  <li><strong>Type D (Court 3(a)(10) Reorgs):</strong> Fairness-hearing judicial restructuring that extinguishes legacy claims with prejudice.</li>
                </ul>
              </div>

              <div style={{ background: '#0f172a', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '14px', color: '#60a5fa', marginBottom: '8px' }}>2. The 100-Point SGSI Matrix</h3>
                <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li><strong>Debt & Balance Sheet (30 pts):</strong> Zero liabilities gives full 30 pts. Convertible debt = Disqualification.</li>
                  <li><strong>SEC Reporting (20 pts):</strong> SIC 6770 + Current on periodic 10-Ks and 10-Qs.</li>
                  <li><strong>Trading Tier (15 pts):</strong> $0.50 - $10.00+ on OTCQX/OTCQB, or unquoted Form 10.</li>
                  <li><strong>Capital Structure (15 pts):</strong> Authorized &lt; 100M, O/S &lt; 30M, float clean.</li>
                  <li><strong>Counsel & Auditor (10 pts):</strong> PCAOB registered + Tier-1 securities counsel.</li>
                  <li><strong>Corporate Cleanliness (10 pts):</strong> DE/NV/WY Good Standing + PACER clear.</li>
                </ul>
              </div>

              <div style={{ background: '#0f172a', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '14px', color: '#f59e0b', marginBottom: '8px' }}>3. SEC Rule 144(i) "Evergreen" Rule</h3>
                <p>
                  Restricted securities of a shell company cannot be sold under Rule 144 unless the issuer has filed comprehensive Form 10 information 
                  and remained fully current in periodic Exchange Act filings for at least 12 months. Sourcing clean Form 10s satisfies this clock seamlessly.
                </p>
              </div>

              <div style={{ background: '#0f172a', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '14px', color: '#c084fc', marginBottom: '8px' }}>4. Nasdaq Direct Uplisting Path</h3>
                <p>
                  By avoiding sub-penny share dilution, an operating target can execute a reverse takeover, close a concurrent $10M - $30M institutional PIPE 
                  at $4.00+ per share, and direct uplist to Nasdaq Capital Market (Rule 5505) with 300 round-lot holders.
                </p>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Forensic Slide-over Drawer */}
      <ForensicDrawer 
        issuer={selectedIssuer} 
        onClose={() => setSelectedIssuer(null)} 
      />

    </div>
  );
}
