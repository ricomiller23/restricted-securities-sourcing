import React, { useState, useEffect } from 'react';

export default function ScoringConfig() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newBasisTerm, setNewBasisTerm] = useState('');
  const [newControlWord, setNewControlWord] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  
  // Backfill state
  const [backfill, setBackfill] = useState({
    status: 'idle',
    totalFilings: 0,
    processedFilings: 0,
    currentDate: '',
    error: null
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBackfillStatus = async () => {
    try {
      const res = await fetch('/api/backfill/status');
      if (res.ok) {
        const data = await res.json();
        setBackfill(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchBackfillStatus();
  }, []);

  // Poll backfill status if active
  useEffect(() => {
    let timer;
    if (backfill.status === 'indexing' || backfill.status === 'fetching') {
      timer = setInterval(fetchBackfillStatus, 2000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [backfill.status]);

  const startBackfill = async () => {
    try {
      const res = await fetch('/api/backfill/start', { method: 'POST' });
      if (res.ok) {
        fetchBackfillStatus();
      }
    } catch (e) {
      alert("Failed to start backfill.");
    }
  };

  const saveSettings = async (updatedSettings = settings) => {
    setSaveMessage('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        setSaveMessage('✓ Configuration saved and applied to daily scoring feeds!');
        setTimeout(() => setSaveMessage(''), 4000);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save configuration.");
    }
  };

  const handleSliderChange = (key, value) => {
    const updated = { ...settings, [key]: parseInt(value) };
    setSettings(updated);
    saveSettings(updated);
  };

  const addBasisTerm = () => {
    if (!newBasisTerm.trim() || settings.high_value_basis_terms.includes(newBasisTerm.trim().toLowerCase())) return;
    const updated = {
      ...settings,
      high_value_basis_terms: [...settings.high_value_basis_terms, newBasisTerm.trim().toLowerCase()]
    };
    setSettings(updated);
    saveSettings(updated);
    setNewBasisTerm('');
  };

  const removeBasisTerm = (term) => {
    const updated = {
      ...settings,
      high_value_basis_terms: settings.high_value_basis_terms.filter(t => t !== term)
    };
    setSettings(updated);
    saveSettings(updated);
  };

  const addControlWord = () => {
    if (!newControlWord.trim() || settings.control_words.includes(newControlWord.trim().toLowerCase())) return;
    const updated = {
      ...settings,
      control_words: [...settings.control_words, newControlWord.trim().toLowerCase()]
    };
    setSettings(updated);
    saveSettings(updated);
    setNewControlWord('');
  };

  const removeControlWord = (word) => {
    const updated = {
      ...settings,
      control_words: settings.control_words.filter(w => w !== word)
    };
    setSettings(updated);
    saveSettings(updated);
  };

  if (loading || !settings) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="status-dot"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading scoring configuration...</p>
      </div>
    );
  }

  const getProgressPercent = () => {
    if (!backfill.totalFilings) return 0;
    return Math.round((backfill.processedFilings / backfill.totalFilings) * 100);
  };

  return (
    <div className="fade-in config-layout">
      {/* Weights Config */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Scoring Parameters & Weights</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Tune coefficients to prioritize leads. Changes are applied in real-time.
          </p>

          {saveMessage && (
            <div style={{ background: 'rgba(0, 230, 70, 0.1)', color: 'var(--color-success)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid rgba(0, 230, 70, 0.2)' }}>
              {saveMessage}
            </div>
          )}

          <div className="slider-group">
            <div className="slider-item">
              <div className="slider-header">
                <span>OTC Issuer Gate (Not Listed on Major Exchanges)</span>
                <span style={{ color: 'var(--accent-blue)' }}>+{settings.weight_otc} pts</span>
              </div>
              <input 
                type="range" 
                className="custom-range"
                min="0" 
                max="100" 
                value={settings.weight_otc}
                onChange={(e) => handleSliderChange('weight_otc', e.target.value)}
              />
            </div>

            <div className="slider-item">
              <div className="slider-header">
                <span>High-Value Acquisition (e.g. Debenture, Debt Settlement)</span>
                <span style={{ color: 'var(--accent-blue)' }}>+{settings.weight_high_val_basis} pts</span>
              </div>
              <input 
                type="range" 
                className="custom-range"
                min="0" 
                max="100" 
                value={settings.weight_high_val_basis}
                onChange={(e) => handleSliderChange('weight_high_val_basis', e.target.value)}
              />
            </div>

            <div className="slider-item">
              <div className="slider-header">
                <span>Filer is Affiliate / Officer / Director</span>
                <span style={{ color: 'var(--accent-blue)' }}>+{settings.weight_control} pts</span>
              </div>
              <input 
                type="range" 
                className="custom-range"
                min="0" 
                max="100" 
                value={settings.weight_control}
                onChange={(e) => handleSliderChange('weight_control', e.target.value)}
              />
            </div>

            <div className="slider-item">
              <div className="slider-header">
                <span>Position Slice is Concentrated (&lt;1% Outstanding)</span>
                <span style={{ color: 'var(--accent-blue)' }}>+{settings.weight_slice_pct} pts</span>
              </div>
              <input 
                type="range" 
                className="custom-range"
                min="0" 
                max="100" 
                value={settings.weight_slice_pct}
                onChange={(e) => handleSliderChange('weight_slice_pct', e.target.value)}
              />
            </div>

            <div className="slider-item">
              <div className="slider-header">
                <span>Maximum Size Boost Cap (Market Value scaling)</span>
                <span style={{ color: 'var(--accent-blue)' }}>Up to +{settings.weight_size_cap} pts</span>
              </div>
              <input 
                type="range" 
                className="custom-range"
                min="0" 
                max="50" 
                value={settings.weight_size_cap}
                onChange={(e) => handleSliderChange('weight_size_cap', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 2026 Historical Backfill Control Panel */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>2026 Historical Backfill Engine</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Pull, parse, and score all 2026 filings. This process runs in the background and is fully resumable.
          </p>

          <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status:</span>
                <strong style={{ 
                  marginLeft: '0.5rem',
                  color: 
                    backfill.status === 'completed' ? 'var(--color-success)' :
                    backfill.status === 'fetching' ? 'var(--accent-purple)' :
                    backfill.status === 'indexing' ? 'var(--accent-blue)' :
                    backfill.status === 'failed' ? 'var(--color-danger)' : 'inherit'
                }}>
                  {backfill.status.toUpperCase()}
                </strong>
              </div>
              
              {(backfill.status === 'idle' || backfill.status === 'completed' || backfill.status === 'failed') && (
                <button className="btn-primary" onClick={startBackfill} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', height: '32px' }}>
                  ⚡ Start Backfill
                </button>
              )}
            </div>

            {(backfill.status === 'indexing' || backfill.status === 'fetching') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>{backfill.status === 'indexing' ? 'Indexing SEC Directories...' : `Processing Date: ${backfill.currentDate}`}</span>
                  <span>{backfill.processedFilings} / {backfill.totalFilings} ({getProgressPercent()}%)</span>
                </div>
                
                {/* Custom Progress Bar */}
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${getProgressPercent()}%`, 
                    height: '100%', 
                    background: 'var(--accent-gradient)',
                    boxShadow: '0 0 8px var(--accent-purple)',
                    transition: 'width 0.5s ease'
                  }}></div>
                </div>
              </div>
            )}

            {backfill.status === 'completed' && (
              <div style={{ fontSize: '0.85rem', color: 'var(--color-success)' }}>
                ✓ Backfill completed! All 2026 filings are fully cached and searchable.
              </div>
            )}

            {backfill.status === 'failed' && (
              <div style={{ fontSize: '0.85rem', color: 'var(--color-danger)' }}>
                ⚠️ Error: {backfill.error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keywords / Dictionaries Config */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* High-Value Acquisition Terms */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>High-Value Acquisition Dictionaries</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Form 144 acquisition nature keywords that trigger the "High-Val" label boost.
          </p>

          <div className="tag-input-container">
            <input 
              type="text" 
              placeholder="Add basis term (e.g. debt, settlement)..." 
              className="form-control"
              value={newBasisTerm}
              onChange={(e) => setNewBasisTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addBasisTerm(); }}
            />
            <button className="btn-primary" onClick={addBasisTerm}>Add</button>
          </div>

          <div className="tag-list">
            {settings.high_value_basis_terms.map(t => (
              <span key={t} className="tag-item">
                {t}
                <button className="tag-remove" onClick={() => removeBasisTerm(t)}>&times;</button>
              </span>
            ))}
          </div>
        </div>

        {/* Affiliate Keywords */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Control / Affiliate Roles</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Filer relationship definitions that mark the target as a restricted control person.
          </p>

          <div className="tag-input-container">
            <input 
              type="text" 
              placeholder="Add relationship keyword (e.g. founder, VP)..." 
              className="form-control"
              value={newControlWord}
              onChange={(e) => setNewControlWord(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addControlWord(); }}
            />
            <button className="btn-primary" onClick={addControlWord}>Add</button>
          </div>

          <div className="tag-list">
            {settings.control_words.map(w => (
              <span key={w} className="tag-item">
                {w}
                <button className="tag-remove" onClick={() => removeControlWord(w)}>&times;</button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
