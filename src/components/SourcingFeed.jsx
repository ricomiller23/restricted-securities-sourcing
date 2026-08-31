import React, { useState, useEffect, useRef } from 'react';

export default function SourcingFeed({ onSaveToCrm }) {
  const [date, setDate] = useState('');
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterOtc, setFilterOtc] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedAccessions, setSavedAccessions] = useState(new Set());
  const [feedMessage, setFeedMessage] = useState('');
  const [freshness, setFreshness] = useState(null);
  const [syncProgress, setSyncProgress] = useState(null);
  
  // Contact Card state
  const [activeContactTarget, setActiveContactTarget] = useState(null);
  const [contactLoading, setContactLoading] = useState(false);
  const progressTimerRef = useRef(null);

  const handleOpenContact = async (target) => {
    setActiveContactTarget(target);
    if (!target.issuerPhone && !target.issuerAddress && target.issuerCik) {
      setContactLoading(true);
      try {
        const res = await fetch(`/api/issuers/${target.issuerCik}/contact`);
        if (res.ok) {
          const contact = await res.json();
          setActiveContactTarget(prev => prev ? ({ ...prev, issuerPhone: contact.phone, issuerAddress: contact.address }) : null);
        }
      } catch (err) {
        console.error("Failed to enrich contact:", err);
      } finally {
        setContactLoading(false);
      }
    }
  };

  // 1. Initial Freshness & Active Market Date Resolution
  useEffect(() => {
    const initFreshness = async () => {
      try {
        const res = await fetch('/api/feed/freshness');
        if (res.ok) {
          const info = await res.json();
          setFreshness(info);
          if (info.activeMarketDate && !date) {
            setDate(info.activeMarketDate);
          }
        }
      } catch (err) {
        console.error("Failed to resolve freshness:", err);
      }
    };
    initFreshness();
  }, []);

  const fetchFeed = async () => {
    if (!date) return;
    setLoading(true);
    setError('');
    setFeedMessage('');
    try {
      const res = await fetch(`/api/feed?date=${date}`);
      if (!res.ok) throw new Error(`Server returned error ${res.status}`);
      const data = await res.json();
      
      setTargets(data.targets || []);
      setFeedMessage(data.message || '');
      if (data.freshness) {
        setFreshness(data.freshness);
      }

      // If active background sync is running, start progress polling
      if (data.isSyncing) {
        startProgressPolling();
      } else {
        stopProgressPolling();
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve feed.');
    } finally {
      setLoading(false);
    }
  };

  const startProgressPolling = () => {
    stopProgressPolling();
    progressTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/sync/progress');
        if (res.ok) {
          const progress = await res.json();
          setSyncProgress(progress);
          if (progress.status === 'completed' || progress.status === 'idle') {
            stopProgressPolling();
            fetchFeed(); // Refresh feed immediately upon completion
          }
        }
      } catch (e) {}
    }, 400);
  };

  const stopProgressPolling = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
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

  useEffect(() => {
    if (date) {
      fetchFeed();
      fetchSavedLeads();
    }
    return () => stopProgressPolling();
  }, [date]);

  const handleSave = async (target) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accession: target.accession,
          issuer: target.issuer,
          issuerCik: target.issuerCik,
          seller: target.seller,
          relationship: target.relationship,
          exchange: target.exchange,
          sharesToSell: target.sharesToSell,
          sharesOutstanding: target.sharesOutstanding,
          slicePct: target.slicePct,
          aggregateMktValue: target.aggregateMktValue,
          impliedPrice: target.impliedPrice,
          acquisitionBasis: target.acquisitionBasis,
          isHighValue: target.isHighValue,
          broker: target.broker,
          approxSaleDate: target.approxSaleDate,
          acquiredDate: target.acquiredDate,
          sellerAddress: target.sellerAddress,
          brokerAddress: target.brokerAddress,
          issuerPhone: target.issuerPhone,
          issuerAddress: target.issuerAddress,
          depositWindow: target.depositWindow,
          saleWindow: target.saleWindow,
          score: target.score
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to save lead.');
        return;
      }

      const saved = await res.json();
      onSaveToCrm(saved);
      setSavedAccessions(prev => new Set([...prev, target.accession]));
    } catch (err) {
      alert(err.message);
    }
  };

  const exportToCsv = () => {
    if (!targets.length) return;
    const headers = [
      "Score", "Issuer", "CIK", "Seller", "Relationship", "Exchange",
      "Shares to Sell", "Shares Outstanding", "% of Company",
      "Mkt Value ($)", "Implied Price ($)", "Acquisition Basis", "Broker", 
      "Issuer Address", "Issuer Phone", "Seller Address", "Broker Address",
      "Projected Deposit Timeline", "Projected Sale Timeline", "Filing Accession"
    ];

    const rows = targets.map(t => [
      t.score, t.issuer, t.issuerCik, t.seller, t.relationship, t.exchange,
      t.sharesToSell, t.sharesOutstanding, t.slicePct,
      t.aggregateMktValue, t.impliedPrice, t.acquisitionBasis, t.broker,
      t.issuerAddress, t.issuerPhone, t.sellerAddress, t.brokerAddress,
      t.depositWindow, t.saleWindow, t.accession
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `form144_targets_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTargets = targets.filter(t => {
    if (filterOtc && !t.isOtc) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        t.issuer.toLowerCase().includes(q) ||
        t.seller.toLowerCase().includes(q) ||
        t.acquisitionBasis.toLowerCase().includes(q) ||
        t.broker.toLowerCase().includes(q) ||
        t.issuerCik.includes(q)
      );
    }
    return true;
  });

  const getScoreClass = (score) => {
    if (score >= 75) return 'score-indicator score-high';
    if (score >= 45) return 'score-indicator score-medium';
    return 'score-indicator';
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 24-Hour Freshness Guarantee Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '12px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          gap: '10px',
          borderLeft: freshness?.isFresh ? '4px solid #00e676' : '4px solid #ffab40',
          background: freshness?.isFresh ? 'rgba(0, 230, 118, 0.04)' : 'rgba(255, 171, 64, 0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>{freshness?.isFresh ? '🛡️' : '⚠️'}</span>
          <div>
            <strong style={{ fontSize: '13px', color: freshness?.isFresh ? '#00e676' : '#ffd54f' }}>
              {freshness?.isFresh ? '24-Hour Data Freshness Certified' : 'Historical Data Warning'}
            </strong>
            <div style={{ fontSize: '12px', color: '#b0bec5' }}>
              {freshness?.isFresh 
                ? `Showing verified market date (${date}) within active 24-hour trading session.` 
                : `Selected date is ${freshness?.ageDays || 1} day(s) older than current market window.`}
            </div>
          </div>
        </div>

        {!freshness?.isFresh && freshness?.activeMarketDate && (
          <button
            className="btn-secondary"
            onClick={() => setDate(freshness.activeMarketDate)}
            style={{ padding: '6px 12px', fontSize: '12px', borderColor: '#ffd54f', color: '#ffd54f' }}
          >
            Jump to Latest 24h Date ({freshness.activeMarketDate})
          </button>
        )}
      </div>

      {/* Live Sync Progress Bar (If active SEC ingestion is running) */}
      {syncProgress && syncProgress.status === 'ingesting_xml' && (
        <div
          className="glass-panel"
          style={{
            padding: '16px 20px',
            border: '1px solid rgba(124, 77, 255, 0.4)',
            background: 'rgba(124, 77, 255, 0.08)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
            <span style={{ color: '#d1c4e9', fontWeight: 600 }}>
              ⚡ Ingesting SEC EDGAR Form 144 Filings for {date}...
            </span>
            <strong style={{ color: '#00e676' }}>
              {syncProgress.processed} / {syncProgress.total} ({syncProgress.percent}%)
            </strong>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${syncProgress.percent}%`,
                height: '100%',
                backgroundColor: '#7c4dff',
                transition: 'width 0.2s ease',
                boxShadow: '0 0 10px #7c4dff'
              }}
            />
          </div>
        </div>
      )}

      {/* Main Header & Date Picker */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Form 144 Sourcing Pipeline</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Restricted, volume-capped position sales under $5 share price.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="input-group" style={{ width: '180px' }}>
            <label className="input-label">Select Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>

          <button className="btn-secondary" onClick={fetchFeed} disabled={loading} style={{ alignSelf: 'flex-end', height: '42px' }}>
            Refresh Feed
          </button>

          {targets.length > 0 && (
            <button className="btn-primary" onClick={exportToCsv} style={{ alignSelf: 'flex-end', height: '42px' }}>
              <span>📥 Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Table Panel */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input 
                type="checkbox" 
                checked={filterOtc} 
                onChange={(e) => setFilterOtc(e.target.checked)} 
                style={{ accentColor: 'var(--accent-purple)', width: '16px', height: '16px' }}
              />
              OTC / Pink Sheets Only
            </label>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Showing {filteredTargets.length} of {targets.length} filings (&lt; $5.00)
            </span>
          </div>

          <div style={{ width: '300px' }}>
            <input 
              type="text" 
              placeholder="Search by CIK, issuer, seller, broker..." 
              className="form-control" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="status-dot" style={{ display: 'inline-block', marginBottom: '1rem' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading verified filings from memory...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-danger)' }}>
            <p>⚠️ Error: {error}</p>
            <button className="btn-secondary" onClick={fetchFeed} style={{ marginTop: '1rem' }}>Try Again</button>
          </div>
        ) : filteredTargets.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{feedMessage || 'No targets under $5 found matching the criteria'}</p>
            <p style={{ fontSize: '0.85rem' }}>The selected market date is verified. Filings under $5.00 will appear here once published by SEC EDGAR.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Score</th>
                  <th>Issuer (CIK)</th>
                  <th>Seller</th>
                  <th>Price ($)</th>
                  <th>Position Size</th>
                  <th>Deposit Window</th>
                  <th>Sale Window</th>
                  <th>Broker</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargets.map((t) => {
                  const isSaved = savedAccessions.has(t.accession);
                  return (
                    <tr key={t.accession}>
                      <td>
                        <div className={getScoreClass(t.score)}>{t.score}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.issuer}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          CIK {t.issuerCik} • {t.exchange || 'OTC'}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: 'var(--text-primary)' }}>{t.seller}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.relationship}</div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>
                        ${t.impliedPrice ? t.impliedPrice.toFixed(4) : 'N/A'}
                      </td>
                      <td>
                        <div style={{ color: 'var(--text-primary)' }}>
                          {Number(t.sharesToSell).toLocaleString()} shs
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {t.slicePct}% of company (${Number(t.aggregateMktValue).toLocaleString()})
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">{t.depositWindow}</span>
                      </td>
                      <td>
                        <span className="badge badge-warning">{t.saleWindow}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>{t.broker || 'Direct / Undisclosed'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn-secondary"
                            onClick={() => handleOpenContact(t)}
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            📇 Contact
                          </button>
                          <button
                            className={isSaved ? "btn-secondary" : "btn-primary"}
                            onClick={() => handleSave(t)}
                            disabled={isSaved}
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            {isSaved ? '✓ Saved' : '+ Save'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contact Intelligence Modal */}
      {activeContactTarget && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setActiveContactTarget(null)}
        >
          <div 
            className="glass-panel" 
            style={{ 
              width: '500px', 
              maxWidth: '90vw', 
              padding: '24px', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>📇 Outreach Intelligence</h3>
              <button 
                onClick={() => setActiveContactTarget(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Target Issuer</div>
                <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>{activeContactTarget.issuer}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>CIK: {activeContactTarget.issuerCik}</div>
                <div style={{ marginTop: '6px', color: '#00e676', fontWeight: 500 }}>
                  📞 {activeContactTarget.issuerPhone || 'Phone Not Disclosed on EDGAR'}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                  📍 {activeContactTarget.issuerAddress || 'Address Not Disclosed'}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Seller / Insider</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeContactTarget.seller}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{activeContactTarget.relationship}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                  📍 {activeContactTarget.sellerAddress || 'Seller Address Not Disclosed'}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Filing Broker</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeContactTarget.broker || 'Direct / Undisclosed'}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                  📍 {activeContactTarget.brokerAddress || 'Broker Location Not Disclosed'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button className="btn-secondary" onClick={() => setActiveContactTarget(null)}>Close</button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  handleSave(activeContactTarget);
                  setActiveContactTarget(null);
                }}
              >
                + Add to CRM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
