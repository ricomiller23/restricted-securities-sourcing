import React, { useState, useEffect } from 'react';

export default function SourcingFeed({ onSaveToCrm }) {
  const [date, setDate] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    if (day === 0) d.setDate(d.getDate() - 2); 
    else if (day === 6) d.setDate(d.getDate() - 1); 
    return d.toISOString().split('T')[0];
  });
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterOtc, setFilterOtc] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedAccessions, setSavedAccessions] = useState(new Set());
  const [feedMessage, setFeedMessage] = useState('');
  
  // Contact Card state
  const [activeContactTarget, setActiveContactTarget] = useState(null);

  const fetchFeed = async () => {
    setLoading(true);
    setError('');
    setFeedMessage('');
    try {
      const res = await fetch(`/api/feed?date=${date}`);
      if (!res.ok) throw new Error(`Server returned error ${res.status}`);
      const data = await res.json();
      setTargets(data.targets || []);
      setFeedMessage(data.message || '');
    } catch (err) {
      setError(err.message || 'Failed to retrieve feed.');
    } finally {
      setLoading(false);
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
    fetchFeed();
    fetchSavedLeads();
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
            <p style={{ color: 'var(--text-secondary)' }}>Querying SEC and scoring daily filings...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-danger)' }}>
            <p>⚠️ Error: {error}</p>
            <button className="btn-secondary" onClick={fetchFeed} style={{ marginTop: '1rem' }}>Try Again</button>
          </div>
        ) : filteredTargets.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{feedMessage || 'No targets under $5 found matching the criteria'}</p>
            <p style={{ fontSize: '0.85rem' }}>Try changing the date, clearing search keywords, or checking weekend status.</p>
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
                  <th>Contact Card</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargets.map((t, index) => (
                  <tr key={index}>
                    <td>
                      <span className={getScoreClass(t.score)}>
                        {t.score}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.issuer}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CIK {t.issuerCik}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{t.seller}</div>
                      {t.relationship && <span className="badge badge-control" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', marginTop: '0.2rem', display: 'inline-block' }}>{t.relationship}</span>}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>
                        ${t.impliedPrice.toFixed(2)}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>${t.aggregateMktValue.toLocaleString()}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {t.sharesToSell.toLocaleString()} shs {t.slicePct ? `(${t.slicePct}%)` : ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.depositWindow}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.saleWindow}</div>
                    </td>
                    <td>
                      <button 
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => setActiveContactTarget(t)}
                      >
                        📞 Contact Info
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', boxShadow: 'none' }}
                        onClick={() => handleSave(t)}
                        disabled={savedAccessions.has(t.accession)}
                      >
                        {savedAccessions.has(t.accession) ? '✓ Saved' : '+ Save Lead'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contact Card Modal */}
      {activeContactTarget && (
        <div className="modal-overlay" onClick={() => setActiveContactTarget(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontFamily: 'Outfit' }}>📇 Contact details: {activeContactTarget.issuer}</h3>
              <button className="modal-close" onClick={() => setActiveContactTarget(null)}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ color: 'var(--accent-purple)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>Company Contact</h4>
                <p style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                  <strong>Phone:</strong> {activeContactTarget.issuerPhone || 'Not available'}
                </p>
                <p style={{ fontSize: '0.85rem' }}>
                  <strong>Address:</strong> {activeContactTarget.issuerAddress || 'Not available'}
                </p>
              </div>

              <hr style={{ borderColor: 'var(--glass-border)' }} />

              <div>
                <h4 style={{ color: 'var(--accent-blue)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>Seller Details</h4>
                <p style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                  <strong>Name:</strong> {activeContactTarget.seller}
                </p>
                <p style={{ fontSize: '0.85rem' }}>
                  <strong>Address:</strong> {activeContactTarget.sellerAddress || 'Not available'}
                </p>
              </div>

              {activeContactTarget.broker && (
                <>
                  <hr style={{ borderColor: 'var(--glass-border)' }} />
                  <div>
                    <h4 style={{ color: 'var(--color-success)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>Broker / Clearing House</h4>
                    <p style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                      <strong>Broker:</strong> {activeContactTarget.broker}
                    </p>
                    <p style={{ fontSize: '0.85rem' }}>
                      <strong>Address:</strong> {activeContactTarget.brokerAddress || 'Not available'}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn-secondary" onClick={() => setActiveContactTarget(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
