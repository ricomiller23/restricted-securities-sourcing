import React, { useState, useEffect } from 'react';
import SourcingFeed from './components/SourcingFeed.jsx';
import FilingsRegister from './components/FilingsRegister.jsx';
import CrmBoard from './components/CrmBoard.jsx';
import FtsExplorer from './components/FtsExplorer.jsx';
import ScoringConfig from './components/ScoringConfig.jsx';
import TelemetryDrawer from './components/TelemetryDrawer.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const [crmKey, setCrmKey] = useState(0); 
  const [isBackfilling, setIsBackfilling] = useState(false);

  const fetchBackfillStatus = async () => {
    try {
      const res = await fetch('/api/backfill/status');
      if (res.ok) {
        const data = await res.json();
        setIsBackfilling(data.status === 'indexing' || data.status === 'fetching');
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBackfillStatus();
    const timer = setInterval(fetchBackfillStatus, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveToCrm = (newLead) => {
    setCrmKey(prev => prev + 1);
  };

  const handleNav = (tab) => {
    setActiveTab(tab);
    if (tab === 'crm') {
      setCrmKey(prev => prev + 1);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-section">
          <span className="logo-icon">📊</span>
          <h1 className="logo-text">Scout 144</h1>
        </div>

        <nav className="nav-tabs">
          <button 
            className={`nav-btn ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => handleNav('feed')}
          >
            Sourcing Feed
          </button>
          <button 
            className={`nav-btn ${activeTab === 'filings' ? 'active' : ''}`}
            onClick={() => handleNav('filings')}
          >
            Filings
          </button>
          <button 
            className={`nav-btn ${activeTab === 'crm' ? 'active' : ''}`}
            onClick={() => handleNav('crm')}
          >
            CRM Board
          </button>
          <button 
            className={`nav-btn ${activeTab === 'fts' ? 'active' : ''}`}
            onClick={() => handleNav('fts')}
          >
            FTS Explorer
          </button>
          <button 
            className={`nav-btn ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => handleNav('config')}
          >
            Configurator
          </button>
        </nav>

        <div className="header-meta" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isBackfilling && (
            <div className="system-status" style={{ borderColor: 'var(--accent-purple)', background: 'rgba(124, 77, 255, 0.05)' }}>
              <span className="status-dot" style={{ backgroundColor: 'var(--accent-purple)', boxShadow: '0 0 8px var(--accent-purple)' }}></span>
              <span style={{ color: '#d1c4e9', fontWeight: 600 }}>⚡ Backfilling 2026 History...</span>
            </div>
          )}
          <div className="system-status">
            <span className="status-dot"></span>
            <span>SEC Edgar Live</span>
          </div>
          <TelemetryDrawer />
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'feed' && <SourcingFeed onSaveToCrm={handleSaveToCrm} />}
        {activeTab === 'filings' && <FilingsRegister onSaveToCrm={handleSaveToCrm} />}
        {activeTab === 'crm' && <CrmBoard key={crmKey} />}
        {activeTab === 'fts' && <FtsExplorer />}
        {activeTab === 'config' && <ScoringConfig />}
      </main>
    </div>
  );
}
