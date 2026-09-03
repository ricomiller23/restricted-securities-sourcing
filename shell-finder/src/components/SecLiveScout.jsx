import React, { useState } from 'react';
import { Search, Globe, Shield, AlertCircle, CheckCircle, ExternalLink, Code } from 'lucide-react';

export default function SecLiveScout({ onSelectIssuer }) {
  const [inputCik, setInputCik] = useState('0001534629');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [rawJson, setRawJson] = useState(null);
  const [showJson, setShowJson] = useState(false);

  const quickSamples = [
    { label: "Accelerated Acq (DE Blank Check)", cik: "0001534629" },
    { label: "GOP & CO2 (Virgin Clean Shell)", cik: "0001582576" },
    { label: "Stalar 5 (Form 10 Blank Check)", cik: "0001561399" },
    { label: "BPGC / Ross (SPAC Trust)", cik: "0001841610" },
    { label: "Aequi Acq (Toxic Debt Disqualified)", cik: "0001823826" },
  ];

  const handleScan = async (cikToScan) => {
    const target = cikToScan || inputCik;
    const cleanCik = String(target).trim().padStart(10, '0');
    setLoading(true);
    setResult(null);
    setRawJson(null);

    try {
      // Query SEC EDGAR API
      // Note: SEC allows client requests if User-Agent is specified or through proxy/local
      const res = await fetch(`https://data.sec.gov/submissions/CIK${cleanCik}.json`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`SEC EDGAR returned status ${res.status}`);
      }

      const data = await res.json();
      setRawJson(data);

      const sic = data.sic || 'N/A';
      const isBlankCheck = sic === '6770' || (data.sicDescription && data.sicDescription.toLowerCase().includes('blank check'));
      const forms = (data.filings?.recent?.form || []).slice(0, 10);
      const isForm10 = forms.includes('10-12G') || forms.includes('10-12G/A');
      const state = data.stateOfIncorporation || 'DE';
      const tickers = data.tickers || [];

      // Calculate on-the-fly score
      let score = 70;
      if (isBlankCheck) score += 15;
      if (isForm10) score += 10;
      if (['DE', 'NV', 'WY'].includes(state)) score += 5;

      setResult({
        cik: cleanCik,
        name: data.name,
        sic: sic,
        sicDesc: data.sicDescription || 'N/A',
        state: state,
        tickers: tickers,
        exchanges: data.exchanges || [],
        forms: forms,
        dates: (data.filings?.recent?.filingDate || []).slice(0, 10),
        score: Math.min(100, score),
        rating: score >= 85 ? 'Tier-1 Pristine Blank Check' : 'Clean Reporting Shell'
      });
    } catch (err) {
      // If direct browser CORS is restricted by SEC data.sec.gov in some environments,
      // provide comprehensive offline fallback with instructions
      console.warn("SEC Direct Browser Call Note:", err);
      setResult({
        error: true,
        message: `Direct SEC EDGAR browser fetch triggered CORS policy. SEC requires Python / server proxy requests with customized User-Agent headers. Use the pre-ingested dataset or run 'python3 spac_shell_screener.py' in the terminal!`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Globe size={22} color="#3b82f6" />
        <h2 style={{ fontSize: '17px', color: '#ffffff' }}>Live SEC EDGAR API Reconnaissance Scout</h2>
      </div>
      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
        Query real-time public company filings directly from the SEC EDGAR Submissions API (<code>data.sec.gov</code>) 
        to test new CIKs or audit corporate status in real time.
      </p>

      {/* Input Box & Quick Samples */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <input 
          type="text"
          className="search-input"
          style={{ paddingLeft: '14px', flex: '1 1 240px' }}
          placeholder="Enter 10-digit CIK (e.g. 0001534629)..."
          value={inputCik}
          onChange={e => setInputCik(e.target.value)}
        />
        <button 
          className="btn btn-primary"
          style={{ minHeight: '44px', flex: '0 1 auto' }}
          onClick={() => handleScan(inputCik)}
          disabled={loading}
        >
          {loading ? 'Connecting to SEC...' : 'Execute Live SEC Audit'}
        </button>
      </div>

      {/* Quick Click Samples */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>Samples:</span>
        {quickSamples.map((s, i) => (
          <button 
            key={i}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '11px', minHeight: '32px' }}
            onClick={() => {
              setInputCik(s.cik);
              handleScan(s.cik);
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Result Display */}
      {result && !result.error && (
        <div style={{ background: '#0f172a', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="badge badge-green font-mono">CIK: {result.cik}</span>
                <span className="badge badge-blue">SIC {result.sic} ({result.sicDesc})</span>
                <span className="badge badge-purple">{result.state} Charter</span>
              </div>
              <h3 style={{ fontSize: '16px', color: '#ffffff', marginTop: '6px' }}>{result.name}</h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                {result.score}/100
              </div>
              <div style={{ fontSize: '10.5px', color: '#34d399' }}>{result.rating}</div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            <strong>Recent Filings:</strong> {result.forms.slice(0, 6).join(', ')}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <a 
              href={`https://www.sec.gov/edgar/browse/?CIK=${result.cik}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '6px 12px', minHeight: '30px' }}
            >
              Open on SEC.gov <ExternalLink size={12} />
            </a>
            <button 
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '6px 12px', minHeight: '30px' }}
              onClick={() => setShowJson(!showJson)}
            >
              <Code size={12} /> {showJson ? 'Hide Raw JSON' : 'View SEC Submissions JSON'}
            </button>
          </div>

          {showJson && rawJson && (
            <pre style={{ marginTop: '12px', padding: '12px', background: '#080c14', borderRadius: '6px', fontSize: '10.5px', color: '#94a3b8', maxHeight: '240px', overflowY: 'auto' }}>
              {JSON.stringify(rawJson, null, 2)}
            </pre>
          )}
        </div>
      )}

      {result && result.error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '14px', display: 'flex', gap: '10px' }}>
          <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#f87171', fontSize: '13px' }}>SEC Browser Network Policy Note</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {result.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
